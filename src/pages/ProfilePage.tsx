import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Crown,
  Diamond,
  Flame,
  GlassWater,
  Grid2X2,
  MapPin,
  Medal,
  MessageCircleMore,
  Search,
  Sparkles,
  Star,
  UserCircle2,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LoungeBottomNavigation from "../components/lounge/LoungeBottomNavigation";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

type ProfileRecord = {
  id?: string;
  user_id?: string;
  nome?: string | null;
  cognome?: string | null;
  username?: string | null;
  email?: string | null;
  cellulare?: string | null;
  telefono?: string | null;
  city?: string | null;
  citta?: string | null;
  paese?: string | null;
  foto_profilo?: string | null;
  ruolo?: string | null;
  status?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  bio_breve?: string | null;
  genere?: string | null;
  distillato_preferito?: string | null;
  cocktail_preferito?: string | null;
  intensita_preferita?: string | null;
  profilo_gustativo_preferito?: string | null;
  famiglia_aromatica_preferita?: string | null;
  metodo_consumo_preferito?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  sito_web?: string | null;
  livello?: number | null;
  level?: number | null;
  punti?: number | null;
  points?: number | null;
  badge?: string[] | string | null;
  badges?: string[] | string | null;
  numero_recensioni?: number | null;
  numero_locali_visitati?: number | null;
  numero_cocktail_creati?: number | null;
  ultimo_accesso?: string | null;
  email_verificata?: boolean | null;
  approvato?: boolean | null;
  [key: string]: unknown;
};

type ProfileLookupResult = {
  tableName: string;
  filterKey: string;
  filterValue: string;
  record: ProfileRecord;
};

type EditableFieldConfig = {
  key: string;
  label: string;
  aliases: string[];
  type?: "text" | "email" | "url" | "textarea";
  readOnly?: boolean;
};

const PROFILE_TABLE_CANDIDATES = ["Profili", "profili", "profiles"];

const EDITABLE_PROFILE_FIELDS: EditableFieldConfig[] = [
  { key: "nome", label: "Nome", aliases: ["nome"] },
  { key: "cognome", label: "Cognome", aliases: ["cognome"] },
  { key: "username", label: "Username", aliases: ["username"] },
  { key: "email", label: "Email", aliases: ["email"], type: "email", readOnly: true },
  { key: "cellulare", label: "Cellulare", aliases: ["cellulare", "telefono", "phone"] },
  { key: "citta", label: "Citta", aliases: ["citta", "city"] },
  { key: "paese", label: "Paese", aliases: ["paese"] },
  { key: "bio", label: "Bio", aliases: ["bio", "bio_breve"], type: "textarea" },
  { key: "genere", label: "Genere", aliases: ["genere"] },
  { key: "distillato_preferito", label: "Distillato preferito", aliases: ["distillato_preferito"] },
  { key: "cocktail_preferito", label: "Cocktail preferito", aliases: ["cocktail_preferito"] },
  { key: "intensita_preferita", label: "Intensita preferita", aliases: ["intensita_preferita"] },
  { key: "profilo_gustativo_preferito", label: "Profilo gustativo preferito", aliases: ["profilo_gustativo_preferito"] },
  { key: "famiglia_aromatica_preferita", label: "Famiglia aromatica preferita", aliases: ["famiglia_aromatica_preferita"] },
  { key: "metodo_consumo_preferito", label: "Metodo consumo preferito", aliases: ["metodo_consumo_preferito"] },
  { key: "instagram", label: "Instagram", aliases: ["instagram"] },
  { key: "tiktok", label: "TikTok", aliases: ["tiktok"] },
  { key: "sito_web", label: "Sito web", aliases: ["sito_web"], type: "url" },
];

const READONLY_PROFILE_FIELDS: EditableFieldConfig[] = [
  { key: "livello", label: "Livello", aliases: ["livello", "level"] },
  { key: "punti", label: "Punti", aliases: ["punti", "points"] },
  { key: "ruolo", label: "Ruolo", aliases: ["ruolo", "role"] },
  { key: "badge", label: "Badge", aliases: ["badge", "badges"] },
  { key: "numero_recensioni", label: "Numero recensioni", aliases: ["numero_recensioni"] },
  { key: "numero_locali_visitati", label: "Numero locali visitati", aliases: ["numero_locali_visitati"] },
  { key: "numero_cocktail_creati", label: "Numero cocktail creati", aliases: ["numero_cocktail_creati"] },
  { key: "ultimo_accesso", label: "Ultimo accesso", aliases: ["ultimo_accesso"] },
  { key: "email_verificata", label: "Email verificata", aliases: ["email_verificata"] },
  { key: "approvato", label: "Approvato", aliases: ["approvato"] },
];

type ChipItem = {
  id: string;
  label: string;
  accent: string;
  icon: LucideIcon;
  to?: string;
};

type ReservationItem = {
  id: string;
  title: string;
  city: string;
  time: string;
  month: string;
  day: string;
  image: string;
};

const pageBackground =
  "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)";

const badgeItems: ChipItem[] = [
  { id: "rum", label: "Rum Explorer", accent: "#ff7f3f", icon: Medal, to: "/profilo/badge" },
  { id: "whisky", label: "Whisky Hunter", accent: "#f4b11b", icon: Crown, to: "/profilo/badge" },
  { id: "cocktail", label: "Cocktail Lover", accent: "#d65bff", icon: GlassWater, to: "/profilo/badge" },
  { id: "premium", label: "Premium Member", accent: "#21ebd6", icon: Diamond, to: "/profilo/badge" },
  { id: "founder", label: "Founder Member", accent: "#5e77ff", icon: Crown, to: "/profilo/badge" },
];

const tasteItems: ChipItem[] = [
  { id: "funky", label: "Funky", accent: "#b85dff", icon: Sparkles, to: "/profilo/preferenze" },
  { id: "smoky", label: "Smoky", accent: "#3a7dff", icon: Flame, to: "/profilo/preferenze" },
  { id: "tropical", label: "Tropical", accent: "#10dcc0", icon: Sparkles, to: "/profilo/preferenze" },
  { id: "elegant", label: "Elegant", accent: "#d36cff", icon: Star, to: "/profilo/preferenze" },
  { id: "dry", label: "Dry", accent: "#f0b83b", icon: Sparkles, to: "/profilo/preferenze" },
  { id: "vanilla", label: "Vanilla", accent: "#ff933d", icon: Sparkles, to: "/profilo/preferenze" },
];

const reservations: ReservationItem[] = [
  {
    id: "caribbean-rum-night",
    title: "Caribbean Rum Night",
    city: "Milano",
    time: "20:00",
    month: "MAG",
    day: "24",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80",
  },
  {
    id: "pairing-dinner",
    title: "Pairing Dinner",
    city: "Milano",
    time: "19:30",
    month: "MAG",
    day: "31",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
  {
    id: "guest-shift",
    title: "Guest Shift",
    city: "Milano",
    time: "21:00",
    month: "GIU",
    day: "07",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80",
  },
];

function toTextValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value);
}

function findExistingKey(record: ProfileRecord | null, aliases: string[]) {
  if (!record) return null;
  return aliases.find((alias) => Object.prototype.hasOwnProperty.call(record, alias)) || null;
}

function formatReadonlyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Non disponibile";
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Non disponibile";
  const raw = String(value);
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime()) && /(\d{4}-\d{2}-\d{2}|T\d{2}:\d{2}:\d{2})/.test(raw)) {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return raw;
}

function getProfileImageUrl(record: ProfileRecord | null, metadata?: Record<string, unknown>) {
  return String(
    record?.foto_profilo ||
      record?.avatar_url ||
      metadata?.foto_profilo ||
      metadata?.avatar_url ||
      metadata?.picture ||
      "",
  ).trim();
}

async function findOwnProfileRecord(user: any): Promise<ProfileLookupResult | null> {
  if (!user?.id && !user?.email) return null;

  const filters = [
    user?.id ? { key: "id", value: String(user.id) } : null,
    user?.id ? { key: "user_id", value: String(user.id) } : null,
    user?.email ? { key: "email", value: String(user.email) } : null,
  ].filter(Boolean) as Array<{ key: string; value: string }>;

  for (const tableName of PROFILE_TABLE_CANDIDATES) {
    for (const filter of filters) {
      const result = await supabase.from(tableName).select("*").eq(filter.key, filter.value).maybeSingle();
      if (!result.error && result.data) {
        return {
          tableName,
          filterKey: filter.key,
          filterValue: filter.value,
          record: result.data as ProfileRecord,
        };
      }
    }
  }

  return null;
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildDynamicBadges(profile: ProfileRecord | null, memberRole: string) {
  const items: ChipItem[] = [];

  if (profile?.distillato_preferito) {
    const spirit = String(profile.distillato_preferito).toLowerCase();
    if (spirit.includes("rum")) {
      items.push({ id: "rum", label: "Rum Explorer", accent: "#ff7f3f", icon: Medal, to: "/profilo/badge" });
    }
    if (spirit.includes("whisk")) {
      items.push({ id: "whisky", label: "Whisky Hunter", accent: "#f4b11b", icon: Crown, to: "/profilo/badge" });
    }
  }

  if (profile?.cocktail_preferito) {
    items.push({ id: "cocktail", label: "Cocktail Lover", accent: "#d65bff", icon: GlassWater, to: "/profilo/badge" });
  }

  if (String(profile?.status || "").toLowerCase().includes("premium")) {
    items.push({ id: "premium", label: "Premium Member", accent: "#21ebd6", icon: Diamond, to: "/profilo/badge" });
  }

  if (memberRole.toLowerCase().includes("founder") || memberRole.toLowerCase().includes("admin")) {
    items.push({ id: "founder", label: "Founder Member", accent: "#5e77ff", icon: Crown, to: "/profilo/badge" });
  }

  const deduped = items.filter((item, index, array) => array.findIndex((entry) => entry.label === item.label) === index);
  return deduped.length ? deduped : badgeItems;
}

function buildTasteProfile(profile: ProfileRecord | null) {
  const derived: ChipItem[] = [];
  const taste = String(profile?.profilo_gustativo_preferito || "").trim();
  const spirit = String(profile?.distillato_preferito || "").trim();
  const cocktail = String(profile?.cocktail_preferito || "").trim();

  if (taste) {
    derived.push({ id: "taste-main", label: titleCase(taste), accent: "#d36cff", icon: Sparkles, to: "/profilo/preferenze" });
  }
  if (spirit) {
    derived.push({ id: "taste-spirit", label: titleCase(spirit), accent: "#f0b83b", icon: Wine, to: "/profilo/preferenze" });
  }
  if (cocktail) {
    derived.push({ id: "taste-cocktail", label: titleCase(cocktail), accent: "#ff933d", icon: GlassWater, to: "/profilo/preferenze" });
  }

  return derived.length ? derived : tasteItems;
}

function useProfileData() {
  const { user, role } = useUser();
  const [profile, setProfile] = React.useState<ProfileRecord | null>(null);

  React.useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) {
        if (active) setProfile(null);
        return;
      }

      const query = "id, nome, cognome, username, ruolo, status, avatar_url, foto_profilo, bio_breve, distillato_preferito, cocktail_preferito, profilo_gustativo_preferito, numero_recensioni, numero_locali_visitati, numero_cocktail_creati";
      const primary = await supabase.from("Profili").select(query).eq("id", user.id).maybeSingle();
      const fallback = !primary.data
        ? await supabase.from("profili").select(query).eq("id", user.id).maybeSingle()
        : null;

      const record = (primary.data || fallback?.data || null) as ProfileRecord | null;
      if (active) {
        setProfile({
          ...record,
          ruolo: record?.ruolo || role || "utente",
        });
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [role, user?.id]);

  const metadata = (user?.user_metadata || {}) as Record<string, unknown>;
  const fullName = [profile?.nome || metadata.nome, profile?.cognome || metadata.cognome]
    .filter(Boolean)
    .join(" ")
    .trim();

  const displayName =
    fullName ||
    String(profile?.username || metadata.username || user?.email?.split("@")[0] || "Ospite DrinkWise");

  const memberRole = normalizeRoleLabel(String(profile?.ruolo || role || metadata.ruolo || "Founding Member"));
  const avatarUrl = getProfileImageUrl(profile, metadata) || null;
  const bio = String(profile?.bio_breve || metadata.bio_breve || metadata.bio || "").trim() || "Colleziona esperienze premium, lascia recensioni e costruisce il proprio percorso DrinkWise.";
  const dynamicBadges = buildDynamicBadges(profile, memberRole);
  const tasteProfile = buildTasteProfile(profile);
  const reservationItems = reservations.map((item, index) => ({
    ...item,
    city: String(metadata.citta_locale || item.city),
    time: index === 0 && profile?.numero_cocktail_creati ? "21:00" : item.time,
  }));

  return {
    user,
    profile,
    displayName,
    memberRole,
    avatarUrl,
    reviewCount: Number(profile?.numero_recensioni || 92),
    venuesCount: Number(profile?.numero_locali_visitati || 128),
    eventsCount: Number(profile?.numero_cocktail_creati || reservationItems.length || 36),
    bottlesCount: 18,
    bio,
    dynamicBadges,
    tasteProfile,
    reservationItems,
  };
}

function normalizeRoleLabel(role: string) {
  const normalized = role.trim().toLowerCase();
  if (!normalized) return "Founder Member";
  if (normalized === "admin") return "Founder Member";
  if (normalized === "bartender") return "Bartender Member";
  if (normalized === "proprietario") return "Premium Member";
  return role
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="profile-page-root"
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: "#eef6ff",
        padding: "120px 24px 40px",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="profile-card">{children}</div>;
}

function ProfileHeaderButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="profile-square-btn" onClick={onClick}>
      {children}
    </button>
  );
}

function ProfileChip({ item }: { item: ChipItem }) {
  const navigate = useNavigate();
  const Icon = item.icon;
  return (
    <button
      className="profile-chip"
      style={{ ["--chip-accent" as string]: item.accent }}
      onClick={() => {
        if (item.to) navigate(item.to);
      }}
    >
      <span className="profile-chip-icon">
        <Icon size={16} strokeWidth={2} />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

function SpiritCard({ title, subtitle, accent, icon: Icon }: { title: string; subtitle: string; accent: string; icon: LucideIcon }) {
  return (
    <button className="spirit-card" style={{ ["--spirit-accent" as string]: accent }}>
      <span className="spirit-card-icon">
        <Icon size={24} strokeWidth={2} />
      </span>
      <span className="spirit-card-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <span className="spirit-card-arrow">›</span>
    </button>
  );
}

function ReservationCard({ item }: { item: ReservationItem }) {
  const navigate = useNavigate();
  return (
    <button className="reservation-card" onClick={() => navigate(`/evento/${item.id}`)}>
      <img src={item.image} alt={item.title} className="reservation-card-image" />
      <span className="reservation-card-copy">
        <strong>{item.title}</strong>
        <small>
          <MapPin size={13} strokeWidth={2} /> {item.city} <span className="dot-separator">•</span> {item.time}
        </small>
      </span>
      <span className="reservation-date-box">
        <span>{item.month}</span>
        <strong>{item.day}</strong>
      </span>
      <span className="reservation-go">›</span>
    </button>
  );
}

function ProfileStyles() {
  return (
    <style>{`
      .profile-shell {
        width: min(980px, 100%);
        margin: 0 auto;
        font-family: "Sora", "Segoe UI", sans-serif;
      }
      .profile-topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 18px;
      }
      .profile-title-wrap { display: flex; gap: 14px; align-items: flex-start; }
      .profile-title-icon {
        width: 54px; height: 54px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        border: 1px solid rgba(54, 246, 227, 0.65);
        box-shadow: 0 0 20px rgba(54, 246, 227, 0.25);
        background: radial-gradient(circle at 30% 30%, rgba(57,255,234,0.2), rgba(8,27,57,0.92));
        color: #8dfff7;
        flex: 0 0 auto;
      }
      .profile-title { margin: 0; font-size: clamp(34px, 5vw, 48px); line-height: 1; color: #fff; }
      .profile-subtitle { margin: 7px 0 0; font-size: clamp(16px, 2vw, 22px); color: rgba(227,236,255,0.82); }
      .profile-topbar-actions { display: flex; gap: 10px; }
      .profile-square-btn {
        width: clamp(58px, 9vw, 76px); height: clamp(58px, 9vw, 76px);
        border-radius: 22px; border: 1px solid rgba(109,135,255,0.42);
        background: linear-gradient(160deg, rgba(17,31,78,0.76), rgba(5,12,32,0.96));
        box-shadow: 0 0 22px rgba(65, 121, 255, 0.14);
        color: #eff4ff; display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer;
      }
      .profile-card {
        background: linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98));
        border: 1px solid rgba(98, 122, 255, 0.24);
        border-radius: 28px;
        box-shadow: 0 0 30px rgba(31, 78, 197, 0.12), inset 0 1px 0 rgba(255,255,255,0.05);
        overflow: hidden;
        margin-bottom: 14px;
      }
      .profile-hero { padding: 16px 18px 0; }
      .profile-hero-main {
        display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center;
        padding-bottom: 16px;
      }
      .profile-avatar {
        width: clamp(104px, 18vw, 160px); height: clamp(104px, 18vw, 160px);
        border-radius: 50%; border: 3px solid rgba(51, 245, 227, 0.86);
        box-shadow: 0 0 24px rgba(51,245,227,0.25);
        object-fit: cover; display: block;
        background: radial-gradient(circle at 35% 25%, rgba(56,255,236,0.22), rgba(11,25,59,0.95));
      }
      .profile-avatar-fallback {
        width: clamp(104px, 18vw, 160px); height: clamp(104px, 18vw, 160px);
        border-radius: 50%; border: 3px solid rgba(51, 245, 227, 0.86);
        box-shadow: 0 0 24px rgba(51,245,227,0.25);
        display: flex; align-items: center; justify-content: center;
        font-size: clamp(32px, 6vw, 54px); font-weight: 800; color: #fff;
        background: radial-gradient(circle at 35% 25%, rgba(56,255,236,0.22), rgba(11,25,59,0.95));
      }
      .profile-hero-copy h2 { margin: 0; color: #fff; font-size: clamp(30px, 4.6vw, 46px); }
      .profile-role { margin: 8px 0 0; color: #f4ca4f; font-size: clamp(16px, 2vw, 24px); display: flex; gap: 8px; align-items: center; }
      .profile-tag {
        display: inline-flex; align-items: center; gap: 10px; margin-top: 16px;
        padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(42,241,230,0.8);
        background: rgba(8, 37, 62, 0.78); color: #32f7eb; font-weight: 600;
        box-shadow: 0 0 18px rgba(50,247,235,0.18);
      }
      .profile-hero-art {
        width: clamp(110px, 18vw, 170px); height: clamp(90px, 14vw, 140px); border-radius: 20px;
        position: relative; overflow: hidden;
        background: radial-gradient(circle at 50% 110%, rgba(0,255,229,0.12), transparent 42%);
      }
      .profile-hero-art::before {
        content: ""; position: absolute; inset: 14px;
        border: 1px solid rgba(0,255,229,0.28); border-radius: 20px;
        box-shadow: inset 0 0 20px rgba(0,255,229,0.04);
      }
      .profile-stats-row {
        border-top: 1px solid rgba(255,255,255,0.08);
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .profile-stat {
        padding: 14px 16px; display: flex; align-items: center; gap: 10px;
        justify-content: center; border-right: 1px solid rgba(255,255,255,0.08);
      }
      .profile-stat:last-child { border-right: 0; }
      .profile-stat-copy strong { display: block; color: #fff; font-size: clamp(22px, 3vw, 34px); }
      .profile-stat-copy span { color: rgba(226,236,255,0.82); font-size: clamp(12px, 1.7vw, 18px); }
      .profile-section-header {
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        padding: 14px 18px 10px;
      }
      .profile-section-header h3 { margin: 0; font-size: clamp(20px, 3vw, 28px); color: #fff; display: flex; align-items: center; gap: 10px; }
      .profile-link-btn {
        background: none; border: 0; color: rgba(228,237,255,0.78); cursor: pointer; display: inline-flex;
        align-items: center; gap: 8px; font-size: clamp(14px, 1.6vw, 18px);
      }
      .profile-chip-row { display: flex; flex-wrap: wrap; gap: 10px; padding: 0 18px 18px; }
      .profile-chip {
        display: inline-flex; align-items: center; gap: 8px; padding: 12px 14px;
        border-radius: 18px; border: 1px solid color-mix(in srgb, var(--chip-accent) 80%, #fff 20%);
        background: linear-gradient(145deg, color-mix(in srgb, var(--chip-accent) 14%, #101936 86%), rgba(7,12,33,0.94));
        box-shadow: 0 0 18px color-mix(in srgb, var(--chip-accent) 20%, transparent);
        color: #fff; cursor: pointer; font-size: clamp(13px, 1.7vw, 18px);
      }
      .profile-chip-icon {
        color: var(--chip-accent); display: inline-flex; align-items: center; justify-content: center;
      }
      .spirit-grid {
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 0 18px 18px;
      }
      .spirit-card {
        border: 1px solid color-mix(in srgb, var(--spirit-accent) 50%, rgba(255,255,255,0.12));
        background: linear-gradient(145deg, color-mix(in srgb, var(--spirit-accent) 12%, #101936 88%), rgba(8,13,34,0.96));
        box-shadow: 0 0 18px color-mix(in srgb, var(--spirit-accent) 16%, transparent);
        border-radius: 22px; padding: 16px 14px; color: #fff; cursor: pointer;
        display: flex; align-items: center; gap: 12px; text-align: left;
      }
      .spirit-card-icon {
        width: 48px; height: 48px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;
        color: var(--spirit-accent); background: rgba(255,255,255,0.04); flex: 0 0 auto;
      }
      .spirit-card-copy { display: flex; flex-direction: column; min-width: 0; }
      .spirit-card-copy strong { font-size: clamp(18px, 2vw, 28px); }
      .spirit-card-copy small { color: rgba(226,236,255,0.82); font-size: clamp(13px, 1.4vw, 18px); }
      .spirit-card-arrow { margin-left: auto; color: #f0b83b; font-size: 26px; }
      .reservation-list { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 10px; }
      .reservation-card {
        width: 100%; border: 1px solid rgba(98,122,255,0.18); background: rgba(9,15,40,0.88);
        border-radius: 22px; color: #fff; display: grid; grid-template-columns: 116px 1fr auto auto;
        gap: 14px; align-items: center; padding: 10px; cursor: pointer; text-align: left;
      }
      .reservation-card-image { width: 116px; height: 72px; object-fit: cover; border-radius: 16px; }
      .reservation-card-copy { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
      .reservation-card-copy strong { font-size: clamp(18px, 2vw, 28px); }
      .reservation-card-copy small { display: flex; align-items: center; gap: 6px; color: rgba(226,236,255,0.82); font-size: clamp(13px, 1.5vw, 18px); }
      .dot-separator { opacity: 0.7; }
      .reservation-date-box {
        width: 62px; border-radius: 16px; padding: 8px 0; text-align: center;
        border: 1px solid rgba(255,178,63,0.5); background: rgba(255,178,63,0.1);
        color: #ffd570; display: flex; flex-direction: column; gap: 4px;
      }
      .reservation-date-box span { font-size: 12px; }
      .reservation-date-box strong { font-size: 28px; line-height: 1; }
      .reservation-go { color: rgba(240,245,255,0.74); font-size: 30px; padding-right: 6px; }
      .community-grid {
        display: grid; grid-template-columns: 1.1fr 1fr 1fr; border-top: 1px solid rgba(255,255,255,0.08);
      }
      .community-stat { padding: 18px 16px; display: flex; align-items: center; gap: 14px; border-right: 1px solid rgba(255,255,255,0.08); }
      .community-stat:last-child { border-right: 0; }
      .community-score-ring {
        width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        border: 8px solid #40efe0; color: #fff; font-size: 28px; font-weight: 800; box-shadow: 0 0 20px rgba(64,239,224,0.2);
      }
      .community-stat-copy strong { display: block; color: #fff; font-size: clamp(18px, 2vw, 34px); }
      .community-stat-copy span { color: rgba(226,236,255,0.82); font-size: clamp(13px, 1.5vw, 18px); }
      .edit-profile-btn {
        width: min(760px, calc(100% - 44px)); margin: 16px auto 0; display: flex; align-items: center; justify-content: center; gap: 12px;
        padding: 18px 20px; border-radius: 999px; border: 1px solid rgba(108,255,237,0.55);
        background: linear-gradient(180deg, rgba(74,255,228,0.94), rgba(28,188,182,0.92));
        box-shadow: 0 0 28px rgba(60,240,225,0.22); color: #f8ffff; font-size: clamp(20px, 2.4vw, 36px); cursor: pointer;
      }
      .simple-page-shell {
        width: min(840px, 100%); margin: 0 auto; padding-top: 12px;
      }
      .simple-page-inner {
        padding: 30px 24px; border-radius: 28px; border: 1px solid rgba(98,122,255,0.24);
        background: linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98)); color: #fff;
        box-shadow: 0 0 30px rgba(31, 78, 197, 0.12);
      }
      .simple-back-btn {
        display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; padding: 10px 14px; border-radius: 14px;
        border: 1px solid rgba(42,241,230,0.5); background: rgba(10,32,56,0.82); color: #bffef7; cursor: pointer;
      }
      .edit-profile-shell {
        width: min(1040px, 100%);
      }
      .edit-profile-card {
        padding: 24px;
      }
      .edit-profile-actions-top {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 20px;
      }
      .edit-profile-state {
        margin: 0;
        font-size: 16px;
        color: rgba(227,236,255,0.82);
      }
      .edit-profile-form {
        display: grid;
        gap: 22px;
      }
      .edit-profile-photo-block {
        display: grid;
        gap: 12px;
        padding: 18px;
        border-radius: 20px;
        border: 1px solid rgba(255, 192, 91, 0.24);
        background: linear-gradient(160deg, rgba(31, 19, 6, 0.42), rgba(8, 14, 28, 0.86));
      }
      .edit-profile-photo-label {
        font-size: 13px;
        font-weight: 800;
        color: #f4b35e;
        letter-spacing: 0.02em;
      }
      .edit-profile-photo-row {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .edit-profile-photo-avatar,
      .edit-profile-photo-fallback {
        width: 112px;
        height: 112px;
        border-radius: 50%;
        border: 2px solid rgba(255, 192, 91, 0.52);
        flex: 0 0 auto;
      }
      .edit-profile-photo-avatar {
        object-fit: cover;
        background: rgba(7, 14, 28, 0.9);
      }
      .edit-profile-photo-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 30% 30%, rgba(255,205,108,0.3), rgba(13,20,34,0.95));
        color: #fff2d6;
        font-size: 32px;
        font-weight: 900;
      }
      .edit-profile-photo-actions {
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        align-items: center;
        max-width: 100%;
      }
      .edit-profile-photo-btn {
        border: none;
        border-radius: 12px;
        height: 36px;
        padding: 0 14px;
        font: inherit;
        font-size: 13px;
        line-height: 1;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        background: linear-gradient(135deg, #ffcf6d 0%, #ff9b35 100%);
        color: #1a1308;
        box-shadow: 0 14px 28px rgba(255, 155, 53, 0.18);
      }
      .edit-profile-photo-btn.is-secondary {
        background: rgba(255,255,255,0.08);
        color: #eef6ff;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: none;
      }
      .edit-profile-photo-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .edit-profile-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .edit-profile-field {
        display: grid;
        gap: 8px;
      }
      .edit-profile-field-full {
        grid-column: 1 / -1;
      }
      .edit-profile-field span {
        font-size: 13px;
        font-weight: 700;
        color: #f4b35e;
        letter-spacing: 0.02em;
      }
      .edit-profile-field input,
      .edit-profile-field textarea {
        width: 100%;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(7, 14, 28, 0.88);
        color: #eef6ff;
        padding: 14px 16px;
        font: inherit;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .edit-profile-field input:focus,
      .edit-profile-field textarea:focus {
        border-color: rgba(255, 179, 71, 0.72);
        box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.14);
      }
      .edit-profile-field input[readonly] {
        opacity: 0.78;
        cursor: not-allowed;
      }
      .edit-profile-field textarea {
        min-height: 140px;
        resize: vertical;
      }
      .edit-profile-readonly-wrap {
        display: grid;
        gap: 14px;
      }
      .edit-profile-readonly-wrap h3 {
        margin: 0;
        font-size: 18px;
        color: #eef6ff;
      }
      .edit-profile-readonly-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .edit-profile-readonly-card {
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 18px;
        background: rgba(7, 14, 28, 0.7);
        padding: 14px;
        display: grid;
        gap: 8px;
      }
      .edit-profile-readonly-card span {
        font-size: 12px;
        color: rgba(227,236,255,0.66);
      }
      .edit-profile-readonly-card strong {
        font-size: 15px;
        color: #fff4d8;
      }
      .edit-profile-feedback {
        margin: 0;
        padding: 14px 16px;
        border-radius: 14px;
        font-weight: 700;
      }
      .edit-profile-feedback.is-ok {
        background: rgba(30, 125, 76, 0.18);
        border: 1px solid rgba(77, 209, 132, 0.34);
        color: #8ef0b6;
      }
      .edit-profile-feedback.is-error {
        background: rgba(130, 38, 38, 0.2);
        border: 1px solid rgba(255, 120, 120, 0.34);
        color: #ffadad;
      }
      .edit-profile-footer {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .edit-profile-secondary-btn,
      .edit-profile-primary-btn {
        border-radius: 16px;
        padding: 14px 18px;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }
      .edit-profile-secondary-btn {
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(31, 41, 55, 0.88);
        color: #eef6ff;
      }
      .edit-profile-primary-btn {
        border: none;
        background: linear-gradient(135deg, #ffcf6d 0%, #ff9b35 100%);
        color: #151008;
        box-shadow: 0 16px 30px rgba(255, 155, 53, 0.22);
      }
      .edit-profile-primary-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      @media (max-width: 768px) {
        .profile-page-root {
          padding: 100px 14px 40px !important;
        }
      }
      @media (max-width: 900px) {
        .profile-hero-main { grid-template-columns: auto 1fr; }
        .profile-hero-art { display: none; }
        .spirit-grid { grid-template-columns: 1fr; }
        .community-grid { grid-template-columns: 1fr; }
        .community-stat { border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .community-stat:last-child { border-bottom: 0; }
        .edit-profile-photo-row { flex-direction: column; align-items: flex-start; }
        .edit-profile-photo-actions { flex-wrap: wrap; }
        .edit-profile-grid { grid-template-columns: 1fr; }
        .edit-profile-readonly-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .profile-topbar { gap: 8px; }
        .profile-title-wrap { gap: 10px; }
        .profile-title-icon { width: 46px; height: 46px; }
        .profile-topbar-actions { gap: 8px; }
        .profile-square-btn { width: 54px; height: 54px; border-radius: 18px; }
        .profile-card { border-radius: 22px; }
        .profile-hero { padding: 14px 14px 0; }
        .profile-hero-main { grid-template-columns: 1fr; gap: 14px; }
        .profile-avatar, .profile-avatar-fallback { width: 112px; height: 112px; }
        .profile-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .profile-stat { justify-content: flex-start; border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .profile-stat:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.08); }
        .profile-stat:nth-last-child(-n+2) { border-bottom: 0; }
        .profile-chip-row { padding: 0 14px 14px; gap: 8px; }
        .profile-chip { padding: 10px 12px; border-radius: 15px; }
        .reservation-card {
          grid-template-columns: 84px 1fr auto; gap: 10px; padding: 8px;
        }
        .reservation-card-image { width: 84px; height: 68px; }
        .reservation-go { display: none; }
        .reservation-date-box { width: 54px; border-radius: 14px; }
        .reservation-date-box strong { font-size: 22px; }
        .edit-profile-btn { width: calc(100% - 20px); padding: 16px 18px; }
        .edit-profile-card { padding: 18px; }
        .edit-profile-photo-avatar,
        .edit-profile-photo-fallback { width: 96px; height: 96px; }
        .edit-profile-photo-actions {
          width: auto;
          max-width: 100%;
          gap: 10px;
          flex-wrap: wrap;
        }
        .edit-profile-photo-btn {
          width: auto;
          height: 34px;
          font-size: 12px;
          padding: 0 12px;
          border-radius: 9px;
          text-align: center;
        }
        .edit-profile-readonly-grid { grid-template-columns: 1fr; }
        .edit-profile-footer { flex-direction: column-reverse; }
        .edit-profile-secondary-btn,
        .edit-profile-primary-btn { width: 100%; }
      }
    `}</style>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    displayName,
    memberRole,
    avatarUrl,
    reviewCount,
    venuesCount,
    eventsCount,
    bottlesCount,
    profile,
    bio,
    dynamicBadges,
    tasteProfile,
    reservationItems,
  } = useProfileData();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DW";

  const tasteLabel = profile?.profilo_gustativo_preferito || "Legendary Sipper";
  const preferredSpirit = profile?.distillato_preferito || "Rum";
  const preferredCocktail = profile?.cocktail_preferito || "Signature Cocktails";

  return (
    <PageShell>
      <ProfileStyles />
      <LoungeBottomNavigation />

      <section className="profile-shell">
        <header className="profile-topbar">
          <div className="profile-title-wrap">
            <div className="profile-title-icon">
              <UserCircle2 size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="profile-title">Profilo</h1>
              <p className="profile-subtitle">La tua identità premium DrinkWise</p>
            </div>
          </div>

          <div className="profile-topbar-actions">
            <ProfileHeaderButton onClick={() => navigate("/discover")}>
              <Grid2X2 size={28} strokeWidth={2} />
            </ProfileHeaderButton>
            <ProfileHeaderButton onClick={() => navigate("/venues")}>
              <Search size={30} strokeWidth={2} />
            </ProfileHeaderButton>
          </div>
        </header>

        <SectionCard>
          <div className="profile-hero">
            <div className="profile-hero-main">
              {avatarUrl ? (
                <img className="profile-avatar" src={avatarUrl} alt={displayName} />
              ) : (
                <div className="profile-avatar-fallback">{initials}</div>
              )}

              <div className="profile-hero-copy">
                <h2>{displayName}</h2>
                <p className="profile-role"><Crown size={22} strokeWidth={2} /> {memberRole}</p>
                <div className="profile-tag">
                  <Star size={18} strokeWidth={2} /> {tasteLabel}
                </div>
                <p style={{ margin: "14px 0 0", color: "rgba(226,236,255,0.78)", fontSize: "clamp(14px, 1.8vw, 18px)", lineHeight: 1.5, maxWidth: 560 }}>
                  {bio}
                </p>
              </div>

              <div className="profile-hero-art" aria-hidden="true" />
            </div>
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <MapPin color="#ff8d47" size={24} strokeWidth={2} />
              <div className="profile-stat-copy"><strong>{venuesCount}</strong><span>Locali visitati</span></div>
            </div>
            <div className="profile-stat">
              <CalendarDays color="#a970ff" size={24} strokeWidth={2} />
              <div className="profile-stat-copy"><strong>{eventsCount}</strong><span>Eventi</span></div>
            </div>
            <div className="profile-stat">
              <MessageCircleMore color="#87fff3" size={24} strokeWidth={2} />
              <div className="profile-stat-copy"><strong>{reviewCount}</strong><span>Recensioni</span></div>
            </div>
            <div className="profile-stat">
              <Wine color="#d47bff" size={24} strokeWidth={2} />
              <div className="profile-stat-copy"><strong>{bottlesCount}</strong><span>Bottiglie salvate</span></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="profile-section-header">
            <h3><BadgeCheck size={22} strokeWidth={2} /> Badge</h3>
            <button className="profile-link-btn" onClick={() => navigate("/profilo/badge")}>Vedi tutti <ChevronRight size={18} strokeWidth={2} /></button>
          </div>
          <div className="profile-chip-row">
            {dynamicBadges.map((item) => <ProfileChip key={item.id} item={item} />)}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="profile-section-header">
            <h3><Sparkles size={22} strokeWidth={2} /> Profilo gustativo</h3>
            <button className="profile-link-btn" onClick={() => navigate("/profilo/preferenze")}>Modifica gusti <ChevronRight size={18} strokeWidth={2} /></button>
          </div>
          <div className="profile-chip-row">
            {tasteProfile.map((item) => <ProfileChip key={item.id} item={item} />)}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="profile-section-header">
            <h3><Wine size={22} strokeWidth={2} /> Distillati preferiti</h3>
            <button className="profile-link-btn" onClick={() => navigate("/profilo/preferenze")}>Gestisci <ChevronRight size={18} strokeWidth={2} /></button>
          </div>
          <div className="spirit-grid">
            <SpiritCard title={preferredSpirit} subtitle="Audace, tropicale e avventuroso" accent="#ff9e49" icon={Wine} />
            <SpiritCard title="Whisky" subtitle="Ricco, smoky e complesso" accent="#f2bf42" icon={GlassWater} />
            <SpiritCard title={preferredCocktail} subtitle="Creativo, bilanciato e memorabile" accent="#d76aff" icon={GlassWater} />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="profile-section-header">
            <h3><CalendarDays size={22} strokeWidth={2} /> Prenotazioni future</h3>
            <button className="profile-link-btn" onClick={() => navigate("/eventi")}>Vedi tutti <ChevronRight size={18} strokeWidth={2} /></button>
          </div>
          <div className="reservation-list">
            {reservationItems.map((item) => <ReservationCard key={item.id} item={item} />)}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="community-grid">
            <div className="community-stat">
              <div className="community-score-ring">78</div>
              <div className="community-stat-copy"><strong>Community Score</strong><span>/ 100</span></div>
            </div>
            <div className="community-stat">
              <CalendarDays color="#65b8ff" size={46} strokeWidth={1.8} />
              <div className="community-stat-copy"><strong>146</strong><span>Note degustazione condivise</span></div>
            </div>
            <div className="community-stat">
              <Flame color="#ff9b53" size={46} strokeWidth={1.8} />
              <div className="community-stat-copy"><strong>14</strong><span>Giorni consecutivi attivi</span></div>
            </div>
          </div>
        </SectionCard>

        <button className="edit-profile-btn" onClick={() => navigate("/modifica-profilo")}>
          Modifica profilo <ChevronRight size={28} strokeWidth={2} />
        </button>

        <div style={{ height: 140 }} />
      </section>
    </PageShell>
  );
}

function SimpleProfileSubpage({ title, description, backTo }: { title: string; description: string; backTo: string }) {
  const navigate = useNavigate();
  return (
    <PageShell>
      <ProfileStyles />
      <section className="simple-page-shell">
        <div className="simple-page-inner">
          <button className="simple-back-btn" onClick={() => navigate(backTo)}>← Torna indietro</button>
          <h1 style={{ marginTop: 0, fontSize: "clamp(30px, 5vw, 46px)" }}>{title}</h1>
          <p style={{ color: "rgba(227,236,255,0.82)", fontSize: "clamp(16px, 2vw, 22px)", lineHeight: 1.6 }}>{description}</p>
        </div>
      </section>
    </PageShell>
  );
}

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [feedbackKind, setFeedbackKind] = React.useState<"ok" | "error" | null>(null);
  const [profileLookup, setProfileLookup] = React.useState<ProfileLookupResult | null>(null);
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});
  const [editableFieldMap, setEditableFieldMap] = React.useState<Record<string, string | null>>({});
  const [readonlyEntries, setReadonlyEntries] = React.useState<Array<{ label: string; value: string }>>([]);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const profileImageUrl = getProfileImageUrl(profileLookup?.record || null, (user?.user_metadata || {}) as Record<string, unknown>);
  const profileImageInitials = String(formValues.nome || formValues.username || user?.email || "DW") 
  
  .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "DW";
const ruoloAttuale =
  readonlyEntries.find((entry) => entry.label === "Ruolo")?.value?.toLowerCase() || "";
  React.useEffect(() => {
    let active = true;

    async function loadEditProfile() {
      if (!user) {
        if (active) setLoading(false);
        return;
      }

      setLoading(true);
      setFeedback(null);
      setFeedbackKind(null);

      try {
        const lookup = await findOwnProfileRecord(user);
        if (!active) return;

        setProfileLookup(lookup);

        const record = lookup?.record || null;
        const nextMap: Record<string, string | null> = {};
        const nextValues: Record<string, string> = {};

        for (const field of EDITABLE_PROFILE_FIELDS) {
          const actualKey = findExistingKey(record, field.aliases);
          nextMap[field.key] = actualKey;

          if (field.key === "email") {
            nextValues[field.key] = toTextValue(actualKey ? record?.[actualKey] : user?.email);
            continue;
          }

          nextValues[field.key] = toTextValue(actualKey ? record?.[actualKey] : "");
        }

        const readonlyValues = READONLY_PROFILE_FIELDS.map((field) => {
          const actualKey = findExistingKey(record, field.aliases);
          if (!actualKey) return null;
          return {
            label: field.label,
            value: formatReadonlyValue(record?.[actualKey]),
          };
        }).filter(Boolean) as Array<{ label: string; value: string }>;

        setEditableFieldMap(nextMap);
        setFormValues(nextValues);
        setReadonlyEntries(readonlyValues);
      } catch (error) {
        console.error("[EditProfilePage] Errore caricamento profilo:", error);
        if (active) {
          setFeedback("Errore aggiornamento profilo");
          setFeedbackKind("error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEditProfile();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileLookup || !user) {
      setFeedback("Errore aggiornamento profilo");
      setFeedbackKind("error");
      return;
    }

    setSaving(true);
    setFeedback(null);
    setFeedbackKind(null);

    try {
      const nextUsername = formValues.username.trim();
      if (!nextUsername) {
        setFeedback("Errore aggiornamento profilo");
        setFeedbackKind("error");
        return;
      }

      const updatePayload: Record<string, string | null> = {};
      for (const field of EDITABLE_PROFILE_FIELDS) {
        if (field.readOnly) continue;
        const actualKey = editableFieldMap[field.key];
        if (!actualKey) continue;
        const rawValue = formValues[field.key] ?? "";
        const trimmedValue = field.type === "textarea" ? rawValue.trim() : rawValue.trim();
        updatePayload[actualKey] = trimmedValue || null;
      }

      const result = await supabase
        .from(profileLookup.tableName)
        .update(updatePayload)
        .eq(profileLookup.filterKey, profileLookup.filterValue)
        .select("*")
        .maybeSingle();

      if (result.error) {
        console.error("[EditProfilePage] Errore aggiornamento profilo:", result.error);
        setFeedback("Errore aggiornamento profilo");
        setFeedbackKind("error");
        return;
      }

      const updatedRecord = (result.data || profileLookup.record) as ProfileRecord;
      setProfileLookup({
        ...profileLookup,
        record: updatedRecord,
      });
      setFeedback("Profilo aggiornato correttamente");
      setFeedbackKind("ok");
    } catch (error) {
      console.error("[EditProfilePage] Errore aggiornamento profilo:", error);
      setFeedback("Errore aggiornamento profilo");
      setFeedbackKind("error");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(fieldKey: string, value: string) {
    setFormValues((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  }

  async function handleProfilePhotoUpload(file: File | null | undefined) {
    if (!file || !profileLookup || !user?.id) return;

    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
    const fileExtension = String(file.name.split(".").pop() || "").toLowerCase();

    if ((!allowedMimeTypes.has(file.type) && !allowedExtensions.has(fileExtension)) || !allowedExtensions.has(fileExtension)) {
      setFeedback("Errore caricamento immagine");
      setFeedbackKind("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback("Errore caricamento immagine");
      setFeedbackKind("error");
      return;
    }

    setUploadingPhoto(true);
    setFeedback(null);
    setFeedbackKind(null);

    try {
      const safeExtension = fileExtension === "jpeg" ? "jpg" : fileExtension;
      const filePath = `profiles/${user.id}_${Date.now()}.${safeExtension || "jpg"}`;
      const uploadResult = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true, contentType: file.type || "image/jpeg" });

      if (uploadResult.error) {
        console.error("[EditProfilePage] Errore caricamento immagine:", uploadResult.error);
        setFeedback("Errore caricamento immagine");
        setFeedbackKind("error");
        return;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
      const imageUrl = urlData.publicUrl;

      // Build update payload: always set avatar_url; also set foto_profilo if the column exists in the record.
      const updatePayload: Record<string, string> = { avatar_url: imageUrl };
      if (Object.prototype.hasOwnProperty.call(profileLookup.record || {}, "foto_profilo")) {
        updatePayload.foto_profilo = imageUrl;
      }

      // 1. Best-effort update of the profile table.
      // Do NOT chain .select() after .update(): if the RLS SELECT policy is more restrictive than
      // the UPDATE policy, Supabase returns {data: null, error: null} even on success, making the
      // code believe 0 rows were updated. Without .select() we rely only on `error` presence.
      const tryTables = Array.from(new Set([profileLookup.tableName, "Profili", "profili"]));
      let dbUpdateOk = false;
      for (const tbl of tryTables) {
        const { error: updateError } = await supabase
          .from(tbl)
          .update(updatePayload)
          .eq("id", String(user.id));
        if (!updateError) {
          dbUpdateOk = true;
          break;
        }
        console.warn(`[EditProfilePage] avatar_url update su ${tbl} fallito:`, updateError.message);
      }

      // 2. Guaranteed persistence path: store avatar_url in auth user_metadata.
      // This survives logout/login and is already read by getProfileImageUrl via metadata?.avatar_url.
      // supabase.auth.updateUser also fires onAuthStateChange → user context re-renders immediately.
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: imageUrl },
      });
      if (authUpdateError) {
        console.warn("[EditProfilePage] updateUser metadata fallito:", authUpdateError.message);
      }

      if (!dbUpdateOk && authUpdateError) {
        setFeedback("Errore caricamento immagine");
        setFeedbackKind("error");
        return;
      }

      // 3. Update local React state so the avatar shows immediately in the edit form.
      const mergedRecord: ProfileRecord = {
        ...profileLookup.record,
        ...updatePayload,
      };
      setProfileLookup({ ...profileLookup, record: mergedRecord });
      setFeedback("Upload completato");
      setFeedbackKind("ok");
    } catch (error) {
      console.error("[EditProfilePage] Errore caricamento immagine:", error);
      setFeedback("Errore caricamento immagine");
      setFeedbackKind("error");
    } finally {
      setUploadingPhoto(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  return (
    <PageShell>
      <ProfileStyles />
      <LoungeBottomNavigation />

      <section className="profile-shell edit-profile-shell">
        <header className="profile-topbar">
          <div className="profile-title-wrap">
            <div className="profile-title-icon">
              <UserCircle2 size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="profile-title">Modifica profilo</h1>
              <p className="profile-subtitle">Aggiorna i dati del tuo profilo DrinkWise</p>
            </div>
          </div>
        </header>

        <SectionCard>
          <div className="edit-profile-card">
            <div className="edit-profile-actions-top">
              <button type="button" className="simple-back-btn" onClick={() => navigate("/profilo")}>← Torna indietro</button>
            </div>

            {loading ? (
              <p className="edit-profile-state">Caricamento profilo...</p>
            ) : !profileLookup ? (
              <p className="edit-profile-state">Profilo non disponibile.</p>
            ) : (
              <form className="edit-profile-form" onSubmit={handleSubmit}>
                <div className="edit-profile-photo-block">
                  <span className="edit-profile-photo-label">Foto profilo</span>
                  <div className="edit-profile-photo-row">
                    {profileImageUrl ? (
                      <img className="edit-profile-photo-avatar" src={profileImageUrl} alt="Foto profilo" />
                    ) : (
                      <div className="edit-profile-photo-fallback">{profileImageInitials}</div>
                    )}

                    <div className="edit-profile-photo-actions">
                      <button type="button" className="edit-profile-photo-btn" onClick={() => cameraInputRef.current?.click()} disabled={uploadingPhoto}>
                        {uploadingPhoto ? "Caricamento..." : "Scatta foto"}
                      </button>
                      <button type="button" className="edit-profile-photo-btn" onClick={() => galleryInputRef.current?.click()} disabled={uploadingPhoto}>
                        {uploadingPhoto ? "Caricamento..." : "Carica da dispositivo"}
                      </button>
                      {profileImageUrl && (
                        <button type="button" className="edit-profile-photo-btn is-secondary" onClick={() => galleryInputRef.current?.click()} disabled={uploadingPhoto}>
                          Cambia foto
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(event) => void handleProfilePhotoUpload(event.target.files?.[0])}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={(event) => void handleProfilePhotoUpload(event.target.files?.[0])}
                  />
                </div>

                <div className="edit-profile-grid">
                  {EDITABLE_PROFILE_FIELDS.filter((field) => field.readOnly || editableFieldMap[field.key]).map((field) => (
                    <label
                      key={field.key}
                      className={field.type === "textarea" ? "edit-profile-field edit-profile-field-full" : "edit-profile-field"}
                    >
                      <span>{field.label}</span>
                      {field.type === "textarea" ? (
                        <textarea
                          value={formValues[field.key] || ""}
                          onChange={(event) => handleChange(field.key, event.target.value)}
                          readOnly={Boolean(field.readOnly)}
                          rows={5}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={formValues[field.key] || ""}
                          onChange={(event) => handleChange(field.key, event.target.value)}
                          readOnly={Boolean(field.readOnly)}
                        />
                      )}
                    </label>
                  ))}
                </div>

<div className="edit-profile-readonly-wrap">
  <h3>Tipo di Account</h3>

  <div className="edit-profile-readonly-grid">

    <div className="edit-profile-readonly-card">
      <span>Account attuale</span>
      <strong>
        {ruoloAttuale
          ? ruoloAttuale.charAt(0).toUpperCase() + ruoloAttuale.slice(1)
          : "Utente"}
      </strong>
    </div>

    {!ruoloAttuale && (
      <>
        <div
          className="edit-profile-readonly-card"
          onClick={() => navigate("/registrazione-proprietario")}
          style={{ cursor: "pointer" }}
        >
          <span>Diventa Proprietario</span>
          <strong>Attiva</strong>
        </div>

        <div
          className="edit-profile-readonly-card"
          onClick={() => navigate("/registrazione-bartender")}
          style={{ cursor: "pointer" }}
        >
          <span>Diventa Bartender</span>
          <strong>Attiva</strong>
        </div>
      </>
    )}

    {ruoloAttuale && (
      <div className="edit-profile-readonly-card">
        <span>Modifica ruolo</span>
        <strong>Contatta l'amministrazione</strong>
      </div>
    )}

  </div>
</div>
                {readonlyEntries.length > 0 && (
                  <div className="edit-profile-readonly-wrap">
                    <h3>Statistiche profilo</h3>
                    <div className="edit-profile-readonly-grid">
                      {readonlyEntries.map((entry) => (
                        <div key={entry.label} className="edit-profile-readonly-card">
                          <span>{entry.label}</span>
                          <strong>{entry.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback && (
                  <p className={feedbackKind === "ok" ? "edit-profile-feedback is-ok" : "edit-profile-feedback is-error"}>
                    {feedback}
                  </p>
                )}

                <div className="edit-profile-footer">
                  <button type="button" className="edit-profile-secondary-btn" onClick={() => navigate("/profilo")}>Torna indietro</button>
                  <button type="submit" className="edit-profile-primary-btn" disabled={saving}>
                    {saving ? "Salvataggio..." : "Salva modifiche"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </SectionCard>

        <div style={{ height: 140 }} />
      </section>
    </PageShell>
  );
}

export function ProfilePreferencesPage() {
  return (
    <SimpleProfileSubpage
      title="Preferenze profilo"
      description="Qui puoi centralizzare gusti, distillati preferiti e scelte del tuo profilo premium."
      backTo="/profilo"
    />
  );
}

export function ProfileBadgesPage() {
  return (
    <SimpleProfileSubpage
      title="Badge profilo"
      description="Panoramica completa dei badge sbloccati, livelli premium e obiettivi DrinkWise."
      backTo="/profilo"
    />
  );
}

export function EventDetailPlaceholderPage() {
  const { id } = useParams();
  return (
    <SimpleProfileSubpage
      title="Dettaglio evento"
      description={`Scheda evento pronta per ${id || "evento"}. Il collegamento dalle prenotazioni future e attivo.`}
      backTo="/profilo"
    />
  );
}