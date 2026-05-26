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
import LoungeNavigation from "../components/lounge/LoungeNavigation";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

type ProfileRecord = {
  id?: string;
  nome?: string | null;
  cognome?: string | null;
  username?: string | null;
  ruolo?: string | null;
  status?: string | null;
  avatar_url?: string | null;
  bio_breve?: string | null;
  distillato_preferito?: string | null;
  cocktail_preferito?: string | null;
  profilo_gustativo_preferito?: string | null;
  numero_recensioni?: number | null;
  numero_locali_visitati?: number | null;
  numero_cocktail_creati?: number | null;
};

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

      const query = "id, nome, cognome, username, ruolo, status, avatar_url, bio_breve, distillato_preferito, cocktail_preferito, profilo_gustativo_preferito, numero_recensioni, numero_locali_visitati, numero_cocktail_creati";
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
  const avatarUrl = String(profile?.avatar_url || metadata.avatar_url || metadata.picture || "").trim() || null;

  return {
    user,
    profile,
    displayName,
    memberRole,
    avatarUrl,
    reviewCount: Number(profile?.numero_recensioni || 92),
    venuesCount: Number(profile?.numero_locali_visitati || 128),
    eventsCount: Number(profile?.numero_cocktail_creati || 36),
    bottlesCount: 18,
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
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: "#eef6ff",
        padding: "96px 12px 38px",
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
      @media (max-width: 900px) {
        .profile-hero-main { grid-template-columns: auto 1fr; }
        .profile-hero-art { display: none; }
        .spirit-grid { grid-template-columns: 1fr; }
        .community-grid { grid-template-columns: 1fr; }
        .community-stat { border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .community-stat:last-child { border-bottom: 0; }
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
      }
    `}</style>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { displayName, memberRole, avatarUrl, reviewCount, venuesCount, eventsCount, bottlesCount, profile } = useProfileData();
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
      <LoungeNavigation
        leftTo="/discover"
        rightTo="/lounge"
        leftAriaLabel="Vai a Discover"
        rightAriaLabel="Vai alla Lounge"
      />

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
            {badgeItems.map((item) => <ProfileChip key={item.id} item={item} />)}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="profile-section-header">
            <h3><Sparkles size={22} strokeWidth={2} /> Profilo gustativo</h3>
            <button className="profile-link-btn" onClick={() => navigate("/profilo/preferenze")}>Modifica gusti <ChevronRight size={18} strokeWidth={2} /></button>
          </div>
          <div className="profile-chip-row">
            {tasteItems.map((item) => <ProfileChip key={item.id} item={item} />)}
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
            {reservations.map((item) => <ReservationCard key={item.id} item={item} />)}
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
  return (
    <SimpleProfileSubpage
      title="Modifica profilo"
      description="Questa sezione e pronta per collegare il flusso di modifica completo del profilo premium DrinkWise."
      backTo="/profilo"
    />
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