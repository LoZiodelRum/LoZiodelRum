import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

function mergeProfilesWithAuth(profiles, authUsers) {
  const authById = new Map(authUsers.map((user) => [user.id, user]));
  return profiles.map((profile) => {
    const authUser = authById.get(profile.id);
    return {
      ...profile,
      email: profile.email || authUser?.email || null,
      ultimo_accesso: authUser?.last_sign_in_at || null,
      email_verificata: Boolean(authUser?.email_confirmed_at),
    };
  });
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
    return json(500, { ok: false, message: "Server env not configured" });
  }

  const headerPassword = event.headers?.["x-admin-password"] || event.headers?.["X-Admin-Password"];
  if (!headerPassword || headerPassword !== ADMIN_PASSWORD) {
    return json(401, { ok: false, message: "Unauthorized" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const authUsersResponse = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const authUsers = authUsersResponse.data?.users || [];

  const tableCandidates = ["Profili", "profili"];
  let lastError = "Could not load profiles";

  for (const tableName of tableCandidates) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false, nullsFirst: false });

    if (!error) {
      return json(200, { ok: true, table: tableName, profiles: mergeProfilesWithAuth(data || [], authUsers) });
    }

    lastError = error.message || lastError;
    const err = lastError.toLowerCase();
    const isMissingTable = err.includes("could not find the table") || (err.includes("relation") && err.includes("does not exist"));
    if (!isMissingTable) {
      return json(500, { ok: false, message: lastError });
    }
  }

  return json(500, { ok: false, message: lastError });
}