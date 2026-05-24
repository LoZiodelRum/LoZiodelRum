import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

type LocaleRow = Record<string, any>;
type GenericRow = Record<string, any>;

type ResolvedSchema = {
  localiTable: string | null;
  checkinsTable: string | null;
  badgesTable: string | null;
  userBadgesTable: string | null;
  rewardsTable: string | null;
  checkinsUserColumn: string | null;
  checkinsLocaleColumn: string | null;
  checkinsCreatedColumn: string | null;
  userBadgesUserColumn: string | null;
  userBadgesBadgeColumn: string | null;
  rewardsLocaleColumn: string | null;
};

function isTableAccessibleError(error: any): boolean {
  if (!error) return true;
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("permission denied") || msg.includes("row-level security");
}

function isRlsWriteError(error: any): boolean {
  if (!error) return false;
  const code = String(error?.code || "").trim();
  const msg = String(error?.message || "").toLowerCase();
  return code === "42501" || msg.includes("row-level security");
}

function pickFirstText(row: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickFirstNumber(row: Record<string, any>, keys: string[]): number | null {
  for (const key of keys) {
    const value = row?.[key];
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getUserLevel(totalCheckins: number): string {
  if (totalCheckins <= 0) return "Starter";
  if (totalCheckins <= 4) return "Explorer";
  if (totalCheckins <= 9) return "Urban Taster";
  return "Premium Hunter";
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("it-IT");
}

export default function Bancone() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [schema, setSchema] = useState<ResolvedSchema>({
    localiTable: null,
    checkinsTable: null,
    badgesTable: null,
    userBadgesTable: null,
    rewardsTable: null,
    checkinsUserColumn: null,
    checkinsLocaleColumn: null,
    checkinsCreatedColumn: null,
    userBadgesUserColumn: null,
    userBadgesBadgeColumn: null,
    rewardsLocaleColumn: null,
  });

  const [locali, setLocali] = useState<LocaleRow[]>([]);
  const [checkins, setCheckins] = useState<GenericRow[]>([]);
  const [badges, setBadges] = useState<GenericRow[]>([]);
  const [userBadges, setUserBadges] = useState<GenericRow[]>([]);
  const [rewards, setRewards] = useState<GenericRow[]>([]);

  async function resolveTable(candidates: string[]): Promise<string | null> {
    for (const table of candidates) {
      const probe = await supabase.from(table).select("*").limit(1);
      if (!probe.error || isTableAccessibleError(probe.error)) {
        return table;
      }
    }
    return null;
  }

  async function resolveColumn(table: string | null, candidates: string[]): Promise<string | null> {
    if (!table) return null;
    for (const column of candidates) {
      const probe = await supabase.from(table).select(column).limit(1);
      if (!probe.error || isTableAccessibleError(probe.error)) {
        return column;
      }
    }
    return null;
  }

  async function discoverSchema(): Promise<ResolvedSchema> {
    const localiTable = await resolveTable(["Locali", "locali"]);
    const checkinsTable = await resolveTable(["drinkwise_checkins"]);
    const badgesTable = await resolveTable(["drinkwise_badges"]);
    const userBadgesTable = await resolveTable(["drinkwise_user_badges"]);
    const rewardsTable = await resolveTable(["drinkwise_venue_rewards"]);

    const checkinsUserColumn = await resolveColumn(checkinsTable, ["user_id", "utente_id", "profile_id"]);
    const checkinsLocaleColumn = await resolveColumn(checkinsTable, ["locale_id", "local_id", "venue_id"]);
    const checkinsCreatedColumn = await resolveColumn(checkinsTable, ["created_at", "checkin_at", "createdAt"]);

    const userBadgesUserColumn = await resolveColumn(userBadgesTable, ["user_id", "utente_id", "profile_id"]);
    const userBadgesBadgeColumn = await resolveColumn(userBadgesTable, ["badge_id"]);

    const rewardsLocaleColumn = await resolveColumn(rewardsTable, ["locale_id", "local_id", "venue_id"]);

    return {
      localiTable,
      checkinsTable,
      badgesTable,
      userBadgesTable,
      rewardsTable,
      checkinsUserColumn,
      checkinsLocaleColumn,
      checkinsCreatedColumn,
      userBadgesUserColumn,
      userBadgesBadgeColumn,
      rewardsLocaleColumn,
    };
  }

  async function loadAll(currentUserId: string, resolvedSchema: ResolvedSchema) {
    const nextWarnings: string[] = [];

    if (!resolvedSchema.localiTable) {
      nextWarnings.push("Tabella locali non accessibile.");
      setLocali([]);
    } else {
      const localiRes = await supabase
        .from(resolvedSchema.localiTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (localiRes.error) {
        nextWarnings.push("Impossibile caricare i locali.");
        setLocali([]);
      } else {
        setLocali(Array.isArray(localiRes.data) ? localiRes.data : []);
      }
    }

    if (
      !resolvedSchema.checkinsTable ||
      !resolvedSchema.checkinsUserColumn ||
      !resolvedSchema.checkinsLocaleColumn
    ) {
      nextWarnings.push("Check-in non configurabile con lo schema attuale.");
      setCheckins([]);
    } else {
      let query = supabase
        .from(resolvedSchema.checkinsTable)
        .select("*")
        .eq(resolvedSchema.checkinsUserColumn, currentUserId)
        .limit(500);

      if (resolvedSchema.checkinsCreatedColumn) {
        query = query.order(resolvedSchema.checkinsCreatedColumn, { ascending: false });
      }

      const checkinsRes = await query;
      if (checkinsRes.error) {
        nextWarnings.push("Impossibile caricare i check-in utente.");
        setCheckins([]);
      } else {
        setCheckins(Array.isArray(checkinsRes.data) ? checkinsRes.data : []);
      }
    }

    if (!resolvedSchema.badgesTable) {
      nextWarnings.push("Tabella badge non accessibile.");
      setBadges([]);
    } else {
      const badgesRes = await supabase.from(resolvedSchema.badgesTable).select("*").limit(500);
      if (badgesRes.error) {
        nextWarnings.push("Impossibile caricare i badge.");
        setBadges([]);
      } else {
        setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
      }
    }

    if (
      !resolvedSchema.userBadgesTable ||
      !resolvedSchema.userBadgesUserColumn ||
      !resolvedSchema.userBadgesBadgeColumn
    ) {
      nextWarnings.push("Assegnazione badge non configurabile con lo schema attuale.");
      setUserBadges([]);
    } else {
      const userBadgesRes = await supabase
        .from(resolvedSchema.userBadgesTable)
        .select("*")
        .eq(resolvedSchema.userBadgesUserColumn, currentUserId)
        .limit(500);

      if (userBadgesRes.error) {
        nextWarnings.push("Impossibile caricare i badge utente.");
        setUserBadges([]);
      } else {
        setUserBadges(Array.isArray(userBadgesRes.data) ? userBadgesRes.data : []);
      }
    }

    if (!resolvedSchema.rewardsTable || !resolvedSchema.rewardsLocaleColumn) {
      nextWarnings.push("Reward locali non configurabili con lo schema attuale.");
      setRewards([]);
    } else {
      const rewardsRes = await supabase.from(resolvedSchema.rewardsTable).select("*").limit(1000);
      if (rewardsRes.error) {
        nextWarnings.push("Impossibile caricare i reward locali.");
        setRewards([]);
      } else {
        setRewards(Array.isArray(rewardsRes.data) ? rewardsRes.data : []);
      }
    }

    setWarnings(nextWarnings);
  }

  const badgeThresholds = useMemo(() => {
    return badges
      .map((badge, index) => {
        const explicitThreshold = pickFirstNumber(badge, [
          "soglia",
          "threshold",
          "required_checkins",
          "min_checkins",
          "checkins_needed",
          "target",
        ]);

        if (explicitThreshold !== null) {
          return { badge, threshold: explicitThreshold };
        }

        const textualSource = `${pickFirstText(badge, ["nome", "title", "name"])} ${pickFirstText(
          badge,
          ["descrizione", "description"]
        )}`;
        const parsedNumber = Number((textualSource.match(/\d+/) || [""])[0]);
        if (Number.isFinite(parsedNumber) && parsedNumber > 0) {
          return { badge, threshold: parsedNumber };
        }

        return { badge, threshold: null as number | null, fallbackOrder: index };
      })
      .sort((a, b) => {
        const aThreshold = a.threshold ?? Number.MAX_SAFE_INTEGER;
        const bThreshold = b.threshold ?? Number.MAX_SAFE_INTEGER;
        return aThreshold - bThreshold;
      });
  }, [badges]);

  const localeRewardsMap = useMemo(() => {
    const map = new Map<string, GenericRow[]>();
    if (!schema.rewardsLocaleColumn) return map;

    for (const reward of rewards) {
      const key = String(reward?.[schema.rewardsLocaleColumn] ?? "").trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(reward);
    }

    return map;
  }, [rewards, schema.rewardsLocaleColumn]);

  const totalCheckins = checkins.length;
  const visitedLocales = useMemo(() => {
    if (!schema.checkinsLocaleColumn) return 0;
    const unique = new Set<string>();
    for (const row of checkins) {
      const value = row?.[schema.checkinsLocaleColumn];
      if (value !== null && value !== undefined && String(value).trim()) {
        unique.add(String(value));
      }
    }
    return unique.size;
  }, [checkins, schema.checkinsLocaleColumn]);

  const lastCheckinAt = useMemo(() => {
    if (!checkins.length) return null;
    const createdColumn = schema.checkinsCreatedColumn || "created_at";
    for (const row of checkins) {
      const value = row?.[createdColumn] || row?.created_at || row?.checkin_at;
      if (typeof value === "string" && value.trim()) return value;
    }
    return null;
  }, [checkins, schema.checkinsCreatedColumn]);

  const unlockedBadgeIds = useMemo(() => {
    if (!schema.userBadgesBadgeColumn) return new Set<string>();
    const ids = new Set<string>();
    for (const row of userBadges) {
      const value = row?.[schema.userBadgesBadgeColumn];
      if (value !== null && value !== undefined && String(value).trim()) {
        ids.add(String(value));
      }
    }
    return ids;
  }, [userBadges, schema.userBadgesBadgeColumn]);

  const unlockedBadges = useMemo(() => {
    return badges.filter((badge) => unlockedBadgeIds.has(String(badge.id)));
  }, [badges, unlockedBadgeIds]);

  async function assignEligibleBadges(currentUserId: string, nextTotalCheckins: number, resolvedSchema: ResolvedSchema) {
    if (
      !resolvedSchema.userBadgesTable ||
      !resolvedSchema.userBadgesUserColumn ||
      !resolvedSchema.userBadgesBadgeColumn
    ) {
      return;
    }

    const existing = new Set<string>(unlockedBadgeIds);

    for (const item of badgeThresholds) {
      if (item.threshold === null) continue;
      if (nextTotalCheckins < item.threshold) continue;

      const badgeId = String(item.badge?.id ?? "").trim();
      if (!badgeId || existing.has(badgeId)) continue;

      const payload: Record<string, any> = {
        [resolvedSchema.userBadgesUserColumn]: currentUserId,
        [resolvedSchema.userBadgesBadgeColumn]: item.badge.id,
      };

      const insertRes = await supabase.from(resolvedSchema.userBadgesTable).insert([payload]);
      if (insertRes.error) {
        const code = String(insertRes.error?.code || "");
        if (code !== "23505") {
          // Silent safe-fail for non-blocking badge assignment.
        }
      } else {
        existing.add(badgeId);
      }
    }
  }

  async function handleCheckin(locale: LocaleRow) {
    if (!userId) {
      setMessage("Accedi per usare il tuo Bancone");
      return;
    }

    if (!schema.checkinsTable || !schema.checkinsUserColumn || !schema.checkinsLocaleColumn) {
      setMessage("Check-in non disponibile con lo schema attuale.");
      return;
    }

    const localeIdRaw = locale?.id;
    const localeIdCandidates: any[] = [localeIdRaw];
    if (localeIdRaw !== null && localeIdRaw !== undefined) {
      localeIdCandidates.push(String(localeIdRaw));
      const asNumber = Number(localeIdRaw);
      if (Number.isFinite(asNumber)) localeIdCandidates.push(asNumber);
    }

    const localeKey = String(localeIdRaw ?? "");
    setProcessing((prev) => ({ ...prev, [localeKey]: true }));
    setMessage("");

    let inserted = false;
    let usedServerFallback = false;
    let lastInsertError: any = null;

    for (const candidate of localeIdCandidates) {
      const payload: Record<string, any> = {
        [schema.checkinsUserColumn]: userId,
        [schema.checkinsLocaleColumn]: candidate,
      };

      if (schema.checkinsCreatedColumn) {
        payload[schema.checkinsCreatedColumn] = new Date().toISOString();
      }

      const insertRes = await supabase.from(schema.checkinsTable).insert([payload]).select("*").limit(1);
      if (!insertRes.error) {
        inserted = true;
        break;
      }

      lastInsertError = insertRes.error;
    }

    if (!inserted && isRlsWriteError(lastInsertError)) {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes?.data?.session?.access_token || null;

      if (accessToken) {
        const isNetlifyHost = window.location.hostname.includes("netlify");
        const endpoints = isNetlifyHost
          ? ["/.netlify/functions/bancone-checkin", "/api/bancone-checkin"]
          : ["/api/bancone-checkin", "/.netlify/functions/bancone-checkin"];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                localeId: localeIdRaw,
              }),
            });

            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload?.ok) {
              inserted = true;
              usedServerFallback = true;
              break;
            }

            if (response.status !== 404 && response.status !== 405) {
              break;
            }
          } catch {
            // Continue on endpoint fallback.
          }
        }
      }
    }

    if (!inserted) {
      setMessage("Check-in non riuscito. Riprova.");
      setProcessing((prev) => ({ ...prev, [localeKey]: false }));
      return;
    }

    const nextTotal = totalCheckins + 1;
    if (!usedServerFallback) {
      await assignEligibleBadges(userId, nextTotal, schema);
    }
    await loadAll(userId, schema);

    setMessage("Check-in registrato con successo.");
    setProcessing((prev) => ({ ...prev, [localeKey]: false }));
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      const authRes = await supabase.auth.getUser();
      const currentUser = authRes?.data?.user ?? null;

      if (!mounted) return;

      if (!currentUser) {
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(currentUser.id);

      const resolvedSchema = await discoverSchema();
      if (!mounted) return;

      setSchema(resolvedSchema);
      await loadAll(currentUser.id, resolvedSchema);

      if (!mounted) return;
      setLoading(false);
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const authRes = await supabase.auth.getUser();
      const currentUser = authRes?.data?.user ?? null;

      if (!mounted) return;

      if (!currentUser) {
        setUserId(null);
        setLocali([]);
        setCheckins([]);
        setBadges([]);
        setUserBadges([]);
        setRewards([]);
        return;
      }

      setUserId(currentUser.id);
      const resolvedSchema = await discoverSchema();
      if (!mounted) return;
      setSchema(resolvedSchema);
      await loadAll(currentUser.id, resolvedSchema);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!userId && !loading) {
    return (
      <>
        <Navbar />
        <div className="page fade-in" style={{ paddingTop: 90, minHeight: "100vh", background: "#0b0b0b", color: "#fff" }}>
          <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
            <h1 style={{ marginBottom: 12, color: "#f5a623" }}>Bancone</h1>
            <p style={{ opacity: 0.9 }}>Accedi per usare il tuo Bancone</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page fade-in" style={{ paddingTop: 90, minHeight: "100vh", background: "#0b0b0b", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 16px 36px" }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, color: "#f5a623", fontSize: 30 }}>Bancone</h1>
            <p style={{ marginTop: 8, opacity: 0.85 }}>Il tuo spazio DrinkWise per check-in, badge e reward reali.</p>
          </div>

          {warnings.length > 0 && (
            <div style={{ border: "1px solid #664d1f", background: "#2f220b", color: "#ffd37a", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              {warnings.map((warning, idx) => (
                <div key={idx}>{warning}</div>
              ))}
            </div>
          )}

          {message && (
            <div style={{ border: "1px solid #355f2a", background: "#1f3418", color: "#b7ff9f", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              {message}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14 }}>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Check-in Totali</div>
              <div style={{ fontSize: 27, fontWeight: 700, color: "#f5a623" }}>{loading ? "..." : totalCheckins}</div>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14 }}>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Locali Visitati</div>
              <div style={{ fontSize: 27, fontWeight: 700, color: "#f5a623" }}>{loading ? "..." : visitedLocales}</div>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14 }}>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Ultimo Check-in</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{loading ? "..." : formatDate(lastCheckinAt)}</div>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14 }}>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Livello</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f5a623" }}>{loading ? "..." : getUserLevel(totalCheckins)}</div>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14 }}>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Badge Sbloccati</div>
              <div style={{ fontSize: 27, fontWeight: 700, color: "#f5a623" }}>{loading ? "..." : unlockedBadges.length}</div>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{ marginBottom: 10, fontSize: 20, color: "#f5a623" }}>Badge</h2>
            {unlockedBadges.length === 0 ? (
              <div style={{ opacity: 0.8 }}>Nessun badge sbloccato al momento.</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {unlockedBadges.map((badge) => (
                  <div
                    key={String(badge.id)}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #3b3b3b",
                      borderRadius: 999,
                      padding: "8px 12px",
                      fontSize: 13,
                    }}
                  >
                    {pickFirstText(badge, ["icona", "icon"])} {pickFirstText(badge, ["nome", "name", "title"]) || "Badge"}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <h2 style={{ marginBottom: 10, fontSize: 20, color: "#f5a623" }}>Locali DrinkWise</h2>
          </div>

          {loading ? (
            <div>Caricamento Bancone...</div>
          ) : locali.length === 0 ? (
            <div style={{ opacity: 0.8 }}>Nessun locale disponibile.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {locali.map((locale) => {
                const localeId = String(locale?.id ?? "");
                const rewardsForLocale = localeRewardsMap.get(localeId) || [];
                const image = pickFirstText(locale, ["image_url", "image", "immagine"]);
                const nome = pickFirstText(locale, ["nome"]);
                const citta = pickFirstText(locale, ["citta", "city"]);
                const indirizzo = pickFirstText(locale, ["indirizzo", "address"]);

                return (
                  <article
                    key={localeId || Math.random()}
                    style={{
                      background: "#141414",
                      border: "1px solid #2e2e2e",
                      borderRadius: 14,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={nome || "Locale"}
                        style={{ width: "100%", height: 160, objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : null}

                    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>{nome || "Locale"}</div>
                      <div style={{ opacity: 0.78, fontSize: 13 }}>{citta || indirizzo || "-"}</div>

                      {rewardsForLocale.length > 0 && (
                        <div style={{ marginTop: 2 }}>
                          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Reward</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {rewardsForLocale.slice(0, 3).map((reward, idx) => (
                              <div key={`${localeId}-reward-${idx}`} style={{ fontSize: 13, color: "#ffd37a" }}>
                                {pickFirstText(reward, ["titolo", "title", "nome", "reward"])}
                                {pickFirstText(reward, ["descrizione", "description"]) ? ` - ${pickFirstText(reward, ["descrizione", "description"])}` : ""}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        <button
                          onClick={() => handleCheckin(locale)}
                          disabled={Boolean(processing[localeId])}
                          style={{
                            background: processing[localeId] ? "#7c5a18" : "#f5a623",
                            border: "none",
                            color: "#fff",
                            fontWeight: 700,
                            borderRadius: 8,
                            padding: "8px 10px",
                            cursor: processing[localeId] ? "not-allowed" : "pointer",
                          }}
                        >
                          {processing[localeId] ? "Check-in..." : "Fai check-in"}
                        </button>

                        <button
                          onClick={() => navigate(`/venue/${localeId}`)}
                          style={{
                            background: "#262626",
                            border: "1px solid #3a3a3a",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "8px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Apri scheda
                        </button>

                        <button
                          onClick={() => navigate("/mappa")}
                          style={{
                            background: "#262626",
                            border: "1px solid #3a3a3a",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "8px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Vedi sulla mappa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
