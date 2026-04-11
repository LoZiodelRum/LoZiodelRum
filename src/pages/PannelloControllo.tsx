import "../App.css";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const PREVIEW_BOX_SIZE = 280;

export default function PannelloControllo() {
  const { loading } = useUser();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [locali, setLocali] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [articoli, setArticoli] = useState<any[]>([]);
  const [cocktail, setCocktail] = useState<any[]>([]);
  const [distillati, setDistillati] = useState<any[]>([]);
  const [vini, setVini] = useState<any[]>([]);
  const [wineTableName, setWineTableName] = useState<string>("vini");

  const [bartender, setBartender] = useState<any[]>([]);
  const [proprietari, setProprietari] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedOriginalItem, setSelectedOriginalItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createRoleHint, setCreateRoleHint] = useState<string | null>(null);

  const [kpi, setKpi] = useState({
    utenti: 0,
    locali: 0,
    drink: 0,
    articoli: 0,
  });

  const [saveStatus, setSaveStatus] = useState<"ok" | "error" | null>(null);
  const [uploadingLocaleImage, setUploadingLocaleImage] = useState(false);
  const [uploadingLocaleVideo, setUploadingLocaleVideo] = useState(false);
  const [uploadingCocktailImage, setUploadingCocktailImage] = useState(false);
  const [uploadingDistillatoImage, setUploadingDistillatoImage] = useState(false);
  const [uploadingWineImage, setUploadingWineImage] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadData();
    }
  }, [loading]);

  async function loadData() {
    const { data: localiData } = await supabase.from("Locali").select("*");
    const { data: utentiData } = await supabase.from("profili").select("*");
    const { data: articoliData } = await supabase.from("articoli").select("*");
    const { data: cocktailData } = await supabase.from("cocktail").select("*");
    const { data: distillatiData } = await supabase.from("distillati").select("*");
    let viniData: any[] | null = null;
    let detectedWineTable = "vini";

    const viniTryLower = await supabase.from("vini").select("*");
    if (!viniTryLower.error) {
      viniData = viniTryLower.data || [];
      detectedWineTable = "vini";
    } else {
      const viniTryUpper = await supabase.from("Vini").select("*");
      if (!viniTryUpper.error) {
        viniData = viniTryUpper.data || [];
        detectedWineTable = "Vini";
      }
    }

    const safeUsers = Array.isArray(utentiData) ? utentiData : [];
    const safeCocktail = Array.isArray(cocktailData) ? cocktailData : [];

    setLocali(localiData || []);
    setUtenti(safeUsers);

    setBartender(safeUsers.filter(u => u?.ruolo === "bartender"));
    setProprietari(safeUsers.filter(u => u?.ruolo === "proprietario"));

    setArticoli(articoliData || []);
    setCocktail(safeCocktail);
    setDistillati(distillatiData || []);
    setVini(viniData || []);
    setWineTableName(detectedWineTable);

    setKpi({
      utenti: safeUsers.length,
      locali: (localiData || []).length,
      drink: (safeCocktail.length || 0) + (distillatiData?.length || 0),
      articoli: (articoliData || []).length,
    });
  }

  async function toggleApprovazione(user: any) {
    await supabase
      .from("profili")
      .update({ approvato: !user.approvato })
      .eq("id", user.id);

    loadData();
  }

  async function salvaModifiche() {
    if (!selectedItem || !selectedTable) return;

    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isNetlifyHost = typeof window !== "undefined" && window.location.hostname.includes("netlify");

    const { id, ...dataToUpdate } = selectedItem;

    const normalizeValue = (value: any) => {
      if (value === "") return null;
      return value ?? null;
    };

    const cleanData: any = {};
    Object.keys(dataToUpdate).forEach(k => {
      cleanData[k] = normalizeValue(dataToUpdate[k]);
    });

    if (selectedTable.toLowerCase() === "vini" && cleanData.image !== undefined) {
      cleanData.immagine = cleanData.immagine ?? cleanData.image;
      delete cleanData.image;
    }

    if (selectedTable.toLowerCase() === "vini" && cleanData.name !== undefined) {
      cleanData.nome = cleanData.nome ?? cleanData.name;
      delete cleanData.name;
    }

    const changedData: any = {};
    if (!isCreating) {
      Object.keys(cleanData).forEach((k) => {
        const current = cleanData[k];
        const previous = normalizeValue(selectedOriginalItem?.[k]);
        if (JSON.stringify(current) !== JSON.stringify(previous)) {
          changedData[k] = current;
        }
      });

      if (Object.keys(changedData).length === 0) {
        setSaveStatus("ok");
        setTimeout(() => setSaveStatus(null), 2000);
        return;
      }
    }

    let error: any = null;

    const hasValidId = id !== undefined && id !== null && String(id).trim() !== "";
    const fallbackSlug = typeof selectedItem?.slug === "string" ? selectedItem.slug.trim() : "";
    const isWineTable = selectedTable.toLowerCase() === "vini";
    const isCocktailTable = selectedTable.toLowerCase() === "cocktail";
    const isDistillatiTable = selectedTable.toLowerCase() === "distillati";
    const isLocaliTable = selectedTable === "Locali";

    if (isCreating) {
      if (selectedTable.toLowerCase() === "vini") {
        const nowIso = new Date().toISOString();
        if (!cleanData.created_at) {
          cleanData.created_at = nowIso;
        }
      }

      if (!cleanData.id) {
        cleanData.id = crypto.randomUUID();
      }

      if (selectedTable === "profili") {
        cleanData.ruolo = cleanData.ruolo || createRoleHint || "utente";
        cleanData.approvato = cleanData.approvato ?? false;
      }

      if (isCocktailTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-save-cocktail",
            "/.netlify/functions/admin-save-cocktail",
          ];

          let lastMessage = "Creazione cocktail fallita lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "create",
                  id: null,
                  changes: cleanData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isDistillatiTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-save-distillato",
            "/.netlify/functions/admin-save-distillato",
          ];

          let lastMessage = "Creazione distillato fallita lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "create",
                  id: null,
                  changes: cleanData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isLocaliTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = isNetlifyHost
            ? ["/.netlify/functions/admin-save-locale", "/api/admin-save-locale"]
            : ["/api/admin-save-locale", "/.netlify/functions/admin-save-locale"];

          let lastMessage = "Creazione locale fallita lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "create",
                  id: null,
                  changes: cleanData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
              if (response.status !== 404 && response.status !== 405) {
                break;
              }
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else {
        const result = await supabase
          .from(selectedTable)
          .insert([cleanData])
          .select("id");

        error = result.error;

        if (!error && (!result.data || result.data.length === 0)) {
          error = { message: "Nessun record creato. Verifica i permessi di scrittura." };
        }
      }
    } else {
      // Per gli articoli usiamo endpoint serverless admin: evita blocchi RLS lato client.
      if (selectedTable === "articoli") {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-update-article",
            "/.netlify/functions/admin-update-article",
          ];

          let lastMessage = "Salvataggio articolo fallito lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  id: hasValidId ? id : null,
                  slug: fallbackSlug || null,
                  changes: changedData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isWineTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-save-wine",
            "/.netlify/functions/admin-save-wine",
          ];

          let lastMessage = "Salvataggio vino fallito lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: isCreating ? "create" : "update",
                  table: wineTableName,
                  id: hasValidId ? id : null,
                  changes: isCreating ? cleanData : changedData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isCocktailTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-save-cocktail",
            "/.netlify/functions/admin-save-cocktail",
          ];

          let lastMessage = "Salvataggio cocktail fallito lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "update",
                  id: hasValidId ? id : null,
                  changes: changedData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isDistillatiTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = [
            "/api/admin-save-distillato",
            "/.netlify/functions/admin-save-distillato",
          ];

          let lastMessage = "Salvataggio distillato fallito lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "update",
                  id: hasValidId ? id : null,
                  changes: changedData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else if (isLocaliTable) {
        if (!adminPassword) {
          error = { message: "Password admin non disponibile. Esci e rientra come admin." };
        } else {
          const endpoints = isNetlifyHost
            ? ["/.netlify/functions/admin-save-locale", "/api/admin-save-locale"]
            : ["/api/admin-save-locale", "/.netlify/functions/admin-save-locale"];

          let lastMessage = "Salvataggio locale fallito lato server.";

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": adminPassword,
                },
                body: JSON.stringify({
                  mode: "update",
                  id: hasValidId ? id : null,
                  changes: changedData,
                }),
              });

              const payload = await response.json().catch(() => ({}));
              if (response.ok && payload?.ok) {
                lastMessage = "";
                break;
              }

              lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
              if (response.status !== 404 && response.status !== 405) {
                break;
              }
            } catch (e: any) {
              lastMessage = e?.message || `Errore di rete su ${endpoint}`;
            }
          }

          if (lastMessage) {
            error = { message: lastMessage };
          }
        }
      } else {
        if (!session) {
          setSaveStatus("error");
          alert("Salvataggio bloccato: non sei autenticato su Supabase. Fai login con un account con permessi scrittura.");
          return;
        }

      let query = supabase
        .from(selectedTable)
        .update(changedData);

      if (hasValidId) {
        query = query.eq("id", id);
      } else if (selectedTable === "articoli" && fallbackSlug) {
        query = query.eq("slug", fallbackSlug);
      } else {
        error = { message: "Impossibile salvare: record senza id/slug valido." };
      }

      const result = error
        ? { data: null, error }
        : await query.select("id,slug");

      error = result.error;

      if (!error && (!result.data || result.data.length === 0)) {
        error = {
          message: `Nessuna modifica salvata su ${selectedTable}. Verifica policy RLS/permessi utente e chiave record (id: ${String(id ?? "null")}, slug: ${fallbackSlug || "n/a"}).`,
        };
      }
      }
    }

    if (error) {
      setSaveStatus("error");
      console.error("Errore salvataggio:", error);
      alert(error.message || "Errore salvataggio");
      return;
    }

    setSaveStatus("ok");

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);

    setIsCreating(false);
    setCreateRoleHint(null);

    if (!isCreating) {
      let refreshQuery = supabase
        .from(selectedTable)
        .select("*");

      if (hasValidId) {
        refreshQuery = refreshQuery.eq("id", id);
      } else if (selectedTable === "articoli" && fallbackSlug) {
        refreshQuery = refreshQuery.eq("slug", fallbackSlug);
      }

      const { data: refreshedItem } = await refreshQuery.maybeSingle();

      if (refreshedItem) {
        setSelectedItem(refreshedItem);
        setSelectedOriginalItem(refreshedItem);
      }
    }

    await loadData();
  }

  async function eliminaElemento() {
    if (!selectedItem || !selectedTable || isCreating) return;

    const label =
      selectedItem?.nome ||
      selectedItem?.name ||
      selectedItem?.titolo ||
      selectedItem?.username ||
      "questo elemento";

    const confirmed = window.confirm(`Confermi l'eliminazione di ${label}? Questa azione non puo essere annullata.`);
    if (!confirmed) return;

    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    const hasValidId = selectedItem.id !== undefined && selectedItem.id !== null && String(selectedItem.id).trim() !== "";
    const fallbackSlug = typeof selectedItem?.slug === "string" ? selectedItem.slug.trim() : "";
    const isWineTable = selectedTable.toLowerCase() === "vini";
    const isCocktailTable = selectedTable.toLowerCase() === "cocktail";
    const isDistillatiTable = selectedTable.toLowerCase() === "distillati";
    const isLocaliTable = selectedTable === "Locali";

    if (isCocktailTable) {
      if (!hasValidId) {
        setSaveStatus("error");
        alert("Impossibile eliminare cocktail: id record mancante.");
        return;
      }

      if (!adminPassword) {
        setSaveStatus("error");
        alert("Password admin non disponibile. Esci e rientra come admin.");
        return;
      }

      const endpoints = [
        "/api/admin-save-cocktail",
        "/.netlify/functions/admin-save-cocktail",
      ];

      let lastMessage = "Eliminazione cocktail fallita lato server.";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": adminPassword,
            },
            body: JSON.stringify({
              mode: "delete",
              id: selectedItem.id,
            }),
          });

          const payload = await response.json().catch(() => ({}));
          if (response.ok && payload?.ok) {
            lastMessage = "";
            break;
          }

          lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
        } catch (e: any) {
          lastMessage = e?.message || `Errore di rete su ${endpoint}`;
        }
      }

      if (lastMessage) {
        setSaveStatus("error");
        alert(lastMessage);
        return;
      }

      setSaveStatus("ok");

      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);

      setSelectedItem(null);
      setSelectedOriginalItem(null);
      await loadData();
      return;
    }

    if (isWineTable) {
      if (!hasValidId) {
        setSaveStatus("error");
        alert("Impossibile eliminare vino: id record mancante.");
        return;
      }

      let deleted = false;
      let lastMessage = "Eliminazione vino fallita.";

      if (adminPassword) {
        const endpoints = [
          "/api/admin-save-wine",
          "/.netlify/functions/admin-save-wine",
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-admin-password": adminPassword,
              },
              body: JSON.stringify({
                mode: "delete",
                table: wineTableName,
                id: selectedItem.id,
              }),
            });

            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload?.ok) {
              deleted = true;
              break;
            }

            lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
          } catch (e: any) {
            lastMessage = e?.message || `Errore di rete su ${endpoint}`;
          }
        }
      } else {
        lastMessage = "Password admin non disponibile: provo eliminazione diretta.";
      }

      // Fallback client-side: utile se endpoint server/admin env non sono disponibili.
      if (!deleted) {
        const tableCandidates = [wineTableName, wineTableName === "vini" ? "Vini" : "vini"];

        for (const tableName of tableCandidates) {
          const { data, error } = await supabase
            .from(tableName)
            .delete()
            .eq("id", selectedItem.id)
            .select("id");

          if (!error && Array.isArray(data) && data.length > 0) {
            deleted = true;
            break;
          }

          lastMessage = error?.message || `Nessun record eliminato in ${tableName}`;
        }
      }

      if (!deleted) {
        setSaveStatus("error");
        alert(lastMessage);
        return;
      }

      setSaveStatus("ok");

      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);

      setSelectedItem(null);
      setSelectedOriginalItem(null);
      await loadData();
      return;
    }

    if (isDistillatiTable) {
      if (!hasValidId) {
        setSaveStatus("error");
        alert("Impossibile eliminare distillato: id record mancante.");
        return;
      }

      if (!adminPassword) {
        setSaveStatus("error");
        alert("Password admin non disponibile. Esci e rientra come admin.");
        return;
      }

      const endpoints = [
        "/api/admin-save-distillato",
        "/.netlify/functions/admin-save-distillato",
      ];

      let lastMessage = "Eliminazione distillato fallita lato server.";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": adminPassword,
            },
            body: JSON.stringify({
              mode: "delete",
              id: selectedItem.id,
            }),
          });

          const payload = await response.json().catch(() => ({}));
          if (response.ok && payload?.ok) {
            lastMessage = "";
            break;
          }

          lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
        } catch (e: any) {
          lastMessage = e?.message || `Errore di rete su ${endpoint}`;
        }
      }

      if (lastMessage) {
        setSaveStatus("error");
        alert(lastMessage);
        return;
      }

      setSaveStatus("ok");

      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);

      setSelectedItem(null);
      setSelectedOriginalItem(null);
      await loadData();
      return;
    }

    if (isLocaliTable) {
      if (!hasValidId) {
        setSaveStatus("error");
        alert("Impossibile eliminare locale: id record mancante.");
        return;
      }

      if (!adminPassword) {
        setSaveStatus("error");
        alert("Password admin non disponibile. Esci e rientra come admin.");
        return;
      }

      const isNetlifyHost = typeof window !== "undefined" && window.location.hostname.includes("netlify");
      const endpoints = isNetlifyHost
        ? ["/.netlify/functions/admin-save-locale", "/api/admin-save-locale"]
        : ["/api/admin-save-locale", "/.netlify/functions/admin-save-locale"];

      let lastMessage = "Eliminazione locale fallita lato server.";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": adminPassword,
            },
            body: JSON.stringify({
              mode: "delete",
              id: selectedItem.id,
            }),
          });

          const payload = await response.json().catch(() => ({}));
          if (response.ok && payload?.ok) {
            lastMessage = "";
            break;
          }

          lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
          if (response.status !== 404 && response.status !== 405) {
            break;
          }
        } catch (e: any) {
          lastMessage = e?.message || `Errore di rete su ${endpoint}`;
        }
      }

      if (lastMessage) {
        setSaveStatus("error");
        alert(lastMessage);
        return;
      }

      setSaveStatus("ok");

      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);

      setSelectedItem(null);
      setSelectedOriginalItem(null);
      await loadData();
      return;
    }

    let query = supabase
      .from(selectedTable)
      .delete();

    if (hasValidId) {
      query = query.eq("id", selectedItem.id);
    } else if (selectedTable === "articoli" && fallbackSlug) {
      query = query.eq("slug", fallbackSlug);
    } else {
      setSaveStatus("error");
      alert("Impossibile eliminare: record senza id/slug valido.");
      return;
    }

    const { error } = await query;

    if (error) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("ok");

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);

    setSelectedItem(null);
    setSelectedOriginalItem(null);
    await loadData();
  }

  if (loading) return null;
  if (!isAdmin) return <div style={{ padding: 20, color: "red" }}>Accesso negato</div>;

  const booleanFields = new Set(["approvato", "in_evidenza", "verificato"]);
  const toBoolean = (value: any) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["true", "1", "si", "yes", "on"].includes(normalized);
    }
    return false;
  };

  const aisSelectOptions: Record<string, string[]> = {
    limpidezza: ["Limpido", "Cristallino", "Velato"],
    colore: [
      "Giallo verdolino",
      "Giallo paglierino",
      "Giallo dorato",
      "Giallo ambrato",
      "Rosa tenue",
      "Rosa cerasuolo",
      "Rosa chiaretto",
      "Rosso porpora",
      "Rosso rubino",
      "Rosso granato",
      "Rosso aranciato",
    ],
    consistenza: ["Fluido", "Poco consistente", "Abbastanza consistente", "Consistente", "Viscoso"],
    effervescenza: ["Assente", "Fine", "Abbastanza fine", "Persistente"],
    intensita_olfattiva: ["Carenze", "Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
    complessita: ["Carenze", "Poco complesso", "Abbastanza complesso", "Complesso", "Ampio"],
    qualita_olfattiva: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
    descrizione_olfattiva: ["Fruttato", "Floreale", "Speziato", "Erbaceo", "Minerale", "Tostato"],
    zuccheri: ["Secco", "Abboccato", "Amabile", "Dolce"],
    alcoli: ["Leggero", "Poco alcolico", "Abbastanza alcolico", "Caldo", "Alcolico"],
    polialcoli: ["Spigoloso", "Poco morbido", "Abbastanza morbido", "Morbido", "Pastoso"],
    acidita: ["Piatto", "Poco fresco", "Abbastanza fresco", "Fresco", "Acidulo"],
    tannini: ["Morbidi", "Poco tannici", "Abbastanza tannici", "Tannici", "Astringenti"],
    sali_minerali: ["Scipito", "Poco sapido", "Abbastanza sapido", "Sapido"],
    equilibrio: ["Poco equilibrato", "Abbastanza equilibrato", "Equilibrato"],
    intensita_gusto: ["Carenze", "Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
    persistenza: ["Corto", "Poco persistente", "Abbastanza persistente", "Persistente", "Molto persistente"],
    qualita_gusto: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
    corpo: ["Magro", "Debole", "Di corpo", "Robusto", "Pesante"],
    stato_evolutivo: ["Immaturo", "Giovane", "Pronto", "Maturo", "Vecchio"],
    armonia: ["Poco armonico", "Abbastanza armonico", "Armonico"],
    categoria: ["rosso", "bianco", "rosato", "bollicine", "altri vini"],
  };

  const cocktailMultiSelectOptions: Record<string, string[]> = {
    base_alcolica: [
      "Rum",
      "Gin",
      "Vodka",
      "Whisky",
      "Tequila",
      "Mezcal",
      "Brandy",
      "Cognac",
      "Aperitivo bitter",
      "Bitter",
      "Vermouth",
      "Vermouth rosso",
      "Sherry",
      "Liquore",
      "Amaro",
      "Spumante/Champagne",
      "Vino",
      "Birra",
      "Analcolico",
      "Mix",
    ],
    intensita_alcolica: [
      "Bassa",
      "Media",
      "Alta",
      "Molto alta",
    ],
    profilo_gustativo: [
      "Dolce",
      "Secco",
      "Amaro",
      "Agrodolce",
      "Acido",
      "Fresco",
    ],
    famiglia_aromatica: [
      "Agrumato",
      "Fruttato",
      "Speziato",
      "Erbaceo",
      "Floreale",
      "Tostato",
      "Piccante",
      "Neutro",
    ],
    Genere: [
      "Sour",
      "Highball",
      "Stirred (mescolati)",
      "Pestati",
      "Frozen",
      "Shakerato",
      "Agitato",
      "Tiki",
      "Build (Costruito in bicchiere)",
      "A strati (Layered)",
    ],
  };

  const localiSelectOptions: Record<string, string[]> = {
    competenza_staff: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    atmosfera: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    qualita_prezzo: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
  };

  const fieldLabelMap: Record<string, string> = {
    name: "nome",
    competenza_staff: "competenza staff",
    atmosfera: "atmosfera",
    qualita_prezzo: "qualita/prezzo",
  };

  function normalizeCocktailMultiValue(key: string, rawValue: unknown): string {
    const options = cocktailMultiSelectOptions[key];
    if (!options) return String(rawValue ?? "");

    const normalizedOptions = new Map(options.map((option) => [option.toLowerCase(), option]));

    const cleaned = String(rawValue ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        const lower = value.toLowerCase();
        if (key === "intensita_alcolica" && lower === "bassa (session drink)") {
          return "Bassa";
        }
        return normalizedOptions.get(lower) || "";
      })
      .filter(Boolean);

    return Array.from(new Set(cleaned)).join(",");
  }

  function normalizeCocktailItemValues(item: any) {
    if (!item) return item;

    const normalizedItem = { ...item };
    Object.keys(cocktailMultiSelectOptions).forEach((key) => {
      if (normalizedItem[key] !== undefined && normalizedItem[key] !== null) {
        normalizedItem[key] = normalizeCocktailMultiValue(key, normalizedItem[key]);
      }
    });
    return normalizedItem;
  }

  function reorderLocaliKeys(keys: string[]) {
    const targetOrder = ["competenza_staff", "atmosfera", "qualita_prezzo", "recensioni"];
    const remaining = keys.filter((key) => !targetOrder.includes(key));
    const orderedTargets = targetOrder.filter((key) => keys.includes(key));

    const anchorIndex = remaining.indexOf("cover_image_position_y");
    if (anchorIndex === -1) {
      return [...remaining, ...orderedTargets];
    }

    return [
      ...remaining.slice(0, anchorIndex + 1),
      ...orderedTargets,
      ...remaining.slice(anchorIndex + 1),
    ];
  }

  async function handleLocaleImageUpload(file: File) {
    if (!file) return;
    setUploadingLocaleImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `locale-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingLocaleImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev: any) => ({ ...prev, image_url: data.publicUrl }));
    setSaveStatus(null);
    setUploadingLocaleImage(false);
  }

  async function handleLocaleVideoUpload(file: File) {
    if (!file) return;
    setUploadingLocaleVideo(true);
    const ext = file.name.split(".").pop();
    const fileName = `locale-vid-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "video/mp4" });
    if (error) { alert("Errore upload video: " + error.message); setUploadingLocaleVideo(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev: any) => ({ ...prev, video_url: data.publicUrl }));
    setSaveStatus(null);
    setUploadingLocaleVideo(false);
  }

  async function handleCocktailImageUpload(file: File) {
    if (!file) return;
    setUploadingCocktailImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `cocktail-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingCocktailImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev: any) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingCocktailImage(false);
  }

  async function handleDistillatoImageUpload(file: File) {
    if (!file) return;
    setUploadingDistillatoImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `distillato-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingDistillatoImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev: any) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingDistillatoImage(false);
  }

  async function handleWineImageUpload(file: File) {
    if (!file) return;
    setUploadingWineImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `wine-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingWineImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev: any) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingWineImage(false);
  }

  function ensureLocaliEditorFields(item: any) {
    return {
      ...item,
      recensioni: item?.recensioni ?? "",
      competenza_staff: item?.competenza_staff ?? "",
      atmosfera: item?.atmosfera ?? "",
      qualita_prezzo: item?.qualita_prezzo ?? "",
    };
  }

  function openFirstEditor(table: string, data: any[]) {
    if (!Array.isArray(data) || data.length === 0) return;

    const firstItem = table === "cocktail" ? normalizeCocktailItemValues(data[0]) : { ...data[0] };
    const normalizedFirstItem = table === "Locali" ? ensureLocaliEditorFields(firstItem) : firstItem;

    setSelectedTable(table);
    setSelectedItem(normalizedFirstItem);
    setSelectedOriginalItem(normalizedFirstItem);
    setSaveStatus(null);
    setIsCreating(false);
    setCreateRoleHint(null);
  }

  function openCreateEditor(table: string, data: any[], roleHint?: string) {
    const base = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const draft: any = {};

    if (base) {
      Object.keys(base).forEach((k) => {
        if (k === "id") return;

        if (booleanFields.has(k)) {
          draft[k] = false;
          return;
        }

        draft[k] = "";
      });
    }

    if (table === "cocktail") {
      draft.categoria = draft.categoria || "cocktail";
    }

    if (table === "Locali") {
      draft.recensioni = draft.recensioni || "";
      draft.competenza_staff = draft.competenza_staff || "";
      draft.atmosfera = draft.atmosfera || "";
      draft.qualita_prezzo = draft.qualita_prezzo || "";
    }

    if (table === "profili") {
      draft.ruolo = roleHint || "utente";
      draft.approvato = false;
      draft.status = draft.status || "in_attesa";
    }

    if (table.toLowerCase() === "vini") {
      const vinoTemplate: Record<string, any> = {
        nome: "",
        categoria: "",
        annata: "",
        cantina: "",
        vitigno: "",
        grado_alcolico: "",
        zona: "",
        denominazione: "",
        immagine: "",
        limpidezza: "",
        colore: "",
        consistenza: "",
        effervescenza: "",
        intensita_olfattiva: "",
        complessita: "",
        qualita_olfattiva: "",
        descrizione_olfattiva: "",
        zuccheri: "",
        alcoli: "",
        polialcoli: "",
        acidita: "",
        tannini: "",
        sali_minerali: "",
        equilibrio: "",
        intensita_gusto: "",
        persistenza: "",
        qualita_gusto: "",
        corpo: "",
        stato_evolutivo: "",
        armonia: "",
        abbinamenti: "",
        temperatura_servizio: "",
        note_personali: "",
        valutazione: "",
      };

      Object.keys(vinoTemplate).forEach((k) => {
        if (draft[k] === undefined) {
          draft[k] = vinoTemplate[k];
        }
      });
    }

    setSelectedTable(table);
    setSelectedItem(draft);
    setSelectedOriginalItem(null);
    setSaveStatus(null);
    setIsCreating(true);
    setCreateRoleHint(roleHint || null);
  }

  function Sidebar(title: string, data: any[], table: string, label: string) {
    const sorted = [...data].sort((a, b) =>
      String(a?.[label] ?? a?.nome ?? "").localeCompare(
        String(b?.[label] ?? b?.nome ?? "")
      )
    );

    return (
      <div style={{ marginBottom: 20 }}>
        <h4 style={sidebarTitleStyle}>{title}</h4>
        <select
          style={selectStyle}
          value={selectedTable === table && selectedItem ? String(selectedItem.id) : ""}
          onChange={(e) => {
            const value = e.target.value;
            const item = data.find(d => String(d.id) === value);
            if (table === "Locali" && item) {
              const normalizedItem = ensureLocaliEditorFields(item);
              setSelectedItem(normalizedItem);
              setSelectedOriginalItem(normalizedItem);
            } else if (table === "cocktail" && item) {
              const normalizedItem = normalizeCocktailItemValues(item);
              setSelectedItem(normalizedItem);
              setSelectedOriginalItem(normalizedItem);
            } else {
              setSelectedItem(item || null);
              setSelectedOriginalItem(item || null);
            }
            setSelectedTable(table);
            setSaveStatus(null);
            setIsCreating(false);
            setCreateRoleHint(null);
          }}
        >
          <option value="">Scegli</option>
          {sorted.map(d => (
            <option key={d.id} value={String(d.id)}>
              {d?.[label] ?? d?.nome ?? "—"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const isWineTable = selectedTable.toLowerCase() === "vini";
  const isImageSidebarTable = selectedTable === "cocktail" || selectedTable === "distillati" || isWineTable;
  const isImageUploading = selectedTable === "cocktail"
    ? uploadingCocktailImage
    : selectedTable === "distillati"
      ? uploadingDistillatoImage
      : uploadingWineImage;

  useEffect(() => {
    setImagePreviewError(false);
  }, [selectedItem?.id, selectedItem?.immagine, selectedTable]);

  return (
    <div className="page page-full-bleed fade-in" style={layoutStyle}>
      <div style={sidebarStyle}>
        <h2 style={{ color: "#f59e0b", marginBottom: 20, fontSize: "1.2rem" }}>Pannello di Controllo</h2>

        <div style={{ marginTop: 20 }}>
          {Sidebar("Locali", locali, "Locali", "nome")}
        </div>

        {Sidebar("Utenti", utenti, "profili", "username")}
        {Sidebar("Bartender", bartender, "profili", "username")}
        {Sidebar("Proprietari", proprietari, "profili", "username")}
        {Sidebar("Cocktail", cocktail, "cocktail", "nome")}
        {Sidebar("Distillati", distillati, "distillati", "nome")}
        {Sidebar("Vini", vini, wineTableName, "nome")}
        {Sidebar("Articoli", articoli, "articoli", "titolo")}
      </div>

      <div style={contentStyle}>
        <div style={kpiGridStyle}>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Utenti</span> <strong>{kpi.utenti}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Locali</span> <strong>{kpi.locali}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Drink</span> <strong>{kpi.drink}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Articoli</span> <strong>{kpi.articoli}</strong></div>
        </div>

        <div style={approvalBoxStyle}>
          <h3 style={{ fontSize: "1rem", color: "#f59e0b", marginBottom: 10 }}>Approvazioni pendenti</h3>
          {utenti.filter(u => !u.approvato).map(u => (
            <div key={u.id} style={approvalRowStyle}>
              <span style={{ fontSize: "0.9rem" }}>{u.username} ({u.ruolo})</span>
              <button style={btnApproveStyle} onClick={() => toggleApprovazione(u)}>
                Approva
              </button>
            </div>
          ))}
          {utenti.filter(u => !u.approvato).length === 0 && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>Nessun utente da approvare.</p>
          )}
        </div>

        <div style={quickActionGridStyle}>
          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Cocktail</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("cocktail", cocktail)}>
              modifica cocktail
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Distillati</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("distillati", distillati)}>
              modifica distillati
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Vini</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor(wineTableName, vini)}>
              modifica vini
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Locali</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("Locali", locali)}>
              modifica locali
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Bartender</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("profili", bartender, "bartender")}>
              modifica bartender
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Proprietari</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("profili", proprietari, "proprietario")}>
              modifica proprietari
            </button>
          </div>
        </div>

        {selectedItem && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 15 }}>
              {isCreating
                ? "Nuovo elemento"
                : (selectedItem.nome || selectedItem.titolo || selectedItem.username)}
            </h2>

            {saveStatus === "ok" && (
              <div style={badgeOkStyle}>Modifica salvata</div>
            )}

            {saveStatus === "error" && (
              <div style={badgeErrorStyle}>Modifica non salvata</div>
            )}

            {isImageSidebarTable ? (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 15 }}>
                  {(selectedTable === "Locali" ? reorderLocaliKeys(Object.keys(selectedItem)) : Object.keys(selectedItem)).map(key => {
                    if (key === "id" || (selectedTable === "cocktail" && (key === "data_creazione" || key === "created_at" || key === "texture")) || key === "immagine") return null;
                    return (
                      <React.Fragment key={key}>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{fieldLabelMap[key] ?? key}</label>
                        {booleanFields.has(key) ? (
                          <select value={String(toBoolean(selectedItem[key]))} onChange={(e) => { const value = e.target.value === "true"; setSelectedItem((prev: any) => ({ ...prev, [key]: value })); setSaveStatus(null); }} style={selectStyle}><option value="true">true</option><option value="false">false</option></select>
                        ) : selectedTable === "Locali" && localiSelectOptions[key] ? (
                          <select
                            value={selectedItem[key] ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedItem((prev: any) => ({
                                ...prev,
                                [key]: value,
                              }));
                              setSaveStatus(null);
                            }}
                            style={selectStyle}
                          >
                            <option value="">Scegli</option>
                            {localiSelectOptions[key].map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : isWineTable && aisSelectOptions[key] ? (
                          key === "descrizione_olfattiva" ? (
                            <details style={{ position: "relative" }}>
                              <summary
                                style={{
                                  ...selectStyle,
                                  cursor: "pointer",
                                  listStyle: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                {(() => {
                                  const selectedValues = typeof selectedItem[key] === "string"
                                    ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                                    : [];
                                  return selectedValues.length ? selectedValues.join(", ") : "Scegli";
                                })()}
                                <span style={{ marginLeft: 8 }}>▾</span>
                              </summary>
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 6px)",
                                  left: 0,
                                  width: "100%",
                                  zIndex: 20,
                                  border: "1px solid #334155",
                                  borderRadius: 8,
                                  background: "#020617",
                                  padding: 8,
                                  maxHeight: 190,
                                  overflowY: "auto",
                                }}
                              >
                                {aisSelectOptions[key].map((option) => {
                                  const selectedValues = typeof selectedItem[key] === "string"
                                    ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                                    : [];
                                  const isChecked = selectedValues.includes(option);

                                  return (
                                    <label
                                      key={option}
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 24px",
                                        alignItems: "center",
                                        padding: "6px 4px",
                                        columnGap: 8,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <span>{option}</span>
                                      <input
                                        type="checkbox"
                                        style={{ margin: 0, width: 18, height: 18, justifySelf: "center" }}
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const updated = e.target.checked
                                            ? [...selectedValues, option]
                                            : selectedValues.filter((value) => value !== option);

                                          setSelectedItem((prev: any) => ({
                                            ...prev,
                                            [key]: updated.join(","),
                                          }));
                                          setSaveStatus(null);
                                        }}
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            </details>
                          ) : (
                            <select
                              value={selectedItem[key] ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedItem((prev: any) => ({
                                  ...prev,
                                  [key]: value,
                                }));
                                setSaveStatus(null);
                              }}
                              style={selectStyle}
                            >
                              <option value="">Scegli</option>
                              {aisSelectOptions[key].map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )
                        ) : selectedTable === "cocktail" && cocktailMultiSelectOptions[key] ? (
                          <details style={{ position: "relative" }}><summary style={{ ...selectStyle, cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{(() => { const selectedValues = typeof selectedItem[key] === "string" ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean) : []; return selectedValues.length ? selectedValues.join(", ") : "Scegli"; })()}<span style={{ marginLeft: 8 }}>▾</span></summary><div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, width: "100%", zIndex: 20, border: "1px solid #334155", borderRadius: 8, background: "#020617", padding: 8, maxHeight: 220, overflowY: "auto" }}>{cocktailMultiSelectOptions[key].map((option) => { const selectedValues = typeof selectedItem[key] === "string" ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean) : []; const isChecked = selectedValues.includes(option); return (<label key={option} style={{ display: "grid", gridTemplateColumns: "1fr 24px", alignItems: "center", padding: "6px 4px", columnGap: 8, cursor: "pointer" }}><span>{option}</span><input type="checkbox" style={{ margin: 0, width: 18, height: 18, justifySelf: "center" }} checked={isChecked} onChange={(e) => { const updated = e.target.checked ? [...selectedValues, option] : selectedValues.filter((value) => value !== option); setSelectedItem((prev: any) => ({ ...prev, [key]: updated.join(",") })); setSaveStatus(null); }} /></label>); })}</div></details>
                        ) : (
                          <input value={selectedItem[key] ?? ""} onChange={(e) => { setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value })); setSaveStatus(null); }} style={inputStyle} />
                        )}
                      </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                <div style={{ width: 280, flexShrink: 0 }}>
                  {selectedItem?.immagine && (
                    <>
                      <div
                        style={{
                          width: "100%",
                          height: PREVIEW_BOX_SIZE,
                          borderRadius: 8,
                          border: "1px solid #334155",
                          marginBottom: 10,
                          overflow: "hidden",
                          background: "#0b1220",
                          position: "relative",
                        }}
                      >
                        <img
                          src={selectedItem.immagine}
                          alt="Anteprima"
                          draggable={false}
                          onLoad={() => setImagePreviewError(false)}
                          onError={() => setImagePreviewError(true)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            userSelect: "none",
                            pointerEvents: "none",
                            opacity: imagePreviewError ? 0 : 1,
                          }}
                        />
                        {imagePreviewError && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              padding: 16,
                              color: "#e2e8f0",
                              fontSize: 14,
                              fontWeight: 600,
                              background: "rgba(2, 6, 23, 0.65)",
                            }}
                          >
                            Immagine non caricabile (URL non valido o non accessibile)
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <label style={{ ...btnSaveStyle, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "block", textAlign: "center", width: "100%", opacity: isImageUploading ? 0.6 : 1 }}>{isImageUploading ? "Caricamento..." : "Carica immagine"}<input type="file" accept="image/*" style={{ display: "none" }} disabled={isImageUploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) { if (selectedTable === "cocktail") handleCocktailImageUpload(file); else if (selectedTable === "distillati") handleDistillatoImageUpload(file); else if (isWineTable) handleWineImageUpload(file); } }} /></label>
                  <div style={{ ...fieldStyle, marginTop: 12 }}>
                    <label style={labelStyle}>URL immagine</label>
                    <input
                      value={selectedItem?.immagine ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedItem((prev: any) => ({
                          ...prev,
                          immagine: value,
                        }));
                        setSaveStatus(null);
                      }}
                      placeholder="Incolla URL immagine"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={formGridStyle}>
                {(selectedTable === "Locali" ? reorderLocaliKeys(Object.keys(selectedItem)) : Object.keys(selectedItem)).map(key => {
                  if (key === "id" || (selectedTable === "cocktail" && (key === "data_creazione" || key === "created_at" || key === "texture"))) return null;
                  return (
                    <React.Fragment key={key}>
                    <div
                      style={
                        key === "contenuto"
                          ? { ...fieldStyle, gridColumn: "1 / -1" }
                          : fieldStyle
                      }
                    >
                    <label style={labelStyle}>{fieldLabelMap[key] ?? key}</label>
                    {booleanFields.has(key) ? (
                      <select
                        value={String(toBoolean(selectedItem[key]))}
                        onChange={(e) => {
                          const value = e.target.value === "true";
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={selectStyle}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : selectedTable === "Locali" && localiSelectOptions[key] ? (
                      <select
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={selectStyle}
                      >
                        <option value="">Scegli</option>
                        {localiSelectOptions[key].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : selectedTable === "vini" && aisSelectOptions[key] ? (
                      key === "descrizione_olfattiva" ? (
                        <details style={{ position: "relative" }}>
                          <summary
                            style={{
                              ...selectStyle,
                              cursor: "pointer",
                              listStyle: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            {(() => {
                              const selectedValues = typeof selectedItem[key] === "string"
                                ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                                : [];
                              return selectedValues.length ? selectedValues.join(", ") : "Scegli";
                            })()}
                            <span style={{ marginLeft: 8 }}>▾</span>
                          </summary>
                          <div
                            style={{
                              position: "absolute",
                              top: "calc(100% + 6px)",
                              left: 0,
                              width: "100%",
                              zIndex: 20,
                              border: "1px solid #334155",
                              borderRadius: 8,
                              background: "#020617",
                              padding: 8,
                              maxHeight: 190,
                              overflowY: "auto",
                            }}
                          >
                            {aisSelectOptions[key].map((option) => {
                              const selectedValues = typeof selectedItem[key] === "string"
                                ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                                : [];
                              const isChecked = selectedValues.includes(option);

                              return (
                                <label
                                  key={option}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 24px",
                                    alignItems: "center",
                                    padding: "6px 4px",
                                    columnGap: 8,
                                    cursor: "pointer",
                                  }}
                                >
                                  <span>{option}</span>
                                  <input
                                    type="checkbox"
                                    style={{ margin: 0, width: 18, height: 18, justifySelf: "center" }}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const updated = e.target.checked
                                        ? [...selectedValues, option]
                                        : selectedValues.filter((value) => value !== option);

                                      setSelectedItem((prev: any) => ({
                                        ...prev,
                                        [key]: updated.join(","),
                                      }));
                                      setSaveStatus(null);
                                    }}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </details>
                      ) : (
                        <select
                          value={selectedItem[key] ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedItem((prev: any) => ({
                              ...prev,
                              [key]: value,
                            }));
                            setSaveStatus(null);
                          }}
                          style={selectStyle}
                        >
                          <option value="">Scegli</option>
                          {aisSelectOptions[key].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )
                    ) : selectedTable === "cocktail" && cocktailMultiSelectOptions[key] ? (
                      <details style={{ position: "relative" }}>
                        <summary
                          style={{
                            ...selectStyle,
                            cursor: "pointer",
                            listStyle: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          {(() => {
                            const selectedValues = typeof selectedItem[key] === "string"
                              ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                              : [];
                            return selectedValues.length ? selectedValues.join(", ") : "Scegli";
                          })()}
                          <span style={{ marginLeft: 8 }}>▾</span>
                        </summary>

                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            left: 0,
                            width: "100%",
                            zIndex: 20,
                            border: "1px solid #334155",
                            borderRadius: 8,
                            background: "#020617",
                            padding: 8,
                            maxHeight: 220,
                            overflowY: "auto",
                          }}
                        >
                          {cocktailMultiSelectOptions[key].map((option) => {
                            const selectedValues = typeof selectedItem[key] === "string"
                              ? selectedItem[key].split(",").map((v: string) => v.trim()).filter(Boolean)
                              : [];
                            const isChecked = selectedValues.includes(option);

                            return (
                              <label
                                key={option}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 24px",
                                  alignItems: "center",
                                  padding: "6px 4px",
                                  columnGap: 8,
                                  cursor: "pointer",
                                }}
                              >
                                <span>{option}</span>
                                <input
                                  type="checkbox"
                                  style={{ margin: 0, width: 18, height: 18, justifySelf: "center" }}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...selectedValues, option]
                                      : selectedValues.filter((value) => value !== option);

                                    setSelectedItem((prev: any) => ({
                                      ...prev,
                                      [key]: updated.join(","),
                                    }));
                                    setSaveStatus(null);
                                  }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    ) : key === "contenuto" ? (
                      <textarea
                        rows={6}
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={{ ...inputStyle, width: "100%", resize: "vertical" }}
                      />
                    ) : (
                      <input
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={inputStyle}
                      />
                    )}
                  </div>

                  {/* Upload foto+video dopo il campo recensioni, solo per Locali */}
                  {selectedTable === "Locali" && key === "recensioni" && (
                    <>
                      {/* Carica foto */}
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Carica foto</label>
                        <label style={{ ...btnSaveStyle, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "inline-block", textAlign: "center", opacity: uploadingLocaleImage ? 0.6 : 1 }}>
                          {uploadingLocaleImage ? "Caricamento..." : "Scegli file"}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            disabled={uploadingLocaleImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLocaleImageUpload(file);
                            }}
                          />
                        </label>
                        {selectedItem?.image_url && (
                          <img
                            src={selectedItem.image_url}
                            alt="Anteprima"
                            style={{ marginTop: 8, width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, border: "1px solid #334155" }}
                          />
                        )}
                      </div>

                      {/* Carica video */}
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Carica video</label>
                        <label style={{ ...btnSaveStyle, flex: "0 0 auto", padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "inline-block", textAlign: "center", opacity: uploadingLocaleVideo ? 0.6 : 1 }}>
                          {uploadingLocaleVideo ? "Caricamento..." : "Scegli file"}
                          <input
                            type="file"
                            accept="video/*"
                            style={{ display: "none" }}
                            disabled={uploadingLocaleVideo}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLocaleVideoUpload(file);
                            }}
                          />
                        </label>
                        {selectedItem?.video_url && (
                          <video
                            src={selectedItem.video_url}
                            controls
                            style={{ marginTop: 8, width: "100%", maxHeight: 140, borderRadius: 8, border: "1px solid #334155" }}
                          />
                        )}
                      </div>
                    </>
                  )}

                    {(selectedTable === "cocktail" || selectedTable === "distillati" || isWineTable) && key === "immagine" && (
                      null
                  )}
                  </React.Fragment>
                );
              })}
                </div>
              )}

            <div style={buttonRowStyle}>
              <button style={btnSaveStyle} onClick={salvaModifiche}>
                {isCreating ? "Crea" : "Salva"}
              </button>

              {!isCreating && (
                <button style={btnDeleteStyle} onClick={eliminaElemento}>
                  Elimina
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* STILI OTTIMIZZATI PER MOBILE & TABLET */

const layoutStyle: React.CSSProperties = { 
  display: "flex", 
  flexWrap: "wrap", // Permette alla sidebar di andare sopra il contenuto su mobile
  minHeight: "100vh", 
  background: "#020617", 
  color: "white" 
};

const sidebarStyle: React.CSSProperties = { 
  width: "100%", 
  maxWidth: "16.25rem",
  flexBasis: "260px",
  flexGrow: 1,
  padding: 20, 
  borderRight: "1px solid #1e293b",
  background: "#0f172a" 
};

const contentStyle: React.CSSProperties = { 
  flex: 1, 
  minWidth: 0,
  padding: "20px" 
};

const kpiGridStyle: React.CSSProperties = { 
  display: "flex", 
  gap: 10, 
  flexWrap: "wrap", // I KPI vanno a capo su mobile
  marginBottom: 20 
};

const kpiCardStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: 12,
  border: "1px solid #334155",
  flex: "1 1 140px", // Cresce e si restringe, minimo 140px
  textAlign: "center"
};

const kpiLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginBottom: 5,
  textTransform: "uppercase"
};

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  border: "1px solid #1e293b"
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Griglia automatica per i campi input
  gap: 15
};

const sidebarTitleStyle = { color: "#f59e0b", fontSize: "0.9rem", marginBottom: 8 };

const fieldStyle = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  marginBottom: 5
};

const inputStyle = {
  padding: "10px",
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
  fontSize: "14px"
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
};

const approvalBoxStyle = {
  marginTop: 20,
  background: "#0f172a",
  padding: 15,
  borderRadius: 10,
  border: "1px solid #1e293b"
};

const quickActionGridStyle: React.CSSProperties = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};

const quickActionCardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 15,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const quickActionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "#f59e0b",
  margin: 0,
};

const quickActionBtnStyle: React.CSSProperties = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const approvalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #1e293b",
};

const btnApproveStyle = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer"
};

const buttonRowStyle = {
  display: "flex",
  gap: 10,
  marginTop: 25,
};

const btnSaveStyle = {
  background: "#10b981",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer",
  flex: 1
};

const btnDeleteStyle = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer",
  flex: 1
};

const badgeOkStyle = {
  background: "rgba(16, 185, 129, 0.2)",
  color: "#10b981",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  border: "1px solid #10b981",
  textAlign: "center" as const
};

const badgeErrorStyle = {
  background: "rgba(239, 68, 68, 0.2)",
  color: "#ef4444",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  border: "1px solid #ef4444",
  textAlign: "center" as const
};