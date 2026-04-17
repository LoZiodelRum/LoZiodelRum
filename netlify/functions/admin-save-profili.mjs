import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

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

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

function normalizeArrayValue(value) {
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

function normalizeProfileChanges(changes) {
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

async function upsertProfile(supabaseAdmin, profile) {
  const tableCandidates = ["Profili", "profili"];
  let lastError = "Could not save profile";

  for (const tableName of tableCandidates) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .upsert([profile], { onConflict: "id" })
      .select("*")
      .single();

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

async function deleteProfileRow(supabaseAdmin, id) {
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

  const parsed = JSON.parse(event.body || "{}");
  const mode = parsed?.mode;
  const id = String(parsed?.id || "").trim() || null;
  const changes = parsed?.changes;

  if (!mode || !["create", "update", "delete"].includes(mode)) {
    return json(400, { ok: false, message: "Invalid mode" });
  }

  if (mode !== "delete" && (!changes || typeof changes !== "object" || Array.isArray(changes))) {
    return json(400, { ok: false, message: "Missing changes payload" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (mode === "delete") {
    if (!id) {
      return json(400, { ok: false, message: "Missing id" });
    }

    const deletedProfile = await deleteProfileRow(supabaseAdmin, id);
    if (!deletedProfile.ok) {
      return json(500, { ok: false, message: deletedProfile.error?.message || "Profile delete failed" });
    }

    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => undefined);
    return json(200, { ok: true, id, table: deletedProfile.tableName });
  }

  const password = String(changes.password || "").trim();
  const normalizedChanges = normalizeProfileChanges(changes);
  const email = String(normalizedChanges.email || "").trim().toLowerCase();

  if (!email) {
    return json(400, { ok: false, message: "Email obbligatoria" });
  }

  if (mode === "create") {
    if (!password) {
      return json(400, { ok: false, message: "Password obbligatoria per creare un utente" });
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
      return json(500, { ok: false, message: authResponse.error?.message || "User creation failed" });
    }

    const profilePayload = {
      ...normalizedChanges,
      id: authResponse.data.user.id,
      email,
    };

    const savedProfile = await upsertProfile(supabaseAdmin, profilePayload);
    if (savedProfile.error) {
      await supabaseAdmin.auth.admin.deleteUser(authResponse.data.user.id).catch(() => undefined);
      return json(500, { ok: false, message: savedProfile.error?.message || "Profile save failed" });
    }

    return json(200, { ok: true, profile: savedProfile.data, id: authResponse.data.user.id, table: savedProfile.tableName });
  }

  if (!id) {
    return json(400, { ok: false, message: "Missing id" });
  }

  const authUpdates = {};
  if (email) authUpdates.email = email;
  if (password) authUpdates.password = password;
  if (typeof changes.email_verificata === "boolean" && changes.email_verificata) {
    authUpdates.email_confirm = true;
  }

  if (Object.keys(authUpdates).length > 0) {
    const authUpdate = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    if (authUpdate.error) {
      return json(500, { ok: false, message: authUpdate.error.message || "User update failed" });
    }
  }

  const profilePayload = {
    ...normalizedChanges,
    id,
    email,
    updated_at: new Date().toISOString(),
  };

  const savedProfile = await upsertProfile(supabaseAdmin, profilePayload);
  if (savedProfile.error) {
    return json(500, { ok: false, message: savedProfile.error?.message || "Profile update failed" });
  }

  return json(200, { ok: true, profile: savedProfile.data, id, table: savedProfile.tableName });
}