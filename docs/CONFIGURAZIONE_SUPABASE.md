# Configurazione Supabase – Guida rapida

Per far funzionare l’approvazione dei locali dal cellulare nella Dashboard:

## 1. Chiave API

1. Vai su [supabase.com](https://supabase.com) e accedi al tuo progetto.
2. Apri **Settings** → **API**.
3. Copia:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public** (la chiave lunga che inizia con `eyJ...`)

## 2. File `.env`

Apri `.env` nella root del progetto e imposta:

```env
VITE_SUPABASE_URL=https://ptfywgpplpcvjyohnpkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx...  # incolla la chiave completa
VITE_ADMIN_PASSWORD=850877
```

## 3. Crea la tabella

1. Nel progetto Supabase: **SQL Editor** → **New query**.
2. Copia e incolla il contenuto di `supabase/schema.sql`.
3. Clicca **Run**.

## 4. Verifica

Da terminale:

```bash
npm run supabase:setup
```

Se vedi "✅ Supabase configurato correttamente", la configurazione è ok.

## 5. Riavvia l’app

```bash
npm run dev
```

Dopo la configurazione, i locali aggiunti dal cellulare appariranno nella Dashboard per l’approvazione.
