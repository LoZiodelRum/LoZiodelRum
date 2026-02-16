# Formato variabili d'ambiente Supabase

Per evitare l'errore "Invalid API key", configura le variabili **senza virgolette**:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.la-tua-chiave-completa
```

**Da evitare:**
- `VITE_SUPABASE_ANON_KEY="eyJ..."` (virgolette)
- Spazi prima/dopo il `=`
- Interruzioni di riga nel mezzo della chiave

**Dove trovare la chiave:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
