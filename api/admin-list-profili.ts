import { createClient } from "@supabase/supabase-js";

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: any) => void;
};

const env = ((globalThis as any)?.process?.env || {}) as Record<string, string | undefined>;
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD;

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

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tableCandidates = ["Profili", "profili"];
  let lastError = "Could not load profiles";

  for (const tableName of tableCandidates) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false, nullsFirst: false });

    if (!error) {
      return res.status(200).json({ ok: true, table: tableName, profiles: data || [] });
    }

    lastError = error.message || lastError;
    const err = lastError.toLowerCase();
    const isMissingTable = err.includes("could not find the table") || (err.includes("relation") && err.includes("does not exist"));
    if (!isMissingTable) {
      return res.status(500).json({ ok: false, message: lastError });
    }
  }

  return res.status(500).json({ ok: false, message: lastError });
}