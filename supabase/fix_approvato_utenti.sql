-- Approva tutti gli utenti con ruolo "utente" che hanno approvato NULL o false
-- (creati prima del fix che aggiungeva approvato: true in fase di signup)
UPDATE "Profili"
SET approvato = true
WHERE ruolo = 'utente'
  AND (approvato IS NULL OR approvato = false);
