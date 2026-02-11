/**
 * WebAuthn (impronta digitale / Face ID) per accesso amministratore.
 * Registra una passkey dopo il login con password; accesso successivo con impronta.
 * Funziona solo in contesto sicuro (HTTPS o localhost).
 */

const STORAGE_KEY = "loziodelrum_admin_passkey_id";

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

export function hasStoredPasskey() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
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
  const id = base64urlEncode(credential.rawId);
  localStorage.setItem(STORAGE_KEY, id);
  return true;
}

/**
 * Autentica con impronta/Face ID. Restituisce true se successo.
 */
export async function authenticateWithPasskey() {
  if (!isWebAuthnAvailable()) throw new Error("WebAuthn non supportato");
  const storedId = localStorage.getItem(STORAGE_KEY);
  if (!storedId) throw new Error("Nessuna impronta associata. Accedi prima con la password e associa l'impronta.");
  const challenge = randomChallenge();
  const rpId = getRpId();
  const credentialId = new Uint8Array(base64urlDecode(storedId));
  const options = {
    challenge,
    timeout: 60000,
    rpId,
    allowCredentials: [
      { type: "public-key", id: credentialId },
    ],
    userVerification: "required",
  };
  const credential = await navigator.credentials.get({ publicKey: options });
  if (!credential || !(credential instanceof PublicKeyCredential)) throw new Error("Accesso annullato o non riuscito");
  return true;
}

export function clearStoredPasskey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
