# Configurare Supabase per vedere i locali dal cellulare sul Mac

Senza Supabase, i locali inseriti dal cellulare restano **solo** su quel dispositivo.  
Con Supabase configurato, i locali appaiono nella Dashboard anche quando apri l’app sul Mac.

## Passi

### 1. Crea un progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account (gratuito).
2. Clicca **New Project**, scegli nome e password per il database.
3. Attendi la creazione del progetto (~2 minuti).

### 2. Crea la tabella

1. Nel progetto Supabase, apri **SQL Editor** (menu a sinistra).
2. Clicca **New query**.
3. Copia e incolla il contenuto di `supabase/schema.sql` (nella root del progetto).
4. Clicca **Run** per eseguire lo script.

### 3. Prendi URL e chiave

1. Vai in **Settings** → **API**.
2. Copia:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public** (chiave sotto "Project API keys")

### 4. Configura il progetto

1. Nella root del progetto, crea o modifica `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. Riavvia il server di sviluppo (`npm run dev`).

### 5. Configura Vercel (se usi il deploy)

1. In Vercel, progetto → **Settings** → **Environment Variables**.
2. Aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con gli stessi valori.
3. Fai un nuovo deploy.

---

Dopo la configurazione:

- **Cellulare:** inserisci un locale → viene inviato a Supabase.
- **Mac:** apri la Dashboard → la sezione "Locali inviati dal cellulare" mostra i locali in attesa.
- **Approva** dal Mac → il locale diventa visibile a tutti.
