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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
    return res.status(500).json({ ok: false, message: "Server env not configured" });
  }

  const headerPassword = req.headers["x-admin-password"];
  if (!headerPassword || headerPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const id = req.body?.id;
  const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";
  const changes = req.body?.changes;

  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return res.status(400).json({ ok: false, message: "Missing changes payload" });
  }

  const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
  if (!hasValidId && !slug) {
    return res.status(400).json({ ok: false, message: "Missing id/slug for target record" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = supabaseAdmin.from("articoli").update(changes);
  query = hasValidId ? query.eq("id", id) : query.eq("slug", slug);

  const { data, error } = await query.select("id,slug");

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ ok: false, message: "No article updated" });
  }

  return res.status(200).json({ ok: true, updated: data[0] });
}
