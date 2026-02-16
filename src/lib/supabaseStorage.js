/**
 * Upload file su Supabase Storage (bucket 'media').
 * Usa supabase.storage.from('media').upload() e getPublicUrl().
 */
import { supabase, isSupabaseConfigured } from "./supabase";

const BUCKET = "media";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

function getFileType(file) {
  return (file.type || "").startsWith("video/") ? "video" : "image";
}

/**
 * Carica un file nello storage e restituisce l'URL pubblico.
 * Nome univoco: Date.now()_nomefile
 */
export async function uploadToSupabaseStorage(file, folder, type = "image") {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato per upload. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  const fileType = (type === "video" || type === "image") ? type : getFileType(file);
  const maxSize = fileType === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    throw new Error(`File troppo grande. Max ${maxMB}MB per ${fileType === "video" ? "video" : "immagini"}.`);
  }
  const ext = file.name.split(".").pop() || (fileType === "video" ? "mp4" : "jpg");
  const safeName = (file.name || "").replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  const path = `${folder}/${Date.now()}_${safeName || Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("[Supabase] storage upload - errore completo:", { error, message: error.message, statusCode: error.statusCode });
    throw new Error(error.message || "Errore caricamento file");
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Carica più file e restituisce array di URL.
 * @param {File[]} files - Array di file
 * @param {string} folder - Cartella
 * @param {Function} onProgress - (index, total, url) => void
 * @returns {Promise<string[]>} Array di URL pubblici
 */
export async function uploadMultipleToSupabaseStorage(files, folder, onProgress) {
  if (!files?.length) return [];
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const type = getFileType(files[i]);
    const url = await uploadToSupabaseStorage(files[i], folder, type);
    urls.push(url);
    onProgress?.(i + 1, files.length, url);
  }
  return urls;
}

/** Converte array di URL in stringa separata da virgole (per DB) */
export function urlsToDbString(urls) {
  return Array.isArray(urls) ? urls.filter(Boolean).join(",") : "";
}

/** Converte stringa DB in array di URL */
export function dbStringToUrls(str) {
  if (!str || typeof str !== "string") return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}
