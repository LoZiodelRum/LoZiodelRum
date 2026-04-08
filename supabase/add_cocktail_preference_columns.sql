-- Add configurator preference columns to cocktail catalog tables.
-- Safe to run multiple times thanks to IF NOT EXISTS.

ALTER TABLE IF EXISTS public.cocktails
  ADD COLUMN IF NOT EXISTS base_alcolica text,
  ADD COLUMN IF NOT EXISTS intensita_alcolica text,
  ADD COLUMN IF NOT EXISTS profilo_gustativo text,
  ADD COLUMN IF NOT EXISTS profilo_aromatico text,
  ADD COLUMN IF NOT EXISTS stile_consumo text,
  ADD COLUMN IF NOT EXISTS carattere text;

ALTER TABLE IF EXISTS public.cocktail
  ADD COLUMN IF NOT EXISTS base_alcolica text,
  ADD COLUMN IF NOT EXISTS intensita_alcolica text,
  ADD COLUMN IF NOT EXISTS profilo_gustativo text,
  ADD COLUMN IF NOT EXISTS profilo_aromatico text,
  ADD COLUMN IF NOT EXISTS stile_consumo text,
  ADD COLUMN IF NOT EXISTS carattere text;
