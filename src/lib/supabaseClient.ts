import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = "https://ptfywgpplpcvjyohnpkv.supabase.co"

export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Znl3Z3BwbHBjdmp5b2hucGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTc2NDMsImV4cCI6MjA4NjQ5MzY0M30.k_TIoofgRdnpoS2S3jipsPrfd4e2KDMU3vqFWrC63-s"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Public read client: avoids session-specific RLS restrictions for public content pages.
export const publicSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})