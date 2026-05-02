import { TASTE_PROFILE_OPTIONS, AROMATIC_FAMILY_OPTIONS } from "../lib/cocktailOptionSets";

export default AdminPanel;
function AdminPanel(props) {
  // Tutta la logica, funzioni, variabili, hook, e return JSX qui dentro

  // --- INIZIO LOGICA E RENDERING ---

  // (Tutto il codice letto dal file, dalle funzioni, variabili, hook, return JSX, ecc. fino alla riga prima degli stili)

  // ...

  // (INCOLLA QUI TUTTO IL CODICE DALLE FUNZIONI, HOOKS, RETURN, ECC. FINO ALLA FINE DEL BLOCCO DI LOGICA)

  // (TUTTO IL CODICE CHE HAI LETTO DAL FILE, FINO ALLA RIGA PRIMA DEGLI STILI)

  // --- FINE LOGICA E RENDERING ---
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
    const isProfiliTable = selectedTable === "profili";

    if (isProfiliTable) {
      if (!hasValidId) {
        setSaveStatus("error");
        alert("Impossibile eliminare utente: id record mancante.");
        return;
      }

      if (!adminPassword) {
        setSaveStatus("error");
        alert("Password admin non disponibile. Esci e rientra come admin.");
        return;
      }

      const isNetlifyHost = typeof window !== "undefined" && window.location.hostname.includes("netlify");
      const endpoints = isNetlifyHost
        ? ["/.netlify/functions/admin-save-profili", "/api/admin-save-profili"]
        : ["/api/admin-save-profili", "/.netlify/functions/admin-save-profili"];

      let lastMessage = "Eliminazione utente fallita lato server.";

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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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


  const booleanFields = new Set(["approvato", "in_evidenza", "verificato", "email_verificata"]);
  const toBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["true", "1", "si", "yes", "on"].includes(normalized);
    }
    return false;
  };

  const aisSelectOptions = {
    limpidezza: ["Velato", "Abbastanza limpido", "Limpido", "Cristallino", "Brillante"],
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
    intensita_olfattiva: ["Carente", "Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
    complessita: ["Carente", "Poco complesso", "Abbastanza complesso", "Complesso", "Ampio"],
    qualita_olfattiva: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
    descrizione_olfattiva: ["Fruttato", "Floreale", "Speziato", "Erbaceo", "Minerale", "Tostato", "Etereo", "Franco"],
    zuccheri: ["Secco", "Abboccato", "Amabile", "Dolce"],
    alcoli: ["Leggero", "Poco alcolico", "Abbastanza alcolico", "Caldo", "Alcolico"],
    polialcoli: ["Spigoloso", "Poco morbido", "Abbastanza morbido", "Morbido", "Pastoso"],
    acidita: ["Piatto", "Poco fresco", "Abbastanza fresco", "Fresco", "Acidulo"],
    tannini: ["Morbidi", "Poco tannici", "Abbastanza tannici", "Tannici", "Astringenti"],
    sali_minerali: ["Scipito", "Poco sapido", "Abbastanza sapido", "Sapido"],
    equilibrio: ["Poco equilibrato", "Abbastanza equilibrato", "Equilibrato"],
    intensita_gusto: ["Carente", "Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
    persistenza: ["Corto", "Poco persistente", "Abbastanza persistente", "Persistente", "Molto persistente"],
    qualita_gusto: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
    corpo: ["Magro", "Debole", "Di corpo", "Robusto", "Pesante"],
    stato_evolutivo: ["Immaturo", "Giovane", "Pronto", "Maturo", "Vecchio"],
    armonia: ["Poco armonico", "Abbastanza armonico", "Armonico"],
    categoria: ["rosso", "bianco", "rosato", "bollicine", "altri vini"],
  };

  const cocktailMultiSelectOptions = {
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
      "Triple Sec/Cointreau",
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
    profilo_gustativo: [...TASTE_PROFILE_OPTIONS],
    famiglia_aromatica: [...AROMATIC_FAMILY_OPTIONS],
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

  const cocktailValueAliases = {
    intensita_alcolica: {
      "bassa (session drink)": "Bassa",
    },
    profilo_gustativo: {
      "dolce (sweet):": "Dolce (Sweet):",
      "acido/aspro (sour):": "Acido/Aspro (Sour):",
      "amaro/amaricante (bitter):": "Amaro/Amaricante (Bitter):",
      "secco/spiritoso (dry/spirit):": "Secco/Spiritoso (Dry/Spirit):",
      "fruttato/tropicale:": "Fruttato/Tropicale:",
      "umami:": "Umami:",
      "dolce (sweet)": "Dolce (Sweet):",
      "acido/aspro (sour)": "Acido/Aspro (Sour):",
      "amaro/amaricante (bitter)": "Amaro/Amaricante (Bitter):",
      "secco/spiritoso (dry/spirit)": "Secco/Spiritoso (Dry/Spirit):",
      "fruttato/tropicale": "Fruttato/Tropicale:",
      dolce: "Dolce (Sweet):",
      acido: "Acido/Aspro (Sour):",
      amaro: "Amaro/Amaricante (Bitter):",
      secco: "Secco/Spiritoso (Dry/Spirit):",
      fruttato: "Fruttato/Tropicale:",
      umami: "Umami:",
    },
    famiglia_aromatica: {
      tostato: "Tostato/Affumicato",
      affumicato: "Tostato/Affumicato",
      "tostato affumicato": "Tostato/Affumicato",
      "tostato/affumicato": "Tostato/Affumicato",
      "affumicato/tostato": "Tostato/Affumicato",
      balsamico: "Balsamico",
      piccante: "Speziato",
      neutro: "",
    },
  };

  const localiSelectOptions = {
    qualita_drink: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    competenza_staff: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    atmosfera: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    qualita_prezzo: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
  };

  const localiEditorKeys = [
    "nome",
    "indirizzo",
    "citta",
    "provincia",
    "paese",
    "categoria",
    "orari",
    "price_range",
    "telefono",
    "sito",
    "instagram",
    "image_url",
    "video_url",
    "descrizione",
    "descrizione_completa",
    "qualita_drink",
    "competenza_staff",
    "atmosfera",
    "qualita_prezzo",
    "verificato",
    "in_evidenza",
  ];

  const profiliSelectOptions = {
    ruolo: ["utente", "bartender", "proprietario", "admin"],
    status: ["attivo", "sospeso", "admin"],
    genere: ["uomo", "donna"],
    distillato_preferito: ["Rum", "Whisky", "Gin", "Vodka", "Tequila", "Mezcal", "Brandy", "Cognac", "Amaro", "Vermouth"],
    intensita_preferita: ["Bassa", "Media", "Alta"],
    profilo_gustativo_preferito: [...TASTE_PROFILE_OPTIONS],
    famiglia_aromatica_preferita: [...AROMATIC_FAMILY_OPTIONS],
    metodo_consumo_preferito: ["On the rocks", "Highball", "Straight up", "Neat", "Frozen", "Shakerato", "Con soda", "Con tonica"],
  };

  const profiliEditorKeyOrder = [
    "id",
    "nome",
    "cognome",
    "username",
    "email",
    "telefono",
    "password",
    "ruolo",
    "status",
    "bio_breve",
    "avatar_url",
    "city",
    "paese",
    "genere",
    "distillato_preferito",
    "cocktail_preferito",
    "intensita_preferita",
    "profilo_gustativo_preferito",
    "famiglia_aromatica_preferita",
    "metodo_consumo_preferito",
    "level",
    "points",
    "badges",
    "numero_recensioni",
    "numero_locali_visitati",
    "numero_cocktail_creati",
    "recensioni",
    "cocktail_creati",
    "locali_segnalati",
    "preferiti",
    "instagram",
    "tiktok",
    "sito_web",
    "nome_locale",
    "esperienza_anni",
    "specialita",
    "certificazioni",
    "menu_caricato",
    "indirizzo_locale",
    "citta_locale",
    "partita_iva",
    "numero_dipendenti",
    "descrizione_locale",
    "created_at",
    "updated_at",
    "ultimo_accesso",
    "email_verificata",
    "approvato",
  ];

  const profiliTextareaFields = new Set([
    "bio_breve",
    "certificazioni",
    "descrizione_locale",
    "recensioni",
    "cocktail_creati",
    "locali_segnalati",
    "preferiti",
  ]);

  const profiliNumberFields = new Set([
    "level",
    "points",
    "numero_recensioni",
    "numero_locali_visitati",
    "numero_cocktail_creati",
    "esperienza_anni",
    "numero_dipendenti",
  ]);

  const profiliArrayFields = new Set(["badges", "recensioni", "cocktail_creati", "locali_segnalati", "preferiti"]);
  const profiliReadonlyFields = new Set(["id", "created_at", "updated_at", "ultimo_accesso"]);

  const fieldLabelMap = {
    name: "nome",
    image_url: "immagine",
    video_url: "video",
    price_range: "fascia prezzo",
    qualita_drink: "qualita drink",
    competenza_staff: "competenza staff",
    atmosfera: "atmosfera",
    qualita_prezzo: "qualita/prezzo",
    telefono: "cellulare",
    status: "stato",
    bio_breve: "bio",
    avatar_url: "foto_profilo",
    city: "citta",
    level: "livello",
    points: "punti",
    badges: "badge",
    specialita: "specializzazione",
    indirizzo_locale: "indirizzo_locale",
    citta_locale: "citta_locale",
  };

  function stringifyProfileCollection(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
    }
    return String(value ?? "").trim();
  }

  function ensureProfiliEditorFields(item) {
    const ruolo = String(item?.ruolo || "utente").trim().toLowerCase();
    const status = String(item?.status || item?.stato || (ruolo === "admin" ? "admin" : item?.approvato ? "attivo" : "sospeso") || "attivo").trim().toLowerCase();

    return {
      id: item?.id ?? "",
      nome: item?.nome ?? "",
      cognome: item?.cognome ?? "",
      username: item?.username ?? "",
      email: item?.email ?? "",
      telefono: item?.telefono ?? item?.cellulare ?? "",
      password: "",
      ruolo,
      status,
      bio_breve: item?.bio_breve ?? item?.bio ?? "",
      avatar_url: item?.avatar_url ?? item?.foto_profilo ?? "",
      city: item?.city ?? item?.citta ?? item?.citta_operativa ?? "",
      paese: item?.paese ?? "",
      genere: item?.genere ?? "",
      distillato_preferito: item?.distillato_preferito ?? "",
      cocktail_preferito: item?.cocktail_preferito ?? "",
      intensita_preferita: item?.intensita_preferita ?? "",
      profilo_gustativo_preferito: item?.profilo_gustativo_preferito ?? "",
      famiglia_aromatica_preferita: item?.famiglia_aromatica_preferita ?? "",
      metodo_consumo_preferito: item?.metodo_consumo_preferito ?? "",
      level: item?.level ?? 1,
      points: item?.points ?? 0,
      badges: stringifyProfileCollection(item?.badges),
      numero_recensioni: item?.numero_recensioni ?? 0,
      numero_locali_visitati: item?.numero_locali_visitati ?? 0,
      numero_cocktail_creati: item?.numero_cocktail_creati ?? 0,
      recensioni: stringifyProfileCollection(item?.recensioni),
      cocktail_creati: stringifyProfileCollection(item?.cocktail_creati),
      locali_segnalati: stringifyProfileCollection(item?.locali_segnalati),
      preferiti: stringifyProfileCollection(item?.preferiti),
      instagram: item?.instagram ?? item?.social_links ?? "",
      tiktok: item?.tiktok ?? "",
      sito_web: item?.sito_web ?? "",
      nome_locale: item?.nome_locale ?? "",
      esperienza_anni: item?.esperienza_anni ?? 0,
      specialita: item?.specialita ?? item?.specializzazione ?? "",
      certificazioni: item?.certificazioni ?? "",
      menu_caricato: item?.menu_caricato ?? "",
      indirizzo_locale: item?.indirizzo_locale ?? item?.indirizzo ?? "",
      citta_locale: item?.citta_locale ?? "",
      partita_iva: item?.partita_iva ?? "",
      numero_dipendenti: item?.numero_dipendenti ?? 0,
      descrizione_locale: item?.descrizione_locale ?? "",
      created_at: item?.created_at ?? "",
      updated_at: item?.updated_at ?? "",
      ultimo_accesso: item?.ultimo_accesso ?? "",
      email_verificata: Boolean(item?.email_verificata),
      approvato: item?.approvato ?? (status === "attivo" || status === "admin"),
    };
  }

  function getProfiliEditorKeys(item) {
    const ruolo = String(item?.ruolo || "utente").toLowerCase();
    return profiliEditorKeyOrder.filter((key) => {
      if (["nome_locale", "esperienza_anni", "specialita", "certificazioni", "menu_caricato"].includes(key) && ruolo !== "bartender") {
        return false;
      }

      if (["nome_locale", "indirizzo_locale", "citta_locale", "partita_iva", "numero_dipendenti", "descrizione_locale"].includes(key) && ruolo !== "proprietario") {
        return !["nome_locale"].includes(key) ? false : ruolo === "bartender";
      }

      return true;
    });
  }

  function normalizeProfiliPayload(item) {
    const normalized = { ...item };

    profiliArrayFields.forEach((field) => {
      normalized[field] = stringifyProfileCollection(normalized[field]);
    });

    profiliNumberFields.forEach((field) => {
      const raw = normalized[field];
      normalized[field] = raw === "" || raw === null || raw === undefined ? 0 : Number(raw);
      if (Number.isNaN(normalized[field])) {
        normalized[field] = 0;
      }
    });

    normalized.ruolo = String(normalized.ruolo || "utente").trim().toLowerCase();
    normalized.status = String(normalized.status || (normalized.approvato ? "attivo" : "sospeso")).trim().toLowerCase();
    normalized.approvato = normalized.status === "attivo" || normalized.status === "admin";

    if (!String(normalized.password || "").trim()) {
      delete normalized.password;
    }

    return normalized;
  }

  function mapCocktailOptionValue(key, rawValue) {
    const cleaned = String(rawValue ?? "").trim();
    if (!cleaned) return "";

    const aliasMap = cocktailValueAliases[key] || {};
    return aliasMap[cleaned.toLowerCase()] || cleaned;
  }

  function getCocktailOptionsForKey(key, rawValue) {
    const baseOptions = cocktailMultiSelectOptions[key] || [];
    const dynamicOptions = String(rawValue ?? "")
      .split(",")
      .map((value) => mapCocktailOptionValue(key, value))
      .filter(Boolean)
      .filter((value) => baseOptions.includes(value));

    return Array.from(new Set([...baseOptions, ...dynamicOptions]));
  }

  function normalizeCocktailMultiValue(key, rawValue) {
    const options = getCocktailOptionsForKey(key, rawValue);
    if (!options.length) return String(rawValue ?? "");

    const normalizedOptions = new Map(options.map((option) => [option.toLowerCase(), option]));

    const cleaned = String(rawValue ?? "")
      .split(",")
      .map((value) => mapCocktailOptionValue(key, value))
      .filter(Boolean)
      .map((value) => normalizedOptions.get(value.toLowerCase()) || value)
      .filter(Boolean);

    return Array.from(new Set(cleaned)).join(",");
  }

  function normalizeCocktailItemValues(item) {
    if (!item) return item;

    const normalizedItem = { ...item };
    Object.keys(cocktailMultiSelectOptions).forEach((key) => {
      if (normalizedItem[key] !== undefined && normalizedItem[key] !== null) {
        normalizedItem[key] = normalizeCocktailMultiValue(key, normalizedItem[key]);
      }
    });
    return normalizedItem;
  }

  function getLocaliEditorKeys(item) {
    return localiEditorKeys.filter((key) => key in (item || {}));
  }

  async function handleLocaleImageUpload(file) {
    if (!file) return;
    setUploadingLocaleImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `locale-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingLocaleImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev) => ({ ...prev, image_url: data.publicUrl }));
    setSaveStatus(null);
    setUploadingLocaleImage(false);
  }

  async function handleLocaleVideoUpload(file) {
    if (!file) return;
    setUploadingLocaleVideo(true);
    const ext = file.name.split(".").pop();
    const fileName = `locale-vid-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "video/mp4" });
    if (error) { alert("Errore upload video: " + error.message); setUploadingLocaleVideo(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev) => ({ ...prev, video_url: data.publicUrl }));
    setSaveStatus(null);
    setUploadingLocaleVideo(false);
  }

  async function handleCocktailImageUpload(file) {
    if (!file) return;
    setUploadingCocktailImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `cocktail-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingCocktailImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingCocktailImage(false);
  }

  async function handleDistillatoImageUpload(file) {
    if (!file) return;
    setUploadingDistillatoImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `distillato-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingDistillatoImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingDistillatoImage(false);
  }

  async function handleWineImageUpload(file) {
    if (!file) return;
    setUploadingWineImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `wine-img-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("drink-images").upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { alert("Errore upload immagine: " + error.message); setUploadingWineImage(false); return; }
    const { data } = supabase.storage.from("drink-images").getPublicUrl(fileName);
    setSelectedItem((prev) => ({ ...prev, immagine: data.publicUrl }));
    setSaveStatus(null);
    setUploadingWineImage(false);
  }

  function ensureLocaliEditorFields(item) {
    const normalized = {
      ...item,
      nome: item?.nome ?? "",
      indirizzo: item?.indirizzo ?? "",
      citta: item?.citta ?? "",
      provincia: item?.provincia ?? "",
      paese: item?.paese ?? "",
      categoria: item?.categoria ?? "",
      orari: item?.orari ?? "",
      price_range: item?.price_range ?? "",
      telefono: item?.telefono ?? "",
      sito: item?.sito ?? "",
      instagram: item?.instagram ?? "",
      image_url: item?.image_url ?? item?.image ?? "",
      image: item?.image ?? item?.image_url ?? "",
      video_url: item?.video_url ?? "",
      descrizione: item?.descrizione ?? "",
      descrizione_completa: item?.descrizione_completa ?? "",
      qualita_drink: item?.qualita_drink ?? "",
      competenza_staff: item?.competenza_staff ?? "",
      atmosfera: item?.atmosfera ?? "",
      qualita_prezzo: item?.qualita_prezzo ?? "",
      verificato: item?.verificato ?? false,
      in_evidenza: item?.in_evidenza ?? false,
    };

    removedLocaliFields.forEach((field) => {
      if (field in normalized) {
        delete normalized[field];
      }
    });

    return normalized;
  }

  function openFirstEditor(table, data) {
    if (!Array.isArray(data) || data.length === 0) return;

    const firstItem = table === "cocktail" ? normalizeCocktailItemValues(data[0]) : { ...data[0] };
    const normalizedFirstItem = table === "Locali"
      ? ensureLocaliEditorFields(firstItem)
      : table === "profili"
        ? ensureProfiliEditorFields(firstItem)
        : firstItem;

    setSelectedTable(table);
    setSelectedItem(normalizedFirstItem);
    setSelectedOriginalItem(normalizedFirstItem);
    setSaveStatus(null);
    setIsCreating(false);
    setCreateRoleHint(null);
  }

  function openCreateEditor(table, data, roleHint) {
    const base = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const draft = {};

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
      const localiTemplate = {
        nome: "",
        indirizzo: "",
        citta: "",
        provincia: "",
        paese: "",
        categoria: "",
        orari: "",
        price_range: "",
        telefono: "",
        sito: "",
        instagram: "",
        image_url: "",
        image: "",
        video_url: "",
        descrizione: "",
        descrizione_completa: "",
        qualita_drink: "",
        competenza_staff: "",
        atmosfera: "",
        qualita_prezzo: "",
        verificato: false,
        in_evidenza: false,
      };

      Object.keys(localiTemplate).forEach((k) => {
        draft[k] = draft[k] ?? localiTemplate[k];
      });

      Object.keys(draft).forEach((k) => {
        if (k !== "id" && !localiEditorKeys.includes(k) && k !== "image") {
          delete draft[k];
        }
      });

      if (!draft.image && draft.image_url) {
        draft.image = draft.image_url;
      }
    }

    if (table === "profili") {
      const profiliTemplate = ensureProfiliEditorFields({
        ruolo: roleHint || "utente",
        approvato: roleHint === "admin",
        status: roleHint === "admin" ? "admin" : "attivo",
        email_verificata: false,
      });

      Object.keys(profiliTemplate).forEach((k) => {
        draft[k] = draft[k] ?? profiliTemplate[k];
      });
    }

    if (table.toLowerCase() === "vini") {
      const vinoTemplate = {
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

  function Sidebar(title, data, table, label) {
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
            } else if (table === "profili" && item) {
              const normalizedItem = ensureProfiliEditorFields(item);
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
  const editorKeys = selectedTable === "Locali"
    ? getLocaliEditorKeys(selectedItem)
    : selectedTable === "profili"
      ? getProfiliEditorKeys(selectedItem)
      : Object.keys(selectedItem || {});

  useEffect(() => {
    setImagePreviewError(false);
  }, [selectedItem?.id, selectedItem?.immagine, selectedTable]);

  // Responsive state for mobile/tablet columns
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Colonne a scomparsa (solo mobile/tablet)
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);

  return (
    <>
      {/* HEADER MOBILE: titolo + pulsanti colonne */}
      {isMobile && (
        <div style={headerMobileStyle}>
          <button aria-label="Apri menu" style={btnColLeftStyle} onClick={() => setLeftOpen(true)}>
            <span style={btnColBar}></span>
            <span style={btnColBar}></span>
          </button>
          <span style={titleMobileStyle}>Pannello di Controllo</span>
          <button aria-label="Azioni rapide" style={btnColRightStyle} onClick={() => setRightOpen(true)}>
            <span style={btnColBar}></span>
            <span style={btnColBar}></span>
          </button>
        </div>
      )}

      {/* LAYOUT MOBILE: 3 colonne a scomparsa */}
      {isMobile ? (
        <div style={mobileLayoutStyle}>
          {/* ...layout mobile/tablet come sopra... */}
        </div>
      ) : (
        <div className="page page-full-bleed fade-in" style={layoutStyle}>
          {/* ...layout desktop originale qui... */}
        </div>
      )}
    </>
  );
}

/* STILI OTTIMIZZATI PER MOBILE & TABLET */

const layoutStyle = { 
  display: "flex", 
  flexWrap: "wrap", // Permette alla sidebar di andare sopra il contenuto su mobile
  alignItems: "flex-start",
  minHeight: "100vh", 
  paddingBottom: 100,
  background: "#020617", 
  color: "white" 
};

const sidebarStyle = { 
  width: "100%", 
  maxWidth: "16.25rem",
  flexBasis: "260px",
  flexGrow: 1,
  padding: 20, 
  borderRight: "1px solid #1e293b",
  background: "0f172a" 
};

const contentStyle = { 
  flex: 1, 
  minWidth: 0,
  padding: "20px 20px 140px",
};

const kpiGridStyle = { 
  display: "flex", 
  gap: 10, 
  flexWrap: "wrap", // I KPI vanno a capo su mobile
  marginBottom: 20 
};

const kpiCardStyle = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: 12,
  border: "1px solid #334155",
  flex: "1 1 140px", // Cresce e si restringe, minimo 140px
  textAlign: "center"
};

const kpiLabelStyle = {
  display: "block",
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginBottom: 5,
  textTransform: "uppercase"
};

const cardStyle = {
  background: "#0f172a",
  padding: 20,
  paddingBottom: 36,
  borderRadius: 16,
  marginTop: 20,
  marginBottom: 80,
  border: "1px solid #1e293b"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Griglia automatica per i campi input
  gap: 15
};

const sidebarTitleStyle = { color: "#f59e0b", fontSize: "0.9rem", marginBottom: 8 };

const fieldStyle = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "#f5a623",
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

const quickActionGridStyle = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};

const quickActionCardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 15,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const quickActionTitleStyle = {
  fontSize: "1rem",
  color: "#f59e0b",
  margin: 0,
};

const quickActionBtnStyle = {
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
  fontWeight: "bold",
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
  fontWeight: "bold",
  cursor: "pointer",
  flex: 1
};

const btnDeleteStyle = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: "bold",
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
  textAlign: "center"
};

const badgeErrorStyle = {
  background: "rgba(239, 68, 68, 0.2)",
  color: "#ef4444",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  border: "1px solid #ef4444",
  textAlign: "center"
};