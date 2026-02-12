# Locali aggiunti dal mobile

I locali che aggiungi dall’app (es. da telefono) **non** vengono scritti nel file del progetto: vengono salvati solo nel **localStorage** del browser su quel dispositivo.  
Per averli anche nel repo (e poterli modificare in Cursor, vederli su altri dispositivi e in deploy), devi “portarli” nel file `src/data/venues.js`.

## Metodo 1: Export dall’app e script (consigliato)

1. **Sul telefono** (stesso dove hai aggiunto il locale):
   - Apri l’app Lo Zio del Rum.
   - Vai in **Profilo** → accesso **admin** (se non sei admin, chiedi a chi gestisce il sito).
   - Entra nella **Dashboard**.
   - Usa **Esporta dati** e salva il file JSON (o condividilo/ invialo al PC).

2. **Sul PC** (dove hai il progetto in Cursor):
   - Copia il file di export nel progetto (es. `export.json` nella root).
   - Da terminale, nella root del progetto:
     ```bash
     node scripts/merge-venues-from-export.js export.json
     ```
   - Lo script aggiunge a `src/data/venues.js` solo i locali che non c’erano già (confronto per `id`).

3. Controlla in Cursor che in `src/data/venues.js` compaiano i nuovi locali e fai commit/push se serve.

## Metodo 2: Aggiunta manuale in Cursor

Se non hai più l’export ma ricordi i dati del locale:

1. Apri `src/data/venues.js`.
2. Copia un blocco di un locale esistente (da `{` a `},`).
3. Incollalo prima della riga `];` finale.
4. Modifica i campi (`id`, `name`, `city`, `address`, `category`, `phone`, ecc.).  
   Per un nuovo locale l’`id` può essere un valore univoco (es. generato con `Date.now().toString(36)` in console, o un UUID).  
   Lascia `review_count: 0`, `overall_rating: null` se non hai ancora recensioni.

## Perché non compare nel “database” Cursor?

- Il “database” del sito è il file **`src/data/venues.js`** (e gli altri in `src/data/`).
- L’app in esecuzione carica prima i dati da questi file; poi, se nel browser c’è già qualcosa in localStorage (chiave `app_venues`), usa quello e **salva lì** i nuovi locali/recensioni.
- Quindi: tutto ciò che aggiungi dall’app va in **localStorage**, non nei file del repo.  
  Per averlo nel progetto (e in Cursor) devi esportare e usare lo script sopra, o inserire il locale a mano in `venues.js`.
