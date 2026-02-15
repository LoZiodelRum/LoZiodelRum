/**
 * WebAuthn (impronta digitale / Face ID) per accesso amministratore.
 * Registra una passkey dopo il login con password; accesso successivo con impronta.
 * Funziona solo in contesto sicuro (HTTPS o localhost).
 * Usa Supabase (admin_passkeys) invece di localStorage.
 */

import { supabase } from "./supabase";

function base64urlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function randomChallenge() {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function isWebAuthnAvailable() {
  return typeof window !== "undefined" &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === "function" &&
    window.isSecureContext;
}

/**
 * Verifica se esiste almeno una passkey registrata (da Supabase).
 */
export async function hasStoredPasskey() {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from("admin_passkeys")
      .select("id")
      .limit(1);
    if (error) return false;
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

function getRpId() {
  if (typeof window === "undefined") return "localhost";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return host;
  return host;
}

/**
 * Registra una passkey (da chiamare dopo login con password).
 * Richiederà impronta/Face ID sul dispositivo.
 */
export async function registerPasskey() {
  if (!isWebAuthnAvailable()) throw new Error("WebAuthn non supportato (usa HTTPS o localhost)");
  if (!supabase) throw new Error("Supabase non configurato");
  const challenge = randomChallenge();
  const rpId = getRpId();
  const options = {
    challenge,
    rp: { name: "Lo Zio del Rum", id: rpId },
    user: {
      id: new TextEncoder().encode("admin-loziodelrum"),
      name: "admin@loziodelrum.local",
      displayName: "Amministratore",
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },
      { alg: -257, type: "public-key" },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
      residentKey: "preferred",
    },
    timeout: 60000,
  };
  const credential = await navigator.credentials.create({ publicKey: options });
  if (!credential || !(credential instanceof PublicKeyCredential)) throw new Error("Registrazione annullata");
  const credentialId = base64urlEncode(credential.rawId);
  const { error } = await supabase.from("admin_passkeys").insert({ credential_id: credentialId });
  if (error) throw new Error("Salvataggio passkey non riuscito");
  return true;
}

/**
 * Autentica con impronta/Face ID. Restituisce true se successo.
 */
export async function authenticateWithPasskey() {
  if (!isWebAuthnAvailable()) throw new Error("WebAuthn non supportato");
  if (!supabase) throw new Error("Supabase non configurato");
  const { data, error } = await supabase.from("admin_passkeys").select("credential_id");
  if (error || !Array.isArray(data) || data.length === 0) {
    throw new Error("Nessuna impronta associata. Accedi prima con la password e associa l'impronta.");
  }
  const allowCredentials = data.map((r) => ({
    type: "public-key",
    id: new Uint8Array(base64urlDecode(r.credential_id)),
  }));
  const challenge = randomChallenge();
  const rpId = getRpId();
  const options = {
    challenge,
    timeout: 60000,
    rpId,
    allowCredentials,
    userVerification: "required",
  };
  const credential = await navigator.credentials.get({ publicKey: options });
  if (!credential || !(credential instanceof PublicKeyCredential)) throw new Error("Accesso annullato o non riuscito");
  return true;
}

/**
 * Rimuove tutte le passkey registrate da Supabase.
 */
export async function clearStoredPasskey() {
  if (!supabase) return;
  try {
    await supabase.from("admin_passkeys").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch {}
}
