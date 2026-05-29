import { createClient } from "@supabase/supabase-js";
import { removeEmptyFields } from "./dbSafety";

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

const READONLY_FIELDS = new Set(["ultimo_accesso", "email_verificata"]);
const ARRAY_FIELDS = new Set(["badges", "recensioni", "cocktail_creati", "locali_segnalati", "preferiti"]);
const NUMBER_FIELDS = new Set([
  "level",
  "points",
  "numero_recensioni",
  "numero_locali_visitati",
  "numero_cocktail_creati",
  "esperienza_anni",
  "numero_dipendenti",
]);

function normalizeArrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const raw = String(value ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated parsing.
  }

  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeProfileChanges(changes: Record<string, any>) {
  const normalized = { ...changes };

  Object.keys(normalized).forEach((key) => {
    if (READONLY_FIELDS.has(key) || key === "password") {
      delete normalized[key];
      return;
    }

    if (ARRAY_FIELDS.has(key)) {
      normalized[key] = normalizeArrayValue(normalized[key]);
      return;
    }

    if (NUMBER_FIELDS.has(key)) {
      const raw = normalized[key];
      normalized[key] = raw === null || raw === undefined || raw === "" ? 0 : Number(raw);
      if (Number.isNaN(normalized[key])) {
        normalized[key] = 0;
      }
      return;
    }

    if (typeof normalized[key] === "string") {
      normalized[key] = normalized[key].trim();
    }
  });

  if (!normalized.status) {
    normalized.status = normalized.ruolo === "admin" ? "admin" : normalized.approvato ? "attivo" : "sospeso";
  }

  return normalized;
}

async function upsertProfile(supabaseAdmin: any, profile: Record<string, any>) {
  const tableCandidates = ["Profili", "profili"];
  let lastError = "Could not save profile";

  for (const tableName of tableCandidates) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .upsert([profile], { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("ADMIN SAVE PROFILI ERROR", error);
      console.error("ADMIN SAVE PROFILI PAYLOAD", profile);
      console.error("QUERY", {
        op: "upsert",
        table: tableName,
        onConflict: "id",
      });
    }

    if (!error) {
      return { data, tableName, error: null };
    }

    lastError = error.message || lastError;
    const err = lastError.toLowerCase();
    const isMissingTable = err.includes("could not find the table") || (err.includes("relation") && err.includes("does not exist"));
    if (!isMissingTable) {
      return { data: null, tableName, error };
    }
  }

  return { data: null, tableName: null, error: { message: lastError } };
}

async function deleteProfileRow(supabaseAdmin: any, id: string) {
  const tableCandidates = ["Profili", "profili"];
  let lastError = "Could not delete profile";

  for (const tableName of tableCandidates) {
    const { error } = await supabaseAdmin.from(tableName).delete().eq("id", id);
    if (!error) {
      return { ok: true, tableName };
    }

    lastError = error.message || lastError;
    const err = lastError.toLowerCase();
    const isMissingTable = err.includes("could not find the table") || (err.includes("relation") && err.includes("does not exist"));
    if (!isMissingTable) {
      return { ok: false, tableName, error };
    }
  }

  return { ok: false, tableName: null, error: { message: lastError } };
}

function toErrorResponse(error: any, fallbackMessage = "Errore salvataggio profilo") {
  return {
    ok: false,
    message: error?.message || fallbackMessage,
    code: error?.code || null,
    details: error?.details || null,
    hint: error?.hint || null,
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
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
    const id = String(req.body?.id || "").trim() || null;
    const changes = req.body?.changes;

    if (!mode || !["create", "update", "delete"].includes(mode)) {
      return res.status(400).json({ ok: false, message: "Invalid mode" });
    }

    if (mode === "delete") {
      return res.status(403).json({ ok: false, message: "Physical delete disabled by safety policy" });
    }

    if (mode !== "delete" && (!changes || typeof changes !== "object" || Array.isArray(changes))) {
      return res.status(400).json({ ok: false, message: "Missing changes payload" });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const password = String(changes.password || "").trim();
    const normalizedChanges = removeEmptyFields(normalizeProfileChanges(changes));
    const email = String(normalizedChanges.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ ok: false, message: "Email obbligatoria" });
    }

    if (mode === "create") {
      if (!password) {
        return res.status(400).json({ ok: false, message: "Password obbligatoria per creare un utente" });
      }

      const authResponse = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome: normalizedChanges.nome || null,
          cognome: normalizedChanges.cognome || null,
          username: normalizedChanges.username || null,
          telefono: normalizedChanges.telefono || null,
          ruolo: normalizedChanges.ruolo || "utente",
        },
      });

      if (authResponse.error || !authResponse.data.user?.id) {
        console.error("ADMIN SAVE PROFILI ERROR", authResponse.error);
        console.error("ADMIN SAVE PROFILI PAYLOAD", {
          mode,
          authPayload: {
            email,
            email_confirm: true,
            user_metadata: {
              nome: normalizedChanges.nome || null,
              cognome: normalizedChanges.cognome || null,
              username: normalizedChanges.username || null,
              telefono: normalizedChanges.telefono || null,
              ruolo: normalizedChanges.ruolo || "utente",
            },
          },
        });
        return res.status(500).json(toErrorResponse(authResponse.error, "User creation failed"));
      }

      const profilePayload = {
        ...normalizedChanges,
        id: authResponse.data.user.id,
        email,
      };

      console.log("PATCH UPDATE:", profilePayload);

      const savedProfile = await upsertProfile(supabaseAdmin, profilePayload);
      if (savedProfile.error) {
        console.error("ADMIN SAVE PROFILI ERROR", savedProfile.error);
        console.error("ADMIN SAVE PROFILI PAYLOAD", profilePayload);
        await supabaseAdmin.auth.admin.deleteUser(authResponse.data.user.id).catch(() => undefined);
        return res.status(500).json(toErrorResponse(savedProfile.error, "Profile save failed"));
      }

      return res.status(200).json({ ok: true, profile: savedProfile.data, id: authResponse.data.user.id, table: savedProfile.tableName });
    }

    if (!id) {
      return res.status(400).json({ ok: false, message: "Missing id" });
    }

    const authUpdates: Record<string, any> = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;
    if (typeof changes.email_verificata === "boolean" && changes.email_verificata) {
      authUpdates.email_confirm = true;
    }

    if (Object.keys(authUpdates).length > 0) {
      const authUpdate = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authUpdate.error) {
        console.error("ADMIN SAVE PROFILI ERROR", authUpdate.error);
        console.error("ADMIN SAVE PROFILI PAYLOAD", {
          mode,
          id,
          authUpdates,
        });
        return res.status(500).json(toErrorResponse(authUpdate.error, "User update failed"));
      }
    }

    const profilePayload = {
      ...normalizedChanges,
      id,
      email,
      updated_at: new Date().toISOString(),
    };

    console.log("PATCH UPDATE:", profilePayload);

    const savedProfile = await upsertProfile(supabaseAdmin, profilePayload);
    if (savedProfile.error) {
      console.error("ADMIN SAVE PROFILI ERROR", savedProfile.error);
      console.error("ADMIN SAVE PROFILI PAYLOAD", profilePayload);
      return res.status(500).json(toErrorResponse(savedProfile.error, "Profile update failed"));
    }

    return res.status(200).json({ ok: true, profile: savedProfile.data, id, table: savedProfile.tableName });
  } catch (error: any) {
    console.error("ADMIN SAVE PROFILI ERROR", error);
    console.error("ADMIN SAVE PROFILI PAYLOAD", req?.body || null);
    return res.status(500).json(toErrorResponse(error));
  }
}