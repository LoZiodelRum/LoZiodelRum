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

  const mode = req.body?.mode;
  const targetTable = req.body?.table || "vini";
  const id = req.body?.id;
  const changes = req.body?.changes;

  if (!mode || !["create", "update"].includes(mode)) {
    return res.status(400).json({ ok: false, message: "Invalid mode" });
  }

  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return res.status(400).json({ ok: false, message: "Missing changes payload" });
  }

  if (changes.image !== undefined && changes.immagine === undefined) {
    changes.immagine = changes.image;
    delete changes.image;
  }

  const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
  if (mode === "update" && !hasValidId) {
    return res.status(400).json({ ok: false, message: "Missing id for update" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tableCandidates = [targetTable, targetTable === "vini" ? "Vini" : "vini"];
  let lastError = "Could not save wine";

  for (const tableName of tableCandidates) {
    try {
      if (mode === "create") {
        const { data, error } = await supabaseAdmin.from(tableName).insert([changes]).select("id");
        if (!error && data && data.length > 0) {
          return res.status(200).json({ ok: true, table: tableName, id: data[0].id });
        }
        lastError = error?.message || `No row inserted into ${tableName}`;
      } else {
        const { data, error } = await supabaseAdmin.from(tableName).update(changes).eq("id", id).select("id");
        if (!error && data && data.length > 0) {
          return res.status(200).json({ ok: true, table: tableName, id: data[0].id });
        }
        lastError = error?.message || `No row updated in ${tableName}`;
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    }
  }

  return res.status(500).json({ ok: false, message: lastError });
}
