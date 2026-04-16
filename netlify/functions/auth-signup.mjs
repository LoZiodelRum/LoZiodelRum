import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || "info@loziodelrum.it";
const AUTH_FROM_NAME = process.env.AUTH_FROM_NAME || "DrinkWise by Lo Zio del Rum";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.aruba.it";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || AUTH_FROM_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.AUTH_EMAIL_PASSWORD;
const APP_URL =
  process.env.APP_URL ||
  process.env.URL ||
  process.env.SITE_URL ||
  process.env.VITE_APP_URL ||
  "https://loziodelrum.it";

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

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" });
  }

  const missingEnv = [];
  if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!SMTP_PASSWORD) missingEnv.push("SMTP_PASSWORD");

  if (missingEnv.length > 0) {
    return json(500, { ok: false, message: `Server env not configured: ${missingEnv.join(", ")}` });
  }

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

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const redirectTo = `${APP_URL.replace(/\/$/, "")}/auth`;

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

  const userId = data?.user?.id;
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
            status: ruolo === "utente" ? "attivo" : "in_attesa",
          },
        ],
        { onConflict: "id" }
      );

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      if (String(profileError?.code || "") === "23505" || String(profileError?.message || "").toLowerCase().includes("duplicate")) {
        return json(409, { ok: false, message: getProfileConflictMessage(profileError) });
      }
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

  // 4. Genera link di conferma
  const actionLink = data?.properties?.action_link || data?.action_link;
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
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject,
      html,
    });
  } catch (smtpError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(502, {
      ok: false,
      message: `Invio email fallito: ${smtpError?.message || "SMTP error"}`,
    });
  }

  return json(200, {
    ok: true,
    message: "Registrazione completata! Controlla la tua email per confermare l'account.",
  });
}
