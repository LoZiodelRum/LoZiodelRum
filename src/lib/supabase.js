import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ptfywgpplpcvjyohnpkv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Znl3Z3BwbHBjdmp5b2hucGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTc2NDMsImV4cCI6MjA4NjQ5MzY0M30.k_TIoofgRdnpoS2S3jipsPrfd4e2KDMU3vqFWrC63-s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => true;
