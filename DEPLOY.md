# Come pubblicare l’app Lo Zio del Rum

L’app è una SPA (single-page app). Puoi pubblicarla in pochi minuti su **Vercel** o **Netlify** (entrambi hanno un piano gratuito).

---

## Opzione 1: Vercel (consigliata)

1. **Crea un account** su [vercel.com](https://vercel.com) (gratis, puoi usare GitHub).
2. **Installa Vercel CLI** (opzionale) oppure usa il sito:
   - Vai su [vercel.com/new](https://vercel.com/new)
   - **Import** il progetto: collega il repository GitHub del progetto oppure carica la cartella.
3. **Imposta il progetto**:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - (Se usi GitHub, Vercel rileva spesso tutto in automatico.)
4. Clicca **Deploy**. Dopo 1–2 minuti avrai un link tipo:  
   `https://loziodelrum-xxx.vercel.app`
5. Sul **cellulare** apri quel link dal browser: l’app funziona come su desktop.

---

## Opzione 2: Netlify

1. **Crea un account** su [netlify.com](https://netlify.com).
2. Vai su [app.netlify.com/start](https://app.netlify.com/start):
   - Collega il repository GitHub **oppure**
   - Trascina la cartella **dist** (dopo aver eseguito `npm run build`) nella zona “Drag and drop”.
3. Se usi GitHub: imposta Build command = `npm run build`, Publish directory = `dist`.
4. Deploy. Otterrai un link tipo:  
   `https://nome-progetto.netlify.app`
5. Sul **cellulare** apri quel link.

---

## Prima di pubblicare: build locale

Da terminale, nella cartella del progetto:

```bash
npm run build
```

Si crea la cartella **dist** con l’app pronta per il deploy. Puoi provarla in locale con:

```bash
npm run preview
```

Poi apri `http://localhost:4173` per controllare che tutto funzioni.

---

## Dopo la pubblicazione

- **Dati**: locali, recensioni, articoli, drink e password admin restano nel **localStorage** del browser di chi usa l’app. Su un altro dispositivo o browser i dati non ci sono (a meno che non usi export/import backup).
- **Dominio**: su Vercel/Netlify puoi aggiungere un dominio personalizzato (es. `loziodelrum.it`) dalle impostazioni del progetto.
