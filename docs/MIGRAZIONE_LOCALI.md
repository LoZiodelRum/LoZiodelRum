# Migrazione locali a Supabase (tabella Locali)

## Panoramica

I 19 locali Base44 erano in `src/data/venues.js`. Ora la Dashboard e l'app usano **esclusivamente** la tabella `Locali` su Supabase.

## Esecuzione migrazione

```bash
npm run migrate:venues
```

Lo script:
1. Legge i 19 locali da `src/data/venues.js`
2. Li inserisce nella tabella `Locali` con `status='approved'`
3. Evita duplicati (nome + citta)
4. Mappa: name→nome, city→citta, address→indirizzo, category→categoria, ecc.

## Dopo la migrazione

- **Dashboard**: mostra i locali da Locali (approvati + in attesa)
- **Explore, Mappa, Home**: tutti i dati da Locali
- **AddVenue**: inserisce direttamente in Locali
- **venues.js**: usato solo dallo script di migrazione; l'app non lo legge più

## Coordinate sulla mappa e sincronizzazione Base44

Per i marker sulla mappa servono le colonne `latitudine` e `longitudine` (tipo text).
Se non esistono, esegui nel SQL Editor di Supabase:

```sql
alter table public."Locali" add column if not exists latitudine text;
alter table public."Locali" add column if not exists longitudine text;
```

**Sincronizzazione massiva** (upsert dei 19 locali Base44 con dati completi):

```bash
npm run sync:base44
```

Oppure solo aggiornamento coordinate per locali già presenti:

```bash
npm run update:coordinates
```

## Fonte unica

Tutti i locali (19 originali + nuovi come "Il Cantiere") provengono dalla tabella `Locali` di Supabase.
