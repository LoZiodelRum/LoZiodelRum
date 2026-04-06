import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, message: "Method not allowed" }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: "Server env not configured" }) };
  }

  const headerPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
  if (!headerPassword || headerPassword !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, message: "Unauthorized" }) };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Invalid JSON body" }) };
  }

  const mode = parsed?.mode;
  const id = parsed?.id;
  const changes = parsed?.changes;

  if (!mode || !["create", "update", "delete"].includes(mode)) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Invalid mode" }) };
  }

  if (mode !== "delete" && (!changes || typeof changes !== "object" || Array.isArray(changes))) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Missing changes payload" }) };
  }

  const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
  if ((mode === "update" || mode === "delete") && !hasValidId) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Missing id for update/delete" }) };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tableCandidates = ["cocktail", "cocktails"];
  let lastError = "Could not save cocktail";

  for (const tableName of tableCandidates) {
    try {
      if (mode === "create") {
        const { data, error } = await supabaseAdmin.from(tableName).insert([changes]).select("id");
        if (!error && data && data.length > 0) {
          return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: data[0].id }) };
        }
        lastError = error?.message || `No row inserted into ${tableName}`;
      } else if (mode === "update") {
        const { data, error } = await supabaseAdmin.from(tableName).update(changes).eq("id", id).select("id");
        if (!error && data && data.length > 0) {
          return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: data[0].id }) };
        }
        lastError = error?.message || `No row updated in ${tableName}`;
      } else {
        const { data, error } = await supabaseAdmin.from(tableName).delete().eq("id", id).select("id");
        if (!error && data && data.length > 0) {
          return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: data[0].id }) };
        }
        lastError = error?.message || `No row deleted in ${tableName}`;
      }
    } catch (e) {
      lastError = e?.message || String(e);
    }
  }

  return { statusCode: 500, body: JSON.stringify({ ok: false, message: lastError }) };
}
