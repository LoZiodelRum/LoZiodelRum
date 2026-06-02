export type TavoloRow = {
  id: string;
  nome: string;
  descrizione: string | null;
  categoria: string | null;
  copertina_url: string | null;
  creatore_id: string;
  pubblico: boolean;
  chiuso: boolean;
  created_at: string;
};

export type TavoloMembroRow = {
  id: string;
  tavolo_id: string;
  utente_id: string;
  joined_at: string;
};

export type MessaggioTavoloRow = {
  id: string;
  tavolo_id: string;
  utente_id: string;
  messaggio: string | null;
  immagine_url: string | null;
  risposta_a: string | null;
  created_at: string;
};

export type ReazioneMessaggioRow = {
  id: string;
  messaggio_id: string;
  utente_id: string;
  tipo: string;
};

export type SegnalazioneChatRow = {
  id: string;
  messaggio_id: string;
  utente_id: string;
  motivo: string;
  created_at: string;
};

export type PresenzaBarettoRow = {
  user_id: string;
  username: string | null;
  online: boolean;
  last_seen: string;
};

export type BarettoNotificaRow = {
  id: string;
  destinatario_id: string;
  tavolo_id: string;
  messaggio_id: string;
  tipo: "message" | "mention";
  letto: boolean;
  created_at: string;
};

export type ProfiloMini = {
  id: string;
  nome: string | null;
  username: string | null;
  avatar_url: string | null;
  ruolo: string | null;
  status: string | null;
};

export type TavoloComputed = TavoloRow & {
  membriCount: number;
  messaggiCount: number;
  creatore?: ProfiloMini | null;
};

export type ReactionAggregate = Record<string, Record<string, number>>;

export type UiTab = "chat" | "media" | "membri" | "info";

export type CreateTavoloPayload = {
  nome: string;
  descrizione: string;
  categoria: string;
  pubblico: boolean;
  copertinaFile?: File | null;
};

export type UpdateTavoloPayload = {
  nome: string;
  descrizione: string;
  categoria: string;
  pubblico: boolean;
  chiuso: boolean;
  copertinaFile?: File | null;
};
