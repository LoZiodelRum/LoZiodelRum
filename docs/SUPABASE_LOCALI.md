# Locali dal cellulare → Dashboard (Supabase)

Se configuri Supabase, i locali che gli utenti aggiungono dall’app (dal cellulare) **vengono salvati online** e a te compaiono in automatico nella **Dashboard** per modificarli e approvarli.

## Flusso

1. **Utente** (dal telefono): aggiunge un locale (es. da “Scrivi recensione” → “Aggiungi un nuovo locale” o da “Aggiungi locale”).
2. Il locale viene salvato in **Supabase** con stato “in attesa”.
3. **Tu** (admin): apri la Dashboard (da browser o da Cursor / altro dispositivo).
4. Nella sezione **“Locali inviati dal cellulare (da approvare)”** vedi i locali in attesa.
5. Puoi **Approva** (il locale diventa visibile a tutti), **Rifiuta** o **Modifica** (poi approva).

Se Supabase **non** è configurato, l’app continua a funzionare come prima: i locali aggiunti restano solo nel dispositivo di chi li ha inseriti (localStorage).

## Configurazione Supabase (una tantum)

1. Vai su [supabase.com](https://supabase.com), registrati e crea un **nuovo progetto** (nome e password a piacere).
2. Nel progetto: **SQL Editor** → “New query” → incolla il contenuto di **`supabase/schema.sql`** (nella root del repo) → Run.
3. **Impostazioni** (Settings) → **API**: copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (chiave anonima) → `VITE_SUPABASE_ANON_KEY`
4. Nel progetto (Cartella LoZiodelRum): crea o modifica **`.env`** (o `.env.local`) e aggiungi:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
5. Riavvia il dev server (`npm run dev`).

Su **Vercel** (deploy): nelle variabili d’ambiente del progetto imposta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con gli stessi valori.

## Cosa fa l’app

- **Inserimento locale (AddVenue / AddReview “Aggiungi locale”)**: oltre a salvarlo in locale (localStorage), se Supabase è configurato invia una riga in Supabase con `status: 'pending'`.
- **Dashboard**: se Supabase è configurato, carica i locali con `status: 'pending'` e li mostra in “Locali inviati dal cellulare”. **Approva** → `status: 'approved'` e il locale viene incluso in **getVenues()** per tutti (visibile in Mappa, Esplora, ecc.). **Rifiuta** → `status: 'rejected'`.
- **Modifica**: dalla Dashboard puoi aprire “Modifica” su un locale in attesa; il salvataggio aggiorna Supabase. Dopo l’approvazione il locale resta modificabile dalla scheda del locale (se hai il link Modifica per i locali cloud).

I locali approvati restano in Supabase e vengono caricati dall’app a ogni avvio; non è necessario copiarli a mano in `src/data/venues.js` per vederli in app.

## Sincronizzazione modifiche admin (venue_overrides)

Per far sì che le modifiche ai locali seed (da Amministratore) siano visibili su tutti i device (Cursor, cellulare, tablet, PC), esegui nel SQL Editor di Supabase lo script `supabase/venue_overrides.sql`. Le modifiche verranno salvate in Supabase e lette da tutti i punti di accesso.
