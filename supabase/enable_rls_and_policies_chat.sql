-- Abilita Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- POLICY chat_rooms
CREATE POLICY "Authenticated users can create rooms"
ON public.chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = creato_da
);

CREATE POLICY "Anyone can view public rooms"
ON public.chat_rooms
FOR SELECT
TO authenticated
USING (
  deleted = false
);

CREATE POLICY "Admins can update own rooms"
ON public.chat_rooms
FOR UPDATE
TO authenticated
USING (
  creato_da = auth.uid()
);

CREATE POLICY "Admins can delete own rooms"
ON public.chat_rooms
FOR DELETE
TO authenticated
USING (
  creato_da = auth.uid()
);

-- POLICY chat_room_members
CREATE POLICY "Users can join rooms"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Members can view memberships"
ON public.chat_room_members
FOR SELECT
TO authenticated
USING (
  true
);

CREATE POLICY "Users can update own membership"
ON public.chat_room_members
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

-- POLICY chat_messages
CREATE POLICY "Members can send messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Members can read messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  true
);

CREATE POLICY "Users can edit own messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete own messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);
