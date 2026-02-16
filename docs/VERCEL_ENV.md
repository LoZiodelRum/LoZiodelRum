# Variabili d'ambiente su Vercel

Per evitare l'errore "Invalid API key", imposta **esattamente** queste variabili in Vercel → Project → Settings → Environment Variables:

| Nome | Valore | Obbligatorio |
|------|--------|--------------|
| `VITE_SUPABASE_URL` | `https://tuo-progetto.supabase.co` | Sì |
| `VITE_SUPABASE_ANON_KEY` | Chiave anon (Project API keys in Supabase) | Sì |

**Importante:**
- Il prefisso `VITE_` è obbligatorio (Vite espone solo queste variabili al client)
- Non usare `SUPABASE_URL` o `SUPABASE_ANON_KEY` senza il prefisso
- Dopo aver modificato le variabili, esegui un **Redeploy** del progetto
