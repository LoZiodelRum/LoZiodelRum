
-- BACKFILL MULTILINGUA DRINKWISE SOLO PER ARTICOLI (idempotente, solo campi NULL o vuoti)
-- Esegui solo se hai un backup!

UPDATE public.articoli SET
  titolo_en = COALESCE(NULLIF(titolo_en, ''), NULLIF(titolo, '')),
  titolo_de = COALESCE(NULLIF(titolo_de, ''), NULLIF(titolo_en, ''), NULLIF(titolo, '')),
  titolo_es = COALESCE(NULLIF(titolo_es, ''), NULLIF(titolo_en, ''), NULLIF(titolo, '')),
  titolo_fr = COALESCE(NULLIF(titolo_fr, ''), NULLIF(titolo, '')),
  titolo_bg = COALESCE(NULLIF(titolo_bg, ''), NULLIF(titolo_en, ''), NULLIF(titolo, '')),
  sottotitolo_en = COALESCE(NULLIF(sottotitolo_en, ''), NULLIF(sottotitolo, '')),
  sottotitolo_de = COALESCE(NULLIF(sottotitolo_de, ''), NULLIF(sottotitolo_en, ''), NULLIF(sottotitolo, '')),
  sottotitolo_es = COALESCE(NULLIF(sottotitolo_es, ''), NULLIF(sottotitolo_en, ''), NULLIF(sottotitolo, '')),
  sottotitolo_fr = COALESCE(NULLIF(sottotitolo_fr, ''), NULLIF(sottotitolo, '')),
  sottotitolo_bg = COALESCE(NULLIF(sottotitolo_bg, ''), NULLIF(sottotitolo_en, ''), NULLIF(sottotitolo, '')),
  descrizione_en = COALESCE(NULLIF(descrizione_en, ''), NULLIF(descrizione, '')),
  descrizione_de = COALESCE(NULLIF(descrizione_de, ''), NULLIF(descrizione_en, ''), NULLIF(descrizione, '')),
  descrizione_es = COALESCE(NULLIF(descrizione_es, ''), NULLIF(descrizione_en, ''), NULLIF(descrizione, '')),
  descrizione_fr = COALESCE(NULLIF(descrizione_fr, ''), NULLIF(descrizione, '')),
  descrizione_bg = COALESCE(NULLIF(descrizione_bg, ''), NULLIF(descrizione_en, ''), NULLIF(descrizione, '')),
  contenuto_en = COALESCE(NULLIF(contenuto_en, ''), NULLIF(contenuto, '')),
  contenuto_de = COALESCE(NULLIF(contenuto_de, ''), NULLIF(contenuto_en, ''), NULLIF(contenuto, '')),
  contenuto_es = COALESCE(NULLIF(contenuto_es, ''), NULLIF(contenuto_en, ''), NULLIF(contenuto, '')),
  contenuto_fr = COALESCE(NULLIF(contenuto_fr, ''), NULLIF(contenuto, '')),
  contenuto_bg = COALESCE(NULLIF(contenuto_bg, ''), NULLIF(contenuto_en, ''), NULLIF(contenuto, '')),
  categoria_en = COALESCE(NULLIF(categoria_en, ''), NULLIF(categoria, '')),
  categoria_de = COALESCE(NULLIF(categoria_de, ''), NULLIF(categoria_en, ''), NULLIF(categoria, '')),
  categoria_es = COALESCE(NULLIF(categoria_es, ''), NULLIF(categoria_en, ''), NULLIF(categoria, '')),
  categoria_fr = COALESCE(NULLIF(categoria_fr, ''), NULLIF(categoria, '')),
  categoria_bg = COALESCE(NULLIF(categoria_bg, ''), NULLIF(categoria_en, ''), NULLIF(categoria, '')),
  excerpt_fr = COALESCE(NULLIF(excerpt_fr, ''), NULLIF(estratto, ''))
WHERE
  (titolo_en IS NULL OR titolo_en = '')
  OR (titolo_de IS NULL OR titolo_de = '')
  OR (titolo_es IS NULL OR titolo_es = '')
  OR (titolo_fr IS NULL OR titolo_fr = '')
  OR (titolo_bg IS NULL OR titolo_bg = '')
  OR (sottotitolo_en IS NULL OR sottotitolo_en = '')
  OR (sottotitolo_de IS NULL OR sottotitolo_de = '')
  OR (sottotitolo_es IS NULL OR sottotitolo_es = '')
  OR (sottotitolo_fr IS NULL OR sottotitolo_fr = '')
  OR (sottotitolo_bg IS NULL OR sottotitolo_bg = '')
  OR (descrizione_en IS NULL OR descrizione_en = '')
  OR (descrizione_de IS NULL OR descrizione_de = '')
  OR (descrizione_es IS NULL OR descrizione_es = '')
  OR (descrizione_fr IS NULL OR descrizione_fr = '')
  OR (descrizione_bg IS NULL OR descrizione_bg = '')
  OR (contenuto_en IS NULL OR contenuto_en = '')
  OR (contenuto_de IS NULL OR contenuto_de = '')
  OR (contenuto_es IS NULL OR contenuto_es = '')
  OR (contenuto_fr IS NULL OR contenuto_fr = '')
  OR (contenuto_bg IS NULL OR contenuto_bg = '')
  OR (categoria_en IS NULL OR categoria_en = '')
  OR (categoria_de IS NULL OR categoria_de = '')
  OR (categoria_es IS NULL OR categoria_es = '')
  OR (categoria_fr IS NULL OR categoria_fr = '')
  OR (categoria_bg IS NULL OR categoria_bg = '')
  OR (excerpt_fr IS NULL OR excerpt_fr = '');
