import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────── TIPI ──────────────────────── */
interface Evento {
  id: string;
  nome: string;
  citta: string;
  orario: string;
  categoria: string;
  immagine: string;
  data: string; // YYYY-MM-DD
  badge?: string;
  badgeColor?: string;
}

/* ──────────────────────── DATI ──────────────────────── */
const oggi = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

const EVENTI: Evento[] = [
  {
    id: "1",
    nome: "Napoli Guest Shift",
    citta: "Napoli",
    orario: "21:00",
    categoria: "Rum",
    immagine: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    data: fmt(addDays(oggi, 1)),
    badge: "Live",
    badgeColor: "#00e0a0",
  },
  {
    id: "2",
    nome: "Milan Cocktail Week",
    citta: "Milano",
    orario: "20:00",
    categoria: "Cocktail",
    immagine: "https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=400&q=80",
    data: fmt(addDays(oggi, 3)),
    badge: "VIP",
    badgeColor: "#a855f7",
  },
  {
    id: "3",
    nome: "London Rum Experience",
    citta: "Londra",
    orario: "19:30",
    categoria: "Rum",
    immagine: "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=400&q=80",
    data: fmt(addDays(oggi, 5)),
    badge: "Completo",
    badgeColor: "#f97316",
  },
  {
    id: "4",
    nome: "Barcelona Tiki Night",
    citta: "Barcellona",
    orario: "22:00",
    categoria: "Tiki",
    immagine: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    data: fmt(addDays(oggi, 7)),
    badge: "Nuovo",
    badgeColor: "#38bdf8",
  },
  {
    id: "5",
    nome: "Cena con Abbinamento Rum",
    citta: "Napoli",
    orario: "20:30",
    categoria: "Food & Drink",
    immagine: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
    data: fmt(addDays(oggi, 2)),
  },
  {
    id: "6",
    nome: "Pairing Dinner",
    citta: "Milano",
    orario: "19:00",
    categoria: "Food & Drink",
    immagine: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    data: fmt(addDays(oggi, 4)),
  },
  {
    id: "7",
    nome: "Masterclass Whisky",
    citta: "Torino",
    orario: "18:00",
    categoria: "Whisky",
    immagine: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&q=80",
    data: fmt(addDays(oggi, 8)),
  },
  {
    id: "8",
    nome: "Gin & Jazz Evening",
    citta: "Roma",
    orario: "21:30",
    categoria: "Gin",
    immagine: "https://images.unsplash.com/photo-1561835491-ed21a9be0f49?w=400&q=80",
    data: fmt(addDays(oggi, 10)),
  },
];

/* ──────────────────────── COSTANTI STILE ──────────────────────── */
const BG = "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.08)";
const NEON_BLUE = "#00b4ff";
const NEON_PURPLE = "#a855f7";
const TEXT_DIM = "rgba(255,255,255,0.55)";

/* ──────────────────────── COMPONENTI INTERNI ──────────────────────── */

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        border: `1px solid ${color}`,
        color: color,
        background: `${color}18`,
        whiteSpace: "nowrap",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </span>
  );
}

function EventCard({ evento, onClick }: { evento: Evento; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
    >
      <img
        src={evento.immagine}
        alt={evento.nome}
        style={{ width: 64, height: 52, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {evento.nome}
        </div>
        <div style={{ fontSize: 12, color: TEXT_DIM }}>{evento.citta} · {evento.orario}</div>
      </div>
      {evento.badge && <Badge label={evento.badge} color={evento.badgeColor || NEON_BLUE} />}
    </div>
  );
}

function WeekCard({ evento, onClick }: { evento: Evento; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 18,
        border: `1px solid rgba(255,255,255,0.09)`,
        overflow: "hidden",
        cursor: "pointer",
        background: CARD_BG,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,180,255,0.12)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <img
        src={evento.immagine}
        alt={evento.nome}
        style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 6 }}>{evento.nome}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: TEXT_DIM, marginBottom: 8 }}>
          <span>📍 {evento.citta}</span>
          <span>·</span>
          <span>🕐 {evento.orario}</span>
        </div>
        <Badge label={evento.categoria} color={NEON_BLUE} />
      </div>
    </div>
  );
}

/* ──────────────────────── CALENDARIO ──────────────────────── */
const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function Calendario({
  eventiDate,
  selectedDate,
  onSelectDate,
}: {
  eventiDate: Set<string>;
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const [viewYear, setViewYear] = useState(oggi.getFullYear());
  const [viewMonth, setViewMonth] = useState(oggi.getMonth());

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    // 0=Dom → converti in lun=0
    const startDow = (first.getDay() + 6) % 7;
    const total = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let i = 1; i <= total; i++) cells.push(i);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const todayStr = fmt(oggi);

  return (
    <div>
      {/* Header mese */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button
          onClick={prevMonth}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>{MESI[viewMonth]} {viewYear}</span>
        <button
          onClick={nextMonth}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}
        >›</button>
      </div>

      {/* Giorni settimana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {GIORNI.map(g => (
          <div key={g} style={{ textAlign: "center", fontSize: 11, color: TEXT_DIM, fontWeight: 600, paddingBottom: 4 }}>{g}</div>
        ))}
      </div>

      {/* Celle */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const dStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const isToday = dStr === todayStr;
          const isSelected = dStr === selectedDate;
          const hasEvent = eventiDate.has(dStr);
          return (
            <div
              key={i}
              onClick={() => onSelectDate(dStr)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                borderRadius: 10,
                cursor: "pointer",
                background: isSelected
                  ? `linear-gradient(135deg, ${NEON_BLUE}33, ${NEON_PURPLE}33)`
                  : isToday
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                border: isSelected
                  ? `1.5px solid ${NEON_BLUE}`
                  : isToday
                  ? "1.5px solid rgba(255,255,255,0.22)"
                  : "1.5px solid transparent",
                color: isSelected ? NEON_BLUE : isToday ? "#fff" : "rgba(255,255,255,0.8)",
                fontWeight: isToday || isSelected ? 700 : 400,
                fontSize: 14,
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              {day}
              {hasEvent && (
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: hasEvent ? NEON_BLUE : "transparent",
                  position: "absolute", bottom: 4,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── PAGINA PRINCIPALE ──────────────────────── */
export default function EventiPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(fmt(oggi));

  const eventiDate = useMemo(() => new Set(EVENTI.map(e => e.data)), []);

  const eventiInArrivo = useMemo(() =>
    EVENTI.slice().sort((a, b) => a.data.localeCompare(b.data)).slice(0, 4),
  []);

  const eventiSettimana = useMemo(() => {
    const start = oggi;
    const end = addDays(oggi, 7);
    return EVENTI.filter(e => {
      const d = new Date(e.data);
      return d >= start && d <= end;
    }).slice(0, 4);
  }, []);

  const eventiGiornoSelezionato = useMemo(() =>
    EVENTI.filter(e => e.data === selectedDate),
  [selectedDate]);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .eventi-grid { grid-template-columns: 1fr !important; }
          .eventi-week-grid { grid-template-columns: 1fr 1fr !important; }
          .eventi-header-row { flex-direction: column !important; gap: 10px !important; align-items: flex-start !important; }
          .eventi-calendar-section { padding: 18px !important; }
          .eventi-page-title { font-size: 24px !important; }
          .eventi-page-subtitle { font-size: 13px !important; }
        }
        @media (max-width: 480px) {
          .eventi-week-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: BG,
          color: "#fff",
          padding: "100px 16px 60px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <div className="eventi-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${NEON_BLUE}33, ${NEON_PURPLE}33)`,
                border: `1.5px solid ${NEON_BLUE}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>🗓️</div>
              <div>
                <h1 className="eventi-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Calendario Eventi</h1>
                <p className="eventi-page-subtitle" style={{ margin: 0, fontSize: 14, color: TEXT_DIM }}>
                  Il meglio della scena premium
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  padding: "10px 18px", borderRadius: 20,
                  border: `1.5px solid rgba(255,255,255,0.18)`,
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}
                onClick={() => navigate("/eventi/tutti")}
              >
                🍸 Tutti gli Eventi
              </button>
              <button
                style={{
                  padding: "10px 18px", borderRadius: 20,
                  border: `1.5px solid ${NEON_BLUE}`,
                  background: `linear-gradient(135deg, ${NEON_BLUE}33, ${NEON_PURPLE}33)`,
                  color: NEON_BLUE, fontWeight: 700, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}
                onClick={() => navigate("/prenota-evento")}
              >
                + Prenota Evento
              </button>
            </div>
          </div>

          {/* ── CALENDARIO ── */}
          <div
            className="eventi-calendar-section"
            style={{
              background: CARD_BG,
              border: CARD_BORDER,
              borderRadius: 24,
              padding: 28,
              marginBottom: 28,
              boxShadow: `0 0 40px rgba(0,180,255,0.06)`,
            }}
          >
            <Calendario
              eventiDate={eventiDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Pulsanti sotto calendario */}
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button
                onClick={() => navigate("/eventi/tutti")}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 24,
                  border: `1.5px solid rgba(255,255,255,0.18)`,
                  background: "transparent",
                  color: "#fff", fontWeight: 600, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                🍸 Tutti gli Eventi
              </button>
              <button
                onClick={() => navigate("/prenota-evento")}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 24,
                  border: `1.5px solid ${NEON_BLUE}`,
                  background: `linear-gradient(135deg, #00b4ff22, #a855f722)`,
                  color: NEON_BLUE, fontWeight: 700, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                + Prenota Evento
              </button>
            </div>

            {/* Risultati giorno selezionato */}
            {eventiGiornoSelezionato.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 10, fontWeight: 600 }}>
                  {eventiGiornoSelezionato.length} evento{eventiGiornoSelezionato.length > 1 ? "i" : ""} il {selectedDate}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {eventiGiornoSelezionato.map(ev => (
                    <EventCard key={ev.id} evento={ev} onClick={() => navigate(`/evento/${ev.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── IN ARRIVO ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🕐</span>
                <span style={{ fontWeight: 800, fontSize: 17 }}>In Arrivo</span>
              </div>
              <button
                onClick={() => navigate("/eventi/tutti")}
                style={{ background: "none", border: "none", color: NEON_BLUE, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Vedi Tutto ›
              </button>
            </div>
            <div
              style={{
                background: CARD_BG,
                border: CARD_BORDER,
                borderRadius: 20,
                padding: "6px 12px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {eventiInArrivo.map(ev => (
                  <EventCard key={ev.id} evento={ev} onClick={() => navigate(`/evento/${ev.id}`)} />
                ))}
              </div>
            </div>
          </div>

          {/* ── QUESTA SETTIMANA ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <span style={{ fontWeight: 800, fontSize: 17 }}>Questa Settimana</span>
              </div>
              <button
                onClick={() => navigate("/eventi/tutti")}
                style={{ background: "none", border: "none", color: NEON_BLUE, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Vedi Tutto ›
              </button>
            </div>
            <div className="eventi-week-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {(eventiSettimana.length > 0 ? eventiSettimana : eventiInArrivo.slice(0, 2)).map(ev => (
                <WeekCard key={ev.id} evento={ev} onClick={() => navigate(`/evento/${ev.id}`)} />
              ))}
            </div>
          </div>

          {/* ── FOOTER STATS ── */}
          <div
            style={{
              background: `linear-gradient(135deg, rgba(0,180,255,0.08), rgba(168,85,247,0.08))`,
              border: `1px solid rgba(0,180,255,0.18)`,
              borderRadius: 20,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>
                {EVENTI.length} eventi questo mese · 4 masterclass premium
              </div>
              <div style={{ fontSize: 13, color: TEXT_DIM }}>2 bartender ospiti in arrivo</div>
            </div>
            <div style={{ fontSize: 36, flexShrink: 0 }}>🍸</div>
          </div>

        </div>
      </div>
    </>
  );
}