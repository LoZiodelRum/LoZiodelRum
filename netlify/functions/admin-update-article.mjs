import { createClient } from "@supabase/supabase-js";
import { removeEmptyFields } from "./dbSafety.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: "Method not allowed" }),
    };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Server env not configured" }),
    };
  }

  const headerPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
  if (!headerPassword || headerPassword !== ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, message: "Unauthorized" }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Invalid JSON body" }),
    };
  }

  const id = parsed?.id;
  const slug = typeof parsed?.slug === "string" ? parsed.slug.trim() : "";
  const changes = parsed?.changes;
  const safeChanges = removeEmptyFields({ ...(changes || {}) });

  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Missing changes payload" }),
    };
  }

  if (Object.keys(safeChanges).length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, noop: true }),
    };
  }

  const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
  if (!hasValidId && !slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Missing id/slug for target record" }),
    };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("PATCH UPDATE:", safeChanges);
  let query = supabaseAdmin.from("articoli").update(safeChanges);
  query = hasValidId ? query.eq("id", id) : query.eq("slug", slug);

  const { data, error } = await query.select("id,slug");

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: error.message }),
    };
  }

  if (!data || data.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ ok: false, message: "No article updated" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, updated: data[0] }),
  };
}
