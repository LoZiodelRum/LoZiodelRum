import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || "info@loziodelrum.it";
const AUTH_FROM_NAME = process.env.AUTH_FROM_NAME || "DrinkWise by Lo Zio del Rum";
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
    body: JSON.stringify(payload),
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return json(500, { ok: false, message: "Server env not configured" });
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

  if (!nome || !cognome || !username || !email || !password) {
    return json(400, { ok: false, message: "Dati registrazione mancanti" });
  }

  if (!isValidEmail(email)) {
    return json(400, { ok: false, message: "Email non valida" });
  }

  if (password.length < 6) {
    return json(400, { ok: false, message: "La password deve avere almeno 6 caratteri" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const redirectTo = `${APP_URL}/auth`;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { nome, cognome, username },
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
          ruolo: "utente",
          status: "attivo",
        },
      ],
      { onConflict: "id" }
    );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(500, { ok: false, message: `Errore salvataggio profilo: ${profileError.message}` });
  }

  const actionLink = data?.properties?.action_link || data?.action_link;
  if (!actionLink) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(500, { ok: false, message: "Link conferma non disponibile" });
  }

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

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const resendErrorText = await resendResponse.text();
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return json(502, {
      ok: false,
      message: `Invio email fallito: ${resendErrorText || resendResponse.status}`,
    });
  }

  return json(200, {
    ok: true,
    message: "Registrazione completata! Controlla la tua email per confermare l'account.",
  });
}
