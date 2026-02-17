-- Aggiunge colonna approvato alla tabella Locali
alter table public."Locali" add column if not exists approvato boolean default false;
