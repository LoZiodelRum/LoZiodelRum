# Verifica che le modifiche si vedano

Se **non vedi le modifiche** né su desktop né su mobile, segui questi passi **in ordine**.

## 1. Dove stai guardando?

- **Se apri il sito su Vercel** (es. `https://loziodelrum.vercel.app`): le modifiche ci sono **solo dopo** che fai **push su GitHub** e Vercel ha finito il deploy (1–2 minuti). Fino ad allora vedi sempre la versione vecchia.
- **Se apri in locale** (sul tuo PC): devi usare l’indirizzo del server di sviluppo, di solito **http://localhost:5173** (controlla cosa scrive il terminale quando lanci `npm run dev`). Se apri un altro indirizzo (es. un vecchio bookmark o il sito Vercel), non vedi le modifiche locali. Dal telefono sulla stessa Wi-Fi puoi usare l'indirizzo che Vite mostra (es. http://192.168.x.x:5173).

## 2. Controllo rapido: titolo della scheda

Dopo aver salvato i file e aver fatto riavviare il server (vedi sotto):

- Apri (o ricarica) **http://localhost:5173** in una **nuova scheda**.
- Guarda il **titolo della scheda** del browser (in alto).
- Se vedi **"LoZiodelRum APP (build 2025-02)"** → stai caricando il codice nuovo.
- Se vedi solo **"LoZiodelRum APP"** → stai ancora vedendo una versione vecchia (cache o URL sbagliato).

## 3. Passi per vedere le modifiche in locale

1. **Ferma** il server (nel terminale dove gira `npm run dev`: **Ctrl+C**).
2. **Elimina la cache di Vite** (opzionale ma utile):
   ```bash
   rm -rf node_modules/.vite
   ```
3. **Riavvia** il server:
   ```bash
   npm run dev
   ```
4. Nel browser:
   - Apri una **nuova scheda**.
   - Vai a **http://localhost:5173** (scrivi l’indirizzo a mano, non usare un vecchio bookmark).
   - Fai **ricarica forzata**: **Ctrl+Shift+R** (Windows/Linux) o **Cmd+Shift+R** (Mac).

## 4. Per vedere le modifiche su telefono / Vercel

1. Fai **commit** e **push** su GitHub (inclusi tutti i file modificati: `index.html`, `src/...`, ecc.).
2. Aspetta che **Vercel** completi il deploy (dashboard Vercel → ultimo deploy “Ready”).
3. Sul telefono: **chiudi completamente** il browser (o la scheda del sito) e riapri il sito, oppure nelle impostazioni del browser **cancella i dati** per il sito e ricarica.

---

**Riassunto:** Se il titolo della scheda non diventa "LoZiodelRum APP (build 2025-02)" dopo aver seguito i passi sopra, stai ancora caricando una versione vecchia (URL sbagliato o cache). Usa sempre **http://localhost:5173** in locale e **ricarica forzata** (Ctrl+Shift+R / Cmd+Shift+R).
