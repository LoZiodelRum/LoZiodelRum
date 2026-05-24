import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pickFirstNumber = (row, keys) => {
  for (const key of keys) {
    const parsed = Number(row?.[key]);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const pickFirstText = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const resolveColumn = async (supabaseAdmin, table, candidates) => {
  for (const column of candidates) {
    const probe = await supabaseAdmin.from(table).select(column).limit(1);
    if (!probe.error) return column;
  }
  return null;
};

const parseBearer = (headers) => {
  const auth = headers?.authorization || headers?.Authorization;
  if (!auth) return null;
  const authValue = Array.isArray(auth) ? auth[0] : auth;
  if (!authValue) return null;
  const match = String(authValue).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, message: "Method not allowed" }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: "Server env not configured" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Invalid JSON body" }) };
  }

  const localeId = body?.localeId;
  if (localeId === undefined || localeId === null || String(localeId).trim() === "") {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Missing localeId" }) };
  }

  const token = parseBearer(event.headers || {});
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, message: "Missing bearer token" }) };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userRes = await supabaseAdmin.auth.getUser(token);
  const authUser = userRes?.data?.user;
  if (userRes.error || !authUser) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, message: "Invalid auth token" }) };
  }

  const checkinsUserColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["user_id", "utente_id", "profile_id"]);
  const checkinsLocaleColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["locale_id", "local_id", "venue_id"]);
  const checkinsCreatedColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["created_at", "checkin_at", "createdAt"]);

  if (!checkinsUserColumn || !checkinsLocaleColumn) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: "Check-in schema not compatible" }) };
  }

  const insertPayload = {
    [checkinsUserColumn]: authUser.id,
    [checkinsLocaleColumn]: localeId,
  };
  if (checkinsCreatedColumn) {
    insertPayload[checkinsCreatedColumn] = new Date().toISOString();
  }

  const inserted = await supabaseAdmin.from("drinkwise_checkins").insert([insertPayload]).select("id").maybeSingle();
  if (inserted.error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: inserted.error.message || "Check-in insert failed" }) };
  }

  const countRes = await supabaseAdmin
    .from("drinkwise_checkins")
    .select("id", { count: "exact", head: true })
    .eq(checkinsUserColumn, authUser.id);

  const totalCheckins = countRes.count || 0;

  const badgesRes = await supabaseAdmin.from("drinkwise_badges").select("*").limit(500);
  const userBadgesUserColumn = await resolveColumn(supabaseAdmin, "drinkwise_user_badges", ["user_id", "utente_id", "profile_id"]);
  const userBadgesBadgeColumn = await resolveColumn(supabaseAdmin, "drinkwise_user_badges", ["badge_id"]);

  if (!badgesRes.error && userBadgesUserColumn && userBadgesBadgeColumn) {
    const existingRes = await supabaseAdmin
      .from("drinkwise_user_badges")
      .select("*")
      .eq(userBadgesUserColumn, authUser.id)
      .limit(500);

    const existingBadgeIds = new Set(
      (existingRes.data || [])
        .map((row) => String(row?.[userBadgesBadgeColumn] ?? "").trim())
        .filter(Boolean)
    );

    const withThreshold = (badgesRes.data || [])
      .map((badge) => {
        const explicitThreshold = pickFirstNumber(badge, [
          "soglia",
          "threshold",
          "required_checkins",
          "min_checkins",
          "checkins_needed",
          "target",
        ]);

        if (explicitThreshold !== null) {
          return { badge, threshold: explicitThreshold };
        }

        const textSource = `${pickFirstText(badge, ["nome", "title", "name"])} ${pickFirstText(
          badge,
          ["descrizione", "description"]
        )}`;
        const parsed = Number((textSource.match(/\d+/) || [""])[0]);
        return { badge, threshold: Number.isFinite(parsed) && parsed > 0 ? parsed : null };
      })
      .sort((a, b) => (a.threshold ?? Number.MAX_SAFE_INTEGER) - (b.threshold ?? Number.MAX_SAFE_INTEGER));

    for (const item of withThreshold) {
      if (item.threshold === null || totalCheckins < item.threshold) continue;
      const badgeId = String(item.badge?.id ?? "").trim();
      if (!badgeId || existingBadgeIds.has(badgeId)) continue;

      const assignPayload = {
        [userBadgesUserColumn]: authUser.id,
        [userBadgesBadgeColumn]: item.badge.id,
      };

      const assignRes = await supabaseAdmin.from("drinkwise_user_badges").insert([assignPayload]);
      if (!assignRes.error) {
        existingBadgeIds.add(badgeId);
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, totalCheckins }) };
}
