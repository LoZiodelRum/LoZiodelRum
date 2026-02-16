/**
 * Upload file su Supabase Storage (bucket 'media').
 * Usa supabase.storage.from('media').upload() e getPublicUrl().
 */
import { supabase, isSupabaseConfigured } from "./supabase";

const BUCKET = "media";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Carica un file nello storage e restituisce l'URL pubblico.
 * @param {File} file - File da caricare
 * @param {string} folder - Cartella (es. 'profiles', 'venues')
 * @param {string} type - 'image' | 'video'
 * @returns {Promise<string>} URL pubblico
 */
export async function uploadToSupabaseStorage(file, folder, type = "image") {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato");
  }
  const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    throw new Error(`File troppo grande. Max ${maxMB}MB per ${type === "video" ? "video" : "immagini"}.`);
  }
  const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Supabase storage upload:", error);
    throw new Error(error.message || "Errore caricamento file");
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
