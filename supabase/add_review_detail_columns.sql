ALTER TABLE public."Recensioni"
ADD COLUMN IF NOT EXISTS servizio int4,
ADD COLUMN IF NOT EXISTS qualita_drink int4,
ADD COLUMN IF NOT EXISTS qualita_prezzo int4,
ADD COLUMN IF NOT EXISTS atmosfera int4,
ADD COLUMN IF NOT EXISTS tags text;
