/// <reference types="vite/client" />

declare namespace ImportMeta {
  interface Env {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // altre variabili env custom se servono
  }
  interface Meta {
    readonly env: Env;
  }
}
