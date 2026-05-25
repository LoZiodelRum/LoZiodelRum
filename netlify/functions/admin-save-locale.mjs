import { createClient } from "@supabase/supabase-js";
import { removeEmptyFields } from "./dbSafety.mjs";

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

  if (mode === "delete") {
    return { statusCode: 403, body: JSON.stringify({ ok: false, message: "Physical delete disabled by safety policy" }) };
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

  const isMissingTableError = (message) => {
    const msg = (message || "").toLowerCase();
    return (
      msg.includes("could not find the table") ||
      (msg.includes("relation") && msg.includes("does not exist"))
    );
  };

  const extractMissingColumn = (message) => {
    const singleQuoteMatch = (message || "").match(/could not find the '([^']+)' column/i);
    if (singleQuoteMatch?.[1]) return singleQuoteMatch[1];
    const doubleQuoteMatch = (message || "").match(/column\s+"([^"]+)"/i);
    if (doubleQuoteMatch?.[1]) return doubleQuoteMatch[1];
    return null;
  };

  const isEmptyObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return true;
    return Object.keys(value).length === 0;
  };

  const normalizeCoordinate = (value) => {
    const normalized = String(value ?? "").trim().replace(/,/g, ".");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  const tableCandidates = ["Locali", "locali"];
  let lastError = "Could not save locale";

  for (const tableName of tableCandidates) {
    try {
      let safeChanges = mode === "delete" ? null : { ...changes };
      if (safeChanges) {
        if (mode === "create") {
          safeChanges.latitudine = normalizeCoordinate(safeChanges.latitudine);
          safeChanges.longitudine = normalizeCoordinate(safeChanges.longitudine);
        } else {
          if (hasOwn(safeChanges, "latitudine")) {
            const parsedLat = normalizeCoordinate(safeChanges.latitudine);
            if (parsedLat === null) {
              delete safeChanges.latitudine;
            } else {
              safeChanges.latitudine = parsedLat;
            }
          }

          if (hasOwn(safeChanges, "longitudine")) {
            const parsedLng = normalizeCoordinate(safeChanges.longitudine);
            if (parsedLng === null) {
              delete safeChanges.longitudine;
            } else {
              safeChanges.longitudine = parsedLng;
            }
          }
        }

        const cleaned = removeEmptyFields(safeChanges);
        Object.keys(safeChanges).forEach((key) => {
          if (!(key in cleaned)) {
            delete safeChanges[key];
          }
        });
        Object.assign(safeChanges, cleaned);
      }
      if (mode === "create") {
        while (true) {
          const { data, error } = await supabaseAdmin.from(tableName).insert([safeChanges]).select("id");
          if (!error && data && data.length > 0) {
            return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: data[0].id }) };
          }
          lastError = error?.message || `No row inserted into ${tableName}`;
          const missingColumn = extractMissingColumn(lastError);
          if (missingColumn && safeChanges && Object.prototype.hasOwnProperty.call(safeChanges, missingColumn)) {
            delete safeChanges[missingColumn];
            continue;
          }
          if (!isMissingTableError(lastError)) {
            return { statusCode: 500, body: JSON.stringify({ ok: false, message: lastError }) };
          }
          break;
        }
      } else if (mode === "update") {
        while (true) {
          if (isEmptyObject(safeChanges)) {
            return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id, noop: true }) };
          }

          console.log("PATCH UPDATE:", safeChanges);
          const { data, error } = await supabaseAdmin.from(tableName).update(safeChanges).eq("id", id).select("id");
          if (!error && data && data.length > 0) {
            return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: data[0].id }) };
          }
          lastError = error?.message || `No row updated in ${tableName}`;
          const missingColumn = extractMissingColumn(lastError);
          if (missingColumn && safeChanges && Object.prototype.hasOwnProperty.call(safeChanges, missingColumn)) {
            delete safeChanges[missingColumn];
            continue;
          }
          if (!error) {
            const { data: existingRow, error: existenceError } = await supabaseAdmin
              .from(tableName)
              .select("id")
              .eq("id", id)
              .maybeSingle();

            if (!existenceError && existingRow?.id) {
              return { statusCode: 200, body: JSON.stringify({ ok: true, table: tableName, id: existingRow.id, noop: true }) };
            }
          }
          if (!isMissingTableError(lastError)) {
            return { statusCode: 500, body: JSON.stringify({ ok: false, message: lastError }) };
          }
          break;
        }
      }
    } catch (e) {
      lastError = e?.message || String(e);
    }
  }

  return { statusCode: 500, body: JSON.stringify({ ok: false, message: lastError }) };
}
