-- Remove deprecated Locali columns no longer used by the app.
ALTER TABLE IF EXISTS "Locali"
  DROP COLUMN IF EXISTS featured,
  DROP COLUMN IF EXISTS specialities,
  DROP COLUMN IF EXISTS overall_rating,
  DROP COLUMN IF EXISTS punti_di_forza,
  DROP COLUMN IF EXISTS aree_di_miglioramento,
  DROP COLUMN IF EXISTS categorie;

-- Safety fallback for lowercase table naming.
ALTER TABLE IF EXISTS locali
  DROP COLUMN IF EXISTS featured,
  DROP COLUMN IF EXISTS specialities,
  DROP COLUMN IF EXISTS overall_rating,
  DROP COLUMN IF EXISTS punti_di_forza,
  DROP COLUMN IF EXISTS aree_di_miglioramento,
  DROP COLUMN IF EXISTS categorie;
