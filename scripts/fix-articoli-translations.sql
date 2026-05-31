-- FIX MULTILINGUA ARTICOLI DRINKWISE (idempotente, solo campi NULL o vuoti, nessuna sovrascrittura)
-- Esegui solo se hai un backup!

UPDATE public.articoli SET
  titolo_fr = COALESCE(NULLIF(titolo_fr, ''), NULLIF(titolo_en, ''), NULLIF(titolo, '')),
  sottotitolo_fr = COALESCE(NULLIF(sottotitolo_fr, ''), NULLIF(sottotitolo_en, ''), NULLIF(sottotitolo, '')),
  descrizione_fr = COALESCE(NULLIF(descrizione_fr, ''), NULLIF(descrizione_en, ''), NULLIF(descrizione, '')),
  contenuto_fr = COALESCE(NULLIF(contenuto_fr, ''), NULLIF(contenuto_en, ''), NULLIF(contenuto, ''))
WHERE
  (titolo_fr IS NULL OR titolo_fr = '')
  OR (sottotitolo_fr IS NULL OR sottotitolo_fr = '')
  OR (descrizione_fr IS NULL OR descrizione_fr = '')
  OR (contenuto_fr IS NULL OR contenuto_fr = '');
