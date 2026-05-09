-- TABELLA TAVOLI
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descrizione text,
  immagine text,
  categoria text,
  pubblico boolean DEFAULT true,
  creato_da uuid,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABELLA MEMBRI
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid,
  ruolo text DEFAULT 'member',
  online boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

-- TABELLA MESSAGGI
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid,
  testo text,
  immagine text,
  audio text,
  eliminato boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
