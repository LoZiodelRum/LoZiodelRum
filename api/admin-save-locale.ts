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

  const mode = req.body?.mode;
  const id = req.body?.id;
  const changes = req.body?.changes;

  if (!mode || !["create", "update", "delete"].includes(mode)) {
    return res.status(400).json({ ok: false, message: "Invalid mode" });
  }

  if (mode !== "delete" && (!changes || typeof changes !== "object" || Array.isArray(changes))) {
    return res.status(400).json({ ok: false, message: "Missing changes payload" });
  }

  const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
  if ((mode === "update" || mode === "delete") && !hasValidId) {
    return res.status(400).json({ ok: false, message: "Missing id for update/delete" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const isMissingTableError = (message: string) => {
    const msg = (message || "").toLowerCase();
    return (
      msg.includes("could not find the table") ||
      msg.includes("relation") && msg.includes("does not exist")
    );
  };

  const extractMissingColumn = (message: string) => {
    const singleQuoteMatch = message.match(/could not find the '([^']+)' column/i);
    if (singleQuoteMatch?.[1]) return singleQuoteMatch[1];
    const doubleQuoteMatch = message.match(/column\s+"([^"]+)"/i);
    if (doubleQuoteMatch?.[1]) return doubleQuoteMatch[1];
    return null;
  };

  const isEmptyObject = (value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return true;
    return Object.keys(value as Record<string, unknown>).length === 0;
  };

  const normalizeCoordinate = (value: unknown) => {
    const normalized = String(value ?? "").trim().replace(/,/g, ".");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const tableCandidates = ["Locali", "locali"];
  let lastError = "Could not save locale";

  for (const tableName of tableCandidates) {
    try {
      const safeChanges = mode === "delete" ? null : { ...changes };
      if (safeChanges) {
        safeChanges.latitudine = normalizeCoordinate(safeChanges.latitudine);
        safeChanges.longitudine = normalizeCoordinate(safeChanges.longitudine);
      }
      if (mode === "create") {
        while (true) {
          const { data, error } = await supabaseAdmin.from(tableName).insert([safeChanges]).select("id");
          if (!error && data && data.length > 0) {
            return res.status(200).json({ ok: true, table: tableName, id: data[0].id });
          }
          lastError = error?.message || `No row inserted into ${tableName}`;
          const missingColumn = extractMissingColumn(lastError);
          if (missingColumn && safeChanges && missingColumn in safeChanges) {
            delete (safeChanges as Record<string, any>)[missingColumn];
            continue;
          }
          if (!isMissingTableError(lastError)) {
            return res.status(500).json({ ok: false, message: lastError });
          }
          break;
        }
      } else if (mode === "update") {
        while (true) {
          if (isEmptyObject(safeChanges)) {
            return res.status(200).json({ ok: true, table: tableName, id, noop: true });
          }

          const { data, error } = await supabaseAdmin.from(tableName).update(safeChanges).eq("id", id).select("id");
          if (!error && data && data.length > 0) {
            return res.status(200).json({ ok: true, table: tableName, id: data[0].id });
          }
          lastError = error?.message || `No row updated in ${tableName}`;
          const missingColumn = extractMissingColumn(lastError);
          if (missingColumn && safeChanges && missingColumn in safeChanges) {
            delete (safeChanges as Record<string, any>)[missingColumn];
            continue;
          }
          if (!error) {
            const { data: existingRow, error: existenceError } = await supabaseAdmin
              .from(tableName)
              .select("id")
              .eq("id", id)
              .maybeSingle();

            if (!existenceError && existingRow?.id) {
              return res.status(200).json({ ok: true, table: tableName, id: existingRow.id, noop: true });
            }
          }
          if (!isMissingTableError(lastError)) {
            return res.status(500).json({ ok: false, message: lastError });
          }
          break;
        }
      } else {
        const { data, error } = await supabaseAdmin.from(tableName).delete().eq("id", id).select("id");
        if (!error && data && data.length > 0) {
          return res.status(200).json({ ok: true, table: tableName, id: data[0].id });
        }
        lastError = error?.message || `No row deleted in ${tableName}`;
        if (!isMissingTableError(lastError)) {
          return res.status(500).json({ ok: false, message: lastError });
        }
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    }
  }

  return res.status(500).json({ ok: false, message: lastError });
}
