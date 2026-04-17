ALTER TABLE baretto_messaggi
ADD COLUMN IF NOT EXISTS stanza text DEFAULT 'Generale';
