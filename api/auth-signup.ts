import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type ApiRequest = {
  method?: string;
  body?: any;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: any) => void;
};

const env = ((globalThis as any)?.process?.env || {}) as Record<string, string | undefined>;
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_FROM_EMAIL = env.AUTH_FROM_EMAIL || "info@loziodelrum.it";
const AUTH_FROM_NAME = env.AUTH_FROM_NAME || "DrinkWise by Lo Zio del Rum";
const DEFAULT_APP_URL = "https://loziodelrum.it";
const RESEND_API_KEY = env.RESEND_API_KEY;

function resolveAppUrl(...candidates: Array<string | undefined>) {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim().replace(/\/$/, "");
    if (!value) continue;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)) continue;
    return value;
  }
  return DEFAULT_APP_URL;
}

const APP_URL = resolveAppUrl(env.APP_URL, env.URL);

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getProfileConflictMessage(error: any) {
  const raw = String(error?.message || "").toLowerCase();
  if (raw.includes("username")) {
    return "Username gia in uso";
  }
  if (raw.includes("email")) {
    return "Email gia in uso";
  }
  return "Conflitto dati profilo: username o email gia usati";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const missingEnv: string[] = [];
  if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

  const nome = String(req.body?.nome || "").trim();
  const cognome = String(req.body?.cognome || "").trim();
  const username = String(req.body?.username || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const telefono = String(req.body?.telefono || "").trim() || null;
  const ruolo = String(req.body?.ruolo || "utente").trim();
  const datiSpecifici = req.body?.datiSpecifici || {};

  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ ok: false, message: "Dati registrazione mancanti" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Email non valida" });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: "La password deve avere almeno 6 caratteri" });
  }

  if (!["utente", "bartender", "proprietario"].includes(ruolo)) {
    return res.status(400).json({ ok: false, message: "Ruolo non valido" });
  }

  if (ruolo !== "utente" && !RESEND_API_KEY) {
    missingEnv.push("RESEND_API_KEY");
  }

  if (missingEnv.length > 0) {
    return res.status(500).json({
      ok: false,
      message: `Server env not configured: ${missingEnv.join(", ")}`,
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const redirectTo = `${APP_URL}/auth`;

  let userId: string | null = null;
  let actionLink: string | null = null;

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
        return res.status(409).json({ ok: false, message: "Email gia registrata" });
      }
      return res.status(400).json({ ok: false, message });
    }

    userId = (data as any)?.user?.id || null;
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
        return res.status(409).json({ ok: false, message: "Email gia registrata" });
      }
      return res.status(400).json({ ok: false, message });
    }

    userId = (data as any)?.user?.id || null;
    actionLink = (data as any)?.properties?.action_link || (data as any)?.action_link || null;
  }

  if (!userId) {
    return res.status(500).json({ ok: false, message: "Utente creato senza id" });
  }

  try {
    // 1. Upsert profilo base (trigger lo creerà comunque, ma qui lo forziamo per sicurezza)
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
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      if (String(profileError?.code || "") === "23505" || String(profileError?.message || "").toLowerCase().includes("duplicate")) {
        return res.status(409).json({ ok: false, message: getProfileConflictMessage(profileError) });
      }
      return res.status(500).json({ ok: false, message: `Errore salvataggio profilo: ${profileError.message}` });
    }

    // 2. Inserisci dati specifici per bartender
    if (ruolo === "bartender" && datiSpecifici.bartenderData) {
      const { error: bartenderError } = await supabaseAdmin
        .from("Bartender")
        .insert([{ id: userId, ...datiSpecifici.bartenderData }]);

      if (bartenderError) {
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
        return res.status(500).json({ ok: false, message: `Errore salvataggio bartender: ${bartenderError.message}` });
      }
    }

    // 3. Inserisci dati specifici per proprietario (locale)
    if (ruolo === "proprietario" && datiSpecifici.localeData) {
      const { error: localeError } = await supabaseAdmin
        .from("Locali")
        .insert([{ id: userId, ...datiSpecifici.localeData }]);

      if (localeError) {
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
        return res.status(500).json({ ok: false, message: `Errore salvataggio locale: ${localeError.message}` });
      }
    }
  } catch (err: any) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return res.status(500).json({ ok: false, message: `Errore interno: ${err.message}` });
  }

  if (ruolo === "utente") {
    return res.status(200).json({
      ok: true,
      message: "Registrazione completata! Ora puoi accedere.",
    });
  }

  // 4. Genera link di conferma
  if (!actionLink) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return res.status(500).json({ ok: false, message: "Link conferma non disponibile" });
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
  } catch (smtpError: any) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return res.status(502).json({
      ok: false,
      message: `Invio email fallito: ${smtpError?.message || "Resend error"}`,
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Registrazione completata! Controlla la tua email per confermare l'account.",
  });
}
