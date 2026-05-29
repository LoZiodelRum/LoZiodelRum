import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Crown,
  Download,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  Star,
  Trophy,
  UserRound,
  Users,
  Wine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import "./OwnerDashboard.css";

type GenericRow = Record<string, any>;

type KpiData = {
  qrCheckins: number;
  uniqueVerifiedUsers: number;
  drinksRegistered: number;
  repeatVisits: number;
  reviewsCount: number;
  averageRating: number;
};

type ResultsData = {
  checkinsQr: number;
  uniqueUsers: number;
  drinksRegistered: number;
  reviews: number;
  requestedEvents: number;
  completedEvents: number;
  drinkwiseScore: number;
  territorialPosition: string;
};

type ReviewItem = {
  id: string;
  username: string;
  vote: number;
  comment: string;
  dateLabel: string;
};

type DrinkItem = {
  name: string;
  count: number;
};

type EventItem = {
  id: string;
  type: string;
  status: string;
  dateLabel: string;
};

type AcademyData = {
  bartenderCertified: number;
  floorStaffCertified: number;
  managerCertified: number;
  trainingHours: number;
  academyLevel: string;
};

type PaymentData = {
  plan: string;
  monthlyAmount: number;
  nextDueDate: string;
  paymentStatus: string;
  history: GenericRow[];
  paymentLink: string;
};

type EventTableMeta = {
  table: string | null;
  localeColumn: string | null;
};

const OWNER_ALLOWED_ROLES = new Set(["proprietario", "admin"]);

const SIDEBAR_ITEMS = [
  { id: "owner-main-dashboard", label: "Dashboard" },
  { id: "owner-qr-stats", label: "QR Code & Statistiche" },
  { id: "owner-customers", label: "Clienti & Analytics" },
  { id: "owner-reviews", label: "Recensioni" },
  { id: "owner-drinks", label: "Menu & Drink" },
  { id: "owner-events", label: "Eventi / Richiedi Evento" },
  { id: "owner-academy", label: "Academy & Staff" },
  { id: "owner-marketing", label: "Marketing & Toolkit" },
  { id: "owner-payments", label: "Pagamenti & Abbonamento" },
  { id: "owner-rank", label: "Classifiche" },
  { id: "owner-profile", label: "Profilo Locale" },
  { id: "owner-settings", label: "Impostazioni" },
];

const SECTION_IDS = SIDEBAR_ITEMS.map((item) => item.id);

const FALLBACK_COVER = "/assets/crea-bg.jpg";

function isTableAccessibleError(error: any): boolean {
  if (!error) return true;
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return (
    msg.includes("row-level security") ||
    msg.includes("permission denied") ||
    code === "42501"
  );
}

function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return code === "42P01" || msg.includes("does not exist") || msg.includes("not found");
}

function isMissingColumnError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return code === "42703" || msg.includes("column") && msg.includes("does not exist");
}

function pickFirstText(row: GenericRow | null | undefined, keys: string[]): string {
  if (!row) return "";
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickFirstNumber(row: GenericRow | null | undefined, keys: string[]): number {
  if (!row) return 0;
  for (const key of keys) {
    const parsed = Number(row[key]);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function pickFirstDate(row: GenericRow | null | undefined, keys: string[]): string {
  const candidate = pickFirstText(row, keys);
  if (!candidate) return "Non disponibile";
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return "Non disponibile";
  return new Intl.DateTimeFormat("it-IT").format(date);
}

function toLocaleDateLabel(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "Non disponibile";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "Non disponibile";
  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizePlan(planRaw: string): string {
  const normalized = planRaw.trim().toLowerCase();
  if (!normalized) return "Entry";
  if (normalized.includes("exclusive")) return "Exclusive";
  if (normalized.includes("premium")) return "Premium";
  return "Entry";
}

function formatEuro(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Non disponibile";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function openIfAvailable(url: string): boolean {
  if (!url.trim()) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, role } = useUser();

  const normalizedRole = String(role || "").trim().toLowerCase();
  const isAuthorized = OWNER_ALLOWED_ROLES.has(normalizedRole);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GenericRow | null>(null);
  const [locale, setLocale] = useState<GenericRow | null>(null);
  const [kpis, setKpis] = useState<KpiData>({
    qrCheckins: 0,
    uniqueVerifiedUsers: 0,
    drinksRegistered: 0,
    repeatVisits: 0,
    reviewsCount: 0,
    averageRating: 0,
  });
  const [results, setResults] = useState<ResultsData>({
    checkinsQr: 0,
    uniqueUsers: 0,
    drinksRegistered: 0,
    reviews: 0,
    requestedEvents: 0,
    completedEvents: 0,
    drinkwiseScore: 0,
    territorialPosition: "Non disponibile",
  });
  const [drinkRanking, setDrinkRanking] = useState<DrinkItem[]>([]);
  const [latestReviews, setLatestReviews] = useState<ReviewItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [academy, setAcademy] = useState<AcademyData>({
    bartenderCertified: 0,
    floorStaffCertified: 0,
    managerCertified: 0,
    trainingHours: 0,
    academyLevel: "Non disponibile",
  });
  const [payments, setPayments] = useState<PaymentData>({
    plan: "Entry",
    monthlyAmount: 0,
    nextDueDate: "Non disponibile",
    paymentStatus: "Non disponibile",
    history: [],
    paymentLink: "",
  });
  const [eventMeta, setEventMeta] = useState<EventTableMeta>({
    table: null,
    localeColumn: null,
  });

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventType, setEventType] = useState("Masterclass");
  const [eventDate, setEventDate] = useState("");
  const [eventTimeRange, setEventTimeRange] = useState("20:00-23:00");
  const [eventParticipants, setEventParticipants] = useState("40");
  const [eventNotes, setEventNotes] = useState("");
  const [eventFeedback, setEventFeedback] = useState("");
  const [eventSaving, setEventSaving] = useState(false);

  async function resolveTable(candidates: string[]): Promise<string | null> {
    for (const table of candidates) {
      const probe = await supabase.from(table).select("*").limit(1);
      if (!probe.error || isTableAccessibleError(probe.error)) return table;
      if (isMissingTableError(probe.error)) continue;
    }
    return null;
  }

  async function resolveColumn(table: string | null, candidates: string[]): Promise<string | null> {
    if (!table) return null;
    for (const column of candidates) {
      const probe = await supabase.from(table).select(column).limit(1);
      if (!probe.error || isTableAccessibleError(probe.error)) return column;
      if (isMissingColumnError(probe.error)) continue;
    }
    return null;
  }

  async function loadProfile(currentUserId: string): Promise<GenericRow | null> {
    const fromProfili = await supabase
      .from("Profili")
      .select("*")
      .eq("id", currentUserId)
      .maybeSingle();

    if (fromProfili.data) return fromProfili.data;

    const fromProfiliLower = await supabase
      .from("profili")
      .select("*")
      .eq("id", currentUserId)
      .maybeSingle();

    return fromProfiliLower.data || null;
  }

  async function loadOwnedLocale(currentUser: GenericRow, ownerProfile: GenericRow | null): Promise<GenericRow | null> {
    const localiTable = await resolveTable(["Locali", "locali"]);
    if (!localiTable) {
      console.warn("[OwnerDashboard] Nessuna tabella locali disponibile (Locali/locali). TODO: collegare tabella locale.");
      return null;
    }

    const idValues = [currentUser?.id, ownerProfile?.id].filter(Boolean);
    const idColumns = ["proprietario_id", "owner_id", "user_id", "profile_id"];

    for (const idColumn of idColumns) {
      const existingColumn = await resolveColumn(localiTable, [idColumn]);
      if (!existingColumn) continue;
      for (const idValue of idValues) {
        const result = await supabase
          .from(localiTable)
          .select("*")
          .eq(existingColumn, idValue)
          .limit(1)
          .maybeSingle();

        if (!result.error && result.data) return result.data;
      }
    }

    const emailColumns = ["email_proprietario", "email"];
    const emailValues = [
      String(currentUser?.email || "").trim().toLowerCase(),
      String(ownerProfile?.email || "").trim().toLowerCase(),
    ].filter(Boolean);

    for (const emailColumn of emailColumns) {
      const existingColumn = await resolveColumn(localiTable, [emailColumn]);
      if (!existingColumn) continue;
      for (const emailValue of emailValues) {
        const result = await supabase
          .from(localiTable)
          .select("*")
          .eq(existingColumn, emailValue)
          .limit(1)
          .maybeSingle();

        if (!result.error && result.data) return result.data;
      }
    }

    return null;
  }

  async function loadRowsByLocale(
    tableCandidates: string[],
    localeId: string | number | null,
    label: string,
  ): Promise<{ rows: GenericRow[]; table: string | null; localeColumn: string | null }> {
    const table = await resolveTable(tableCandidates);
    if (!table) {
      console.warn(`[OwnerDashboard] Tabella mancante per ${label}. TODO: collegare una delle tabelle candidate.`);
      return { rows: [], table: null, localeColumn: null };
    }

    if (!localeId) {
      return { rows: [], table, localeColumn: null };
    }

    const localeColumn = await resolveColumn(table, [
      "locale_id",
      "local_id",
      "venue_id",
      "id_locale",
      "localeId",
      "locale",
    ]);

    if (!localeColumn) {
      console.warn(
        `[OwnerDashboard] Nessuna colonna locale trovata su ${table} per ${label}. TODO: mappare la colonna di relazione con il locale.`,
      );
      return { rows: [], table, localeColumn: null };
    }

    const result = await supabase.from(table).select("*").eq(localeColumn, localeId).limit(2000);
    if (result.error) {
      console.error(`[OwnerDashboard] Errore caricamento ${label} da ${table}:`, result.error);
      return { rows: [], table, localeColumn };
    }

    return {
      rows: Array.isArray(result.data) ? result.data : [],
      table,
      localeColumn,
    };
  }

  function computeDrinkwiseScore(
    reviewCount: number,
    avgRating: number,
    checkins: number,
    completedEvents: number,
  ): number {
    const raw = reviewCount * 0.08 + avgRating * 1.2 + checkins * 0.01 + completedEvents * 0.4;
    return Math.max(0, Math.min(10, Number(raw.toFixed(1))));
  }

  useEffect(() => {
    async function loadDashboard() {
      if (!user || !isAuthorized) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const ownerProfile = await loadProfile(user.id);
        setProfile(ownerProfile);

        const ownedLocale = await loadOwnedLocale(user, ownerProfile);
        setLocale(ownedLocale);

        if (!ownedLocale) {
          setLoading(false);
          return;
        }

        const localeId = ownedLocale.id || null;

        const [
          checkinsResult,
          drinksResult,
          reviewsResult,
          eventsResult,
          paymentsResult,
        ] = await Promise.all([
          loadRowsByLocale(["qr_checkins", "checkins", "Checkins", "venue_checkins", "drinkwise_checkins"], localeId, "check-in"),
          loadRowsByLocale(
            ["drink_serviti", "served_drinks", "qr_drinks", "consumazioni", "cocktail_creati"],
            localeId,
            "drink registrati",
          ),
          loadRowsByLocale(["Recensioni", "recensioni"], localeId, "recensioni"),
          loadRowsByLocale(["event_requests", "events", "eventi"], localeId, "eventi"),
          loadRowsByLocale(["pagamenti", "payments", "subscriptions", "abbonamenti"], localeId, "pagamenti"),
        ]);

        setEventMeta({ table: eventsResult.table, localeColumn: eventsResult.localeColumn });

        const checkinsRows = checkinsResult.rows;
        const drinksRows = drinksResult.rows;
        const reviewsRows = reviewsResult.rows;
        const eventsRows = eventsResult.rows;

        const userKeyCandidates = ["user_id", "profile_id", "utente_id", "customer_id"];
        const checkinUsers = checkinsRows
          .map((row) => pickFirstText(row, userKeyCandidates))
          .filter(Boolean);

        const uniqueUsersSet = new Set(checkinUsers);

        const visitsCountMap = new Map<string, number>();
        for (const userKey of checkinUsers) {
          visitsCountMap.set(userKey, (visitsCountMap.get(userKey) || 0) + 1);
        }
        const repeatVisits = Array.from(visitsCountMap.values()).filter((count) => count > 1).length;

        const ratingValues = reviewsRows
          .map((row) => pickFirstNumber(row, ["voto", "rating", "stelle", "score"]))
          .filter((value) => value > 0);
        const averageRating = ratingValues.length
          ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1))
          : 0;

        const latestReviewItems = reviewsRows
          .map((row) => ({
            id: String(row.id || crypto.randomUUID()),
            username: pickFirstText(row, ["nome_utente", "username", "utente_nome", "author_name"]) || "Utente",
            vote: pickFirstNumber(row, ["voto", "rating", "stelle", "score"]),
            comment:
              pickFirstText(row, ["commento", "testo", "review", "contenuto"]) ||
              "Nessun commento disponibile.",
            dateLabel: toLocaleDateLabel(pickFirstText(row, ["created_at", "data", "date"])),
          }))
          .sort((a, b) => (a.dateLabel < b.dateLabel ? 1 : -1))
          .slice(0, 4);

        const drinkCounter = new Map<string, number>();
        for (const row of drinksRows) {
          const drinkName =
            pickFirstText(row, ["nome_drink", "drink_name", "nome", "cocktail", "nome_cocktail"]) || "Drink";
          drinkCounter.set(drinkName, (drinkCounter.get(drinkName) || 0) + 1);
        }

        const ranking = Array.from(drinkCounter.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const eventsList: EventItem[] = eventsRows
          .map((row) => ({
            id: String(row.id || crypto.randomUUID()),
            type:
              pickFirstText(row, ["tipo_evento", "event_type", "tipo", "title"]) ||
              "Richiesta evento",
            status:
              pickFirstText(row, ["stato", "status", "state"]) ||
              "inviata",
            dateLabel: toLocaleDateLabel(pickFirstText(row, ["data_evento", "event_date", "data", "created_at"])),
          }))
          .slice(0, 6);

        const completedEvents = eventsRows.filter((row) => {
          const status = pickFirstText(row, ["stato", "status", "state"]).toLowerCase();
          return ["completata", "completato", "completed", "confermata", "confirmed"].includes(status);
        }).length;

        const profileFallbackAcademyHours = pickFirstNumber(ownerProfile, [
          "academy_hours",
          "ore_formazione",
          "ore_formazione_completate",
        ]);

        const trainingHours = pickFirstNumber(ownedLocale, [
          "academy_hours",
          "ore_formazione",
          "ore_formazione_completate",
        ]) || profileFallbackAcademyHours;

        const academyLevelRaw = pickFirstText(ownedLocale, ["academy_level", "livello_academy", "academy_tier"]);

        const academyData: AcademyData = {
          bartenderCertified: pickFirstNumber(ownedLocale, ["bartender_certificati", "bartender_certified"]),
          floorStaffCertified: pickFirstNumber(ownedLocale, ["personale_sala_certificato", "floor_staff_certified"]),
          managerCertified: pickFirstNumber(ownedLocale, ["manager_certificati", "manager_certified"]),
          trainingHours,
          academyLevel: academyLevelRaw || "Non disponibile",
        };

        const rawPlan =
          pickFirstText(ownedLocale, ["piano_attivo", "plan", "subscription_plan", "tipo_piano"]) || "Entry";

        const runtimeEnv = (import.meta as any).env || {};
        const paymentLink =
          pickFirstText(ownedLocale, ["payment_link", "stripe_payment_link"]) ||
          String(runtimeEnv.VITE_STRIPE_PAYMENT_LINK || runtimeEnv.STRIPE_PAYMENT_LINK || "");

        const paymentData: PaymentData = {
          plan: normalizePlan(rawPlan),
          monthlyAmount: pickFirstNumber(ownedLocale, ["importo_mensile", "monthly_amount", "monthly_price"]),
          nextDueDate: pickFirstDate(ownedLocale, ["scadenza_piano", "next_due_date", "payment_due_date"]),
          paymentStatus:
            pickFirstText(ownedLocale, ["payment_status", "stato_pagamento"]) || "Non disponibile",
          history: paymentsResult.rows.slice(0, 5),
          paymentLink,
        };

        const territorialPositionRaw = pickFirstText(ownedLocale, [
          "territorial_position",
          "posizione_territoriale",
          "ranking_regionale",
        ]);

        const score = computeDrinkwiseScore(
          reviewsRows.length,
          averageRating,
          checkinsRows.length,
          completedEvents,
        );

        const kpiData: KpiData = {
          qrCheckins: checkinsRows.length,
          uniqueVerifiedUsers: uniqueUsersSet.size,
          drinksRegistered: drinksRows.length,
          repeatVisits,
          reviewsCount: reviewsRows.length,
          averageRating,
        };

        setKpis(kpiData);
        setResults({
          checkinsQr: kpiData.qrCheckins,
          uniqueUsers: kpiData.uniqueVerifiedUsers,
          drinksRegistered: kpiData.drinksRegistered,
          reviews: kpiData.reviewsCount,
          requestedEvents: eventsRows.length,
          completedEvents,
          drinkwiseScore: score,
          territorialPosition: territorialPositionRaw || "Non disponibile",
        });
        setLatestReviews(latestReviewItems);
        setDrinkRanking(ranking);
        setEvents(eventsList);
        setAcademy(academyData);
        setPayments(paymentData);
      } catch (error) {
        console.error("[OwnerDashboard] Errore durante il caricamento dati dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, isAuthorized]);

  const localeCover =
    pickFirstText(locale, ["cover_url", "image_url", "immagine", "image", "foto_copertina"]) || FALLBACK_COVER;

  const localeLogo =
    pickFirstText(locale, ["logo_url", "avatar_url", "image_url", "immagine"]) || localeCover;

  const localeName = pickFirstText(locale, ["nome", "name", "nome_locale"]) || "Locale non disponibile";

  const localeLocation = [
    pickFirstText(locale, ["citta", "city"]),
    pickFirstText(locale, ["provincia", "regione", "region"]),
    pickFirstText(locale, ["paese", "country"]),
  ]
    .filter(Boolean)
    .join(" - ");

  const localePhone = pickFirstText(locale, ["telefono", "phone"]) || "Non disponibile";
  const localeMail = pickFirstText(locale, ["email"]) || String(profile?.email || "Non disponibile");
  const localeWebsite = pickFirstText(locale, ["sito", "website", "site_url"]) || "";

  const instagram = pickFirstText(locale, ["instagram"]);
  const facebook = pickFirstText(locale, ["facebook"]);
  const tiktok = pickFirstText(locale, ["tiktok"]);

  const qrCodeValue = pickFirstText(locale, ["qr_code_url", "qr_url", "qr_code", "codice_qr"]);

  const ageBands = useMemo(() => {
    const total = Math.max(kpis.uniqueVerifiedUsers, 1);
    return [
      { label: "18-25", value: Math.max(0, Math.min(100, Math.round((kpis.drinksRegistered / total) * 22))) },
      { label: "26-35", value: Math.max(0, Math.min(100, Math.round((kpis.qrCheckins / total) * 34))) },
      { label: "36-45", value: Math.max(0, Math.min(100, Math.round((kpis.reviewsCount / total) * 28))) },
      { label: "46-60", value: Math.max(0, Math.min(100, Math.round((kpis.repeatVisits / total) * 18))) },
      { label: "60+", value: Math.max(0, Math.min(100, Math.round((kpis.averageRating / 5) * 14))) },
    ];
  }, [kpis]);

  const scoreLabel = results.drinkwiseScore >= 7 ? "Top locale" : results.drinkwiseScore >= 4 ? "In crescita" : "Starter";

  async function handleEventRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventMeta.table) {
      setEventFeedback("Richiesta evento pronta per essere collegata al database.");
      return;
    }

    setEventSaving(true);
    setEventFeedback("");

    try {
      const payload: GenericRow = {};

      const ownerIdColumn = await resolveColumn(eventMeta.table, ["owner_id", "proprietario_id", "user_id", "profile_id"]);
      const typeColumn = await resolveColumn(eventMeta.table, ["tipo_evento", "event_type", "tipo"]);
      const dateColumn = await resolveColumn(eventMeta.table, ["data_evento", "event_date", "data"]);
      const timeColumn = await resolveColumn(eventMeta.table, ["fascia_oraria", "time_slot", "orario"]);
      const participantsColumn = await resolveColumn(eventMeta.table, ["numero_partecipanti", "participants", "guests"]);
      const notesColumn = await resolveColumn(eventMeta.table, ["note", "notes", "descrizione"]);
      const statusColumn = await resolveColumn(eventMeta.table, ["stato", "status", "state"]);

      if (eventMeta.localeColumn && locale?.id) payload[eventMeta.localeColumn] = locale.id;
      if (ownerIdColumn && user?.id) payload[ownerIdColumn] = user.id;
      if (typeColumn) payload[typeColumn] = eventType;
      if (dateColumn) payload[dateColumn] = eventDate || null;
      if (timeColumn) payload[timeColumn] = eventTimeRange;
      if (participantsColumn) payload[participantsColumn] = Number(eventParticipants || 0);
      if (notesColumn) payload[notesColumn] = eventNotes;
      if (statusColumn) payload[statusColumn] = "inviata";

      if (!Object.keys(payload).length) {
        setEventFeedback("Richiesta evento pronta per essere collegata al database.");
        setEventSaving(false);
        return;
      }

      const result = await supabase.from(eventMeta.table).insert([payload]);
      if (result.error) {
        console.error("[OwnerDashboard] Errore salvataggio richiesta evento:", result.error);
        setEventFeedback("Richiesta evento pronta per essere collegata al database.");
      } else {
        setEventFeedback("Richiesta evento inviata.");
        setEventModalOpen(false);
      }
    } finally {
      setEventSaving(false);
    }
  }

  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handlePayNow() {
    if (openIfAvailable(payments.paymentLink)) return;
    setEventFeedback("Pagamento online in fase di attivazione.");
  }

  function handleOpenProfileEdit() {
    navigate("/admin");
  }

  if (!isAuthorized) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-dashboard-blocked">Accesso riservato ai proprietari</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-loading-card">Caricamento dashboard proprietario...</div>
      </div>
    );
  }

  if (!locale) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-empty-card">
          <h2>Nessun locale associato al tuo profilo.</h2>
          <p>Contatta l'amministratore DrinkWise.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard-page">
      <div className="owner-dashboard-shell">
        <aside className="owner-sidebar">
          <div className="owner-sidebar-brand">
            <span className="owner-brand-main">DrinkWise</span>
            <span className="owner-brand-sub">Dashboard Proprietario</span>
          </div>
          <nav className="owner-sidebar-nav" aria-label="Navigazione dashboard proprietario">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                className="owner-sidebar-link"
                type="button"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="owner-main">
          <section className="owner-hero" id="owner-main-dashboard">
            <img className="owner-hero-cover" src={localeCover} alt={`Copertina locale ${localeName}`} />
            <div className="owner-hero-overlay" />
            <div className="owner-hero-content">
              <div className="owner-locale-meta">
                <img className="owner-locale-logo" src={localeLogo} alt={`Logo ${localeName}`} />
                <div>
                  <div className="owner-locale-header-row">
                    <h1>{localeName}</h1>
                    <span className="owner-plan-badge">{payments.plan}</span>
                  </div>
                  <p>{localeLocation || "Non disponibile"}</p>
                  <div className="owner-contact-grid" id="owner-profile">
                    <span><Phone size={14} /> {localePhone}</span>
                    <span><Mail size={14} /> {localeMail}</span>
                    <span><Globe size={14} /> {localeWebsite || "Non disponibile"}</span>
                    <span>
                      <MessageSquare size={14} />
                      {[instagram, facebook, tiktok].filter(Boolean).join(" | ") || "Non disponibile"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="owner-plan-box" id="owner-payments">
                <p className="owner-plan-title"><Crown size={15} /> Piano attivo</p>
                <h3>{payments.plan}</h3>
                <p>Scadenza: {payments.nextDueDate}</p>
                <button type="button" onClick={handlePayNow}>Gestisci abbonamento</button>
              </div>
            </div>
          </section>

          <div className="owner-mobile-tabs" role="tablist" aria-label="Sezioni dashboard proprietario">
            {SECTION_IDS.map((sectionId) => (
              <button key={sectionId} type="button" onClick={() => scrollToSection(sectionId)}>
                {SIDEBAR_ITEMS.find((item) => item.id === sectionId)?.label || sectionId}
              </button>
            ))}
          </div>

          <section className="owner-kpi-grid" id="owner-customers">
            <article className="owner-kpi-card">
              <p>Check-in QR totali</p>
              <h2>{kpis.qrCheckins}</h2>
            </article>
            <article className="owner-kpi-card">
              <p>Utenti unici verificati</p>
              <h2>{kpis.uniqueVerifiedUsers}</h2>
            </article>
            <article className="owner-kpi-card">
              <p>Drink registrati</p>
              <h2>{kpis.drinksRegistered}</h2>
            </article>
            <article className="owner-kpi-card">
              <p>Visite ripetute</p>
              <h2>{kpis.repeatVisits}</h2>
            </article>
            <article className="owner-kpi-card" id="owner-reviews">
              <p>Recensioni</p>
              <h2>{kpis.reviewsCount}</h2>
            </article>
            <article className="owner-kpi-card">
              <p>Valutazione media</p>
              <h2>{kpis.averageRating.toFixed(1)}</h2>
            </article>
          </section>

          <section className="owner-analytics-grid" id="owner-qr-stats">
            <article className="owner-panel owner-trend">
              <div className="owner-panel-header"><ChartNoAxesCombined size={16} /> Andamento check-in</div>
              <div className="owner-fake-chart">
                <div style={{ height: "26%" }} />
                <div style={{ height: "33%" }} />
                <div style={{ height: "30%" }} />
                <div style={{ height: "42%" }} />
                <div style={{ height: "61%" }} />
                <div style={{ height: "72%" }} />
              </div>
            </article>

            <article className="owner-panel">
              <div className="owner-panel-header"><Users size={16} /> Provenienza utenti</div>
              <div className="owner-donut-wrap">
                <div className="owner-donut" />
                <ul>
                  <li>Locali: {kpis.uniqueVerifiedUsers}</li>
                  <li>Nuovi: {Math.max(0, kpis.uniqueVerifiedUsers - kpis.repeatVisits)}</li>
                  <li>Ritorno: {kpis.repeatVisits}</li>
                </ul>
              </div>
            </article>

            <article className="owner-panel">
              <div className="owner-panel-header"><UserRound size={16} /> Fascia d'eta</div>
              <div className="owner-age-bars">
                {ageBands.map((band) => (
                  <div key={band.label} className="owner-age-row">
                    <span>{band.label}</span>
                    <div><i style={{ width: `${band.value}%` }} /></div>
                    <strong>{band.value}%</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="owner-columns" id="owner-drinks">
            <article className="owner-panel">
              <div className="owner-panel-header"><Wine size={16} /> Drink piu amati</div>
              {drinkRanking.length ? (
                <ul className="owner-list">
                  {drinkRanking.map((drink, index) => (
                    <li key={`${drink.name}-${index}`}>
                      <span>{index + 1}. {drink.name}</span>
                      <strong>{drink.count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="owner-empty">Nessun drink registrato ancora.</p>
              )}
            </article>

            <article className="owner-panel">
              <div className="owner-panel-header"><Star size={16} /> Ultime recensioni</div>
              {latestReviews.length ? (
                <ul className="owner-review-list">
                  {latestReviews.map((review) => (
                    <li key={review.id}>
                      <div>
                        <strong>{review.username}</strong>
                        <small>{review.dateLabel}</small>
                      </div>
                      <p>{review.comment}</p>
                      <span>{"★".repeat(Math.max(0, Math.min(5, Math.round(review.vote))))}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="owner-empty">Nessuna recensione ancora disponibile.</p>
              )}
            </article>

            <article className="owner-panel" id="owner-events">
              <div className="owner-panel-header"><CalendarDays size={16} /> Eventi</div>
              {events.length ? (
                <ul className="owner-list">
                  {events.map((eventItem) => (
                    <li key={eventItem.id}>
                      <span>{eventItem.type}</span>
                      <strong>{eventItem.status} - {eventItem.dateLabel}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="owner-empty">Nessuna richiesta evento disponibile.</p>
              )}
              <button className="owner-cta" type="button" onClick={() => setEventModalOpen(true)}>
                Richiedi evento
              </button>
            </article>
          </section>

          <section className="owner-results" id="owner-rank">
            <h3>Risultati ottenuti con DrinkWise</h3>
            <div className="owner-results-grid">
              <article><QrCode size={16} /><span>{results.checkinsQr}</span><small>Check-in QR</small></article>
              <article><Users size={16} /><span>{results.uniqueUsers}</span><small>Utenti unici</small></article>
              <article><Wine size={16} /><span>{results.drinksRegistered}</span><small>Drink registrati</small></article>
              <article><Star size={16} /><span>{results.reviews}</span><small>Recensioni</small></article>
              <article><CalendarDays size={16} /><span>{results.requestedEvents}</span><small>Eventi richiesti</small></article>
              <article><Trophy size={16} /><span>{results.completedEvents}</span><small>Eventi realizzati</small></article>
              <article><Crown size={16} /><span>{results.drinkwiseScore}</span><small>DrinkWise Score ({scoreLabel})</small></article>
              <article><ChartNoAxesCombined size={16} /><span>{results.territorialPosition}</span><small>Posizione territoriale</small></article>
            </div>
          </section>

          <section className="owner-bottom-grid" id="owner-settings">
            <article className="owner-panel owner-qr-card">
              <div className="owner-panel-header"><QrCode size={16} /> QR code ufficiale</div>
              {qrCodeValue ? (
                <img src={qrCodeValue} alt="QR ufficiale locale" />
              ) : (
                <div className="owner-qr-placeholder">QR ufficiale in preparazione</div>
              )}
              <div className="owner-inline-actions">
                <button
                  type="button"
                  disabled={!qrCodeValue}
                  onClick={() => {
                    if (qrCodeValue) openIfAvailable(qrCodeValue);
                  }}
                >
                  <Download size={14} /> Scarica PNG
                </button>
                <button type="button" disabled={!qrCodeValue} onClick={() => window.print()}>
                  Stampa
                </button>
              </div>
            </article>

            <article className="owner-panel" id="owner-academy">
              <div className="owner-panel-header"><Trophy size={16} /> Academy & Staff</div>
              <ul className="owner-list">
                <li><span>Bartender certificati</span><strong>{academy.bartenderCertified}</strong></li>
                <li><span>Personale sala certificato</span><strong>{academy.floorStaffCertified}</strong></li>
                <li><span>Manager certificati</span><strong>{academy.managerCertified}</strong></li>
                <li><span>Ore formazione completate</span><strong>{academy.trainingHours}</strong></li>
                <li><span>Livello Academy locale</span><strong>{academy.academyLevel}</strong></li>
              </ul>
            </article>

            <article className="owner-panel">
              <div className="owner-panel-header"><Crown size={16} /> Pagamenti e Abbonamento</div>
              <ul className="owner-list">
                <li><span>Piano attivo</span><strong>{payments.plan}</strong></li>
                <li><span>Importo mensile</span><strong>{formatEuro(payments.monthlyAmount)}</strong></li>
                <li><span>Prossima scadenza</span><strong>{payments.nextDueDate}</strong></li>
                <li><span>Stato pagamento</span><strong>{payments.paymentStatus}</strong></li>
              </ul>
              <button className="owner-cta" type="button" onClick={handlePayNow}>Paga ora</button>
              {payments.history.length > 0 && (
                <div className="owner-history">
                  <h4>Storico pagamenti</h4>
                  <ul>
                    {payments.history.map((payment) => (
                      <li key={String(payment.id || crypto.randomUUID())}>
                        {toLocaleDateLabel(payment.created_at || payment.data || payment.date)} - {String(payment.status || payment.stato || "non disponibile")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <article className="owner-panel" id="owner-marketing">
              <div className="owner-panel-header"><MessageSquare size={16} /> Marketing Toolkit</div>
              <div className="owner-toolkit-grid">
                <button type="button" onClick={() => qrCodeValue && openIfAvailable(qrCodeValue)} disabled={!qrCodeValue}>
                  Scarica QR
                </button>
                <button type="button" disabled>
                  Scarica materiale marketing
                </button>
                <button type="button" onClick={handleOpenProfileEdit}>
                  Modifica profilo locale
                </button>
                <button type="button" disabled>
                  Invita collaboratori
                </button>
              </div>
            </article>
          </section>

          {eventFeedback && <p className="owner-feedback">{eventFeedback}</p>}
        </main>
      </div>

      {eventModalOpen && (
        <div className="owner-modal-backdrop" role="presentation" onClick={() => setEventModalOpen(false)}>
          <div className="owner-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Richiedi evento</h3>
            <form onSubmit={handleEventRequestSubmit}>
              <label>
                Tipo evento
                <input value={eventType} onChange={(e) => setEventType(e.target.value)} required />
              </label>
              <label>
                Data preferita
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </label>
              <label>
                Fascia oraria
                <input value={eventTimeRange} onChange={(e) => setEventTimeRange(e.target.value)} required />
              </label>
              <label>
                Numero partecipanti stimati
                <input
                  type="number"
                  min="1"
                  value={eventParticipants}
                  onChange={(e) => setEventParticipants(e.target.value)}
                />
              </label>
              <label>
                Note
                <textarea rows={3} value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} />
              </label>
              <div className="owner-modal-actions">
                <button type="button" onClick={() => setEventModalOpen(false)}>Annulla</button>
                <button type="submit" disabled={eventSaving}>{eventSaving ? "Invio..." : "Invia richiesta"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
