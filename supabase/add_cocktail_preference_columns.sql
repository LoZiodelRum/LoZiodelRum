-- Add configurator preference columns to cocktail catalog table.
-- Safe to run multiple times thanks to IF NOT EXISTS.

-- MIGRATION: rinomina texture in sensazione_palato
-- ALTER TABLE public.cocktail RENAME COLUMN texture TO sensazione_palato;
ALTER TABLE IF EXISTS public.cocktail
  ADD COLUMN IF NOT EXISTS base_alcolica text,
  ADD COLUMN IF NOT EXISTS intensita_alcolica text,
  ADD COLUMN IF NOT EXISTS profilo_gustativo text,
  ADD COLUMN IF NOT EXISTS famiglia_aromatica text,
  ADD COLUMN IF NOT EXISTS "Genere" text,
  ADD COLUMN IF NOT EXISTS sensazione_palato text;
