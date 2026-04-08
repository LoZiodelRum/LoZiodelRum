-- Add configurator preference columns to cocktail catalog table.
-- Safe to run multiple times thanks to IF NOT EXISTS.

ALTER TABLE IF EXISTS public.cocktail
  ADD COLUMN IF NOT EXISTS base_alcolica text,
  ADD COLUMN IF NOT EXISTS intensita_alcolica text,
  ADD COLUMN IF NOT EXISTS profilo_gustativo text,
  ADD COLUMN IF NOT EXISTS famiglia_aromatica text,
  ADD COLUMN IF NOT EXISTS stile_consumo text,
  ADD COLUMN IF NOT EXISTS texture text;
