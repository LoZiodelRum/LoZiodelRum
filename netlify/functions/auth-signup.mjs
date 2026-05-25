import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || "info@loziodelrum.it";
const AUTH_FROM_NAME = process.env.AUTH_FROM_NAME || "DrinkWise by Lo Zio del Rum";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_APP_URL = "https://loziodelrum.it";

function resolveAppUrl(...candidates) {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim().replace(/\/$/, "");
    if (!value) continue;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)) continue;
    return value;
  }
  return DEFAULT_APP_URL;
}

const APP_URL = resolveAppUrl(process.env.APP_URL, process.env.URL, process.env.SITE_URL);

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getProfileConflictMessage(error) {
  const raw = String(error?.message || "").toLowerCase();
  if (raw.includes("username")) {
    return "Username gia in uso";
  }
  if (raw.includes("email")) {
    return "Email gia in uso";
  }
  return "Conflitto dati profilo: username o email gia usati";
}

async function cleanupGhostAuthUserByEmail(supabaseAdmin, email) {
  const targetEmail = normalizeEmail(email);
  const { data: profileRows } = await supabaseAdmin
    .from("Profili")
    .select("id")
    .eq("email", targetEmail)
    .limit(1);

  const hasProfileRow = Array.isArray(profileRows) && profileRows.length > 0;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      return false;
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    const match = users.find((user) => normalizeEmail(user?.email) === targetEmail);

    if (!match) {
      if (users.length < 1000) {
        return false;
      }
      continue;
    }

    if (match.deleted_at || match.banned_until || !hasProfileRow) {
      await supabaseAdmin.auth.admin.deleteUser(match.id).catch(() => undefined);
      return true;
    }

    return false;
  }

  return false;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" });
  }

  const missingEnv = [];
  if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid JSON body" });
  }

  const nome = String(parsed?.nome || "").trim();
  const cognome = String(parsed?.cognome || "").trim();
  const username = String(parsed?.username || "").trim();
  const email = normalizeEmail(parsed?.email);
  const password = String(parsed?.password || "");
  const telefono = String(parsed?.telefono || "").trim() || null;
  const ruolo = String(parsed?.ruolo || "utente").trim();
  const datiSpecifici = parsed?.datiSpecifici || {};

  if (!nome || !cognome || !username || !email || !password) {
    return json(400, { ok: false, message: "Dati registrazione mancanti" });
  }

  if (!isValidEmail(email)) {
    return json(400, { ok: false, message: "Email non valida" });
  }

  if (password.length < 6) {
    return json(400, { ok: false, message: "La password deve avere almeno 6 caratteri" });
  }

  if (!["utente", "bartender", "proprietario"].includes(ruolo)) {
    return json(400, { ok: false, message: "Ruolo non valido" });
  }

  if (ruolo !== "utente" && !RESEND_API_KEY) {
    missingEnv.push("RESEND_API_KEY");
  }

  if (missingEnv.length > 0) {
    return json(500, { ok: false, message: `Server env not configured: ${missingEnv.join(", ")}` });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const redirectTo = `${APP_URL}/auth`;

  let userId = null;
  let actionLink = null;

  if (ruolo === "utente") {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cognome,
        username,
        telefono,
        ruolo,
      },
    });

    if (error) {
      const message = error.message || "Errore in registrazione";
      if (message.toLowerCase().includes("already") || message.toLowerCase().includes("exists")) {
        const cleaned = await cleanupGhostAuthUserByEmail(supabaseAdmin, email);
        if (cleaned) {
          const retry = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              nome,
              cognome,
              username,
              telefono,
              ruolo,
            },
          });

          if (!retry.error && retry.data?.user?.id) {
            userId = retry.data.user.id;
          } else if (retry.error) {
            return json(400, { ok: false, message: retry.error.message || message });
          }
        }

        if (!userId) {
          return json(409, { ok: false, message: "Email gia registrata" });
        }
      } else {
        return json(400, { ok: false, message });
      }
    } else {
      userId = data?.user?.id || null;
    }
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { nome, cognome, username, telefono },
        redirectTo,
      },
    });

    if (error) {
      const message = error.message || "Errore in registrazione";
      if (message.toLowerCase().includes("already") || message.toLowerCase().includes("exists")) {
        return json(409, { ok: false, message: "Email gia registrata" });
      }
      return json(400, { ok: false, message });
    }

    userId = data?.user?.id || null;
    actionLink = data?.properties?.action_link || data?.action_link || null;
  }

  if (!userId) {
    return json(500, { ok: false, message: "Utente creato senza id" });
  }

  try {
    // 1. Upsert profilo base
    const { error: profileError } = await supabaseAdmin
      .from("Profili")
      .upsert(
        [
          {
            id: userId,
            nome,
            cognome,
            username,
            email,
            telefono,
            ruolo,
            status: "attivo",
          },
        ],
        { onConflict: "id" }
      );

    if (profileError) {
      if (String(profileError?.code || "") === "23505" || String(profileError?.message || "").toLowerCase().includes("duplicate")) {
        if (ruolo === "utente") {
          return json(200, {
            ok: true,
            message: "Registrazione completata! Il profilo verra sincronizzato al primo accesso.",
          });
        }
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
        return json(409, { ok: false, message: getProfileConflictMessage(profileError) });
      }
      if (ruolo === "utente") {
        return json(200, {
          ok: true,
          message: "Registrazione completata! Il profilo verra sincronizzato al primo accesso.",
        });
      }
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      return json(500, { ok: false, message: `Errore salvataggio profilo: ${profileError.message}` });
    }

    // 2. Inserisci dati specifici per bartender
    if (ruolo === "bartender" && datiSpecifici.bartenderData) {
      const { error: bartenderError } = await supabaseAdmin
        .from("Bartender")
        .insert([{ id: userId, ...datiSpecifici.bartenderData }]);

      if (bartenderError) {
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
        return json(500, { ok: false, message: `Errore salvataggio bartender: ${bartenderError.message}` });
      }
    }

    // 3. Inserisci dati specifici per proprietario (locale)
    if (ruolo === "proprietario" && datiSpecifici.localeData) {
      const { error: localeError } = await supabaseAdmin
        .from("Locali")
        .insert([{ id: userId, ...datiSpecifici.localeData }]);

      if (localeError) {
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
        return json(500, { ok: false, message: `Errore salvataggio locale: ${localeError.message}` });
      }
    }
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(500, { ok: false, message: `Errore interno: ${err.message}` });
  }

  if (ruolo === "utente") {
    return json(200, {
      ok: true,
      message: "Registrazione completata! Ora puoi accedere.",
    });
  }

  // 4. Genera link di conferma
  if (!actionLink) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(500, { ok: false, message: "Link conferma non disponibile" });
  }

  // 5. Invia email
  const from = `${AUTH_FROM_NAME} <${AUTH_FROM_EMAIL}>`;
  const subject = "Conferma la tua registrazione";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111111;">
      <h2 style="margin-bottom: 8px;">Benvenuto su DrinkWise</h2>
      <p style="margin-top: 0;">Ciao ${nome}, conferma la tua email per completare la registrazione.</p>
      <p style="margin: 24px 0;">
        <a href="${actionLink}" style="display:inline-block;padding:12px 18px;background:#c9852f;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
          Conferma Account
        </a>
      </p>
      <p style="font-size: 14px; color: #555555;">Se il pulsante non funziona, usa questo link:</p>
      <p style="font-size: 13px; word-break: break-all; color: #333333;">${actionLink}</p>
    </div>
  `;

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    });
    if (emailError) {
      throw new Error(emailError.message);
    }
  } catch (smtpError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(502, {
      ok: false,
      message: `Invio email fallito: ${smtpError?.message || "Resend error"}`,
    });
  }

  return json(200, {
    ok: true,
    message: "Registrazione completata! Controlla la tua email per confermare l'account.",
  });
}
