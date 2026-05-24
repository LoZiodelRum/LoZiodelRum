import { createClient } from "@supabase/supabase-js";

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: any) => void;
};

type GenericRow = Record<string, any>;

const env = ((globalThis as any)?.process?.env || {}) as Record<string, string | undefined>;
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function parseBearer(headers: Record<string, string | string[] | undefined>): string | null {
  const auth = headers.authorization || headers.Authorization;
  if (!auth) return null;
  const authValue = Array.isArray(auth) ? auth[0] : auth;
  if (!authValue) return null;
  const match = authValue.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function pickFirstNumber(row: GenericRow, keys: string[]): number | null {
  for (const key of keys) {
    const parsed = Number(row?.[key]);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function pickFirstText(row: GenericRow, keys: string[]): string {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

async function resolveColumn(
  supabaseAdmin: ReturnType<typeof createClient>,
  table: string,
  candidates: string[]
): Promise<string | null> {
  for (const column of candidates) {
    const probe = await supabaseAdmin.from(table).select(column).limit(1);
    if (!probe.error) return column;
  }
  return null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, message: "Server env not configured" });
  }

  const localeId = req.body?.localeId;
  if (localeId === undefined || localeId === null || String(localeId).trim() === "") {
    return res.status(400).json({ ok: false, message: "Missing localeId" });
  }

  const accessToken = parseBearer(req.headers);
  if (!accessToken) {
    return res.status(401).json({ ok: false, message: "Missing bearer token" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userRes = await supabaseAdmin.auth.getUser(accessToken);
  const authUser = userRes.data.user;
  if (userRes.error || !authUser) {
    return res.status(401).json({ ok: false, message: "Invalid auth token" });
  }

  const checkinsUserColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["user_id", "utente_id", "profile_id"]);
  const checkinsLocaleColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["locale_id", "local_id", "venue_id"]);
  const checkinsCreatedColumn = await resolveColumn(supabaseAdmin, "drinkwise_checkins", ["created_at", "checkin_at", "createdAt"]);

  if (!checkinsUserColumn || !checkinsLocaleColumn) {
    return res.status(500).json({ ok: false, message: "Check-in schema not compatible" });
  }

  const insertPayload: GenericRow = {
    [checkinsUserColumn]: authUser.id,
    [checkinsLocaleColumn]: localeId,
  };
  if (checkinsCreatedColumn) {
    insertPayload[checkinsCreatedColumn] = new Date().toISOString();
  }

  const inserted = await supabaseAdmin.from("drinkwise_checkins").insert([insertPayload]).select("id").maybeSingle();
  if (inserted.error) {
    return res.status(500).json({ ok: false, message: inserted.error.message || "Check-in insert failed" });
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

    const existingBadgeIds = new Set<string>(
      (existingRes.data || [])
        .map((row: GenericRow) => String(row?.[userBadgesBadgeColumn] ?? "").trim())
        .filter(Boolean)
    );

    const withThreshold = (badgesRes.data || [])
      .map((badge: GenericRow) => {
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
      .sort((a: any, b: any) => (a.threshold ?? Number.MAX_SAFE_INTEGER) - (b.threshold ?? Number.MAX_SAFE_INTEGER));

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

  return res.status(200).json({ ok: true, totalCheckins });
}
