import { supabase } from "./supabaseClient";

export type CocktailPreferences = {
  base_alcolica?: string;
  intensita_alcolica?: string;
  profilo_gustativo?: string;
  famiglia_aromatica?: string;
  Genere?: string;
  texture?: string;
};

export type SuggestedCocktail = {
  name: string;
  base_spirit: string;
  ingredients: string[];
  doses: string[];
  technique: string;
  glass: string;
  garnish: string;
  description: string;
  tasting_notes: string[];
  balance_explanation: string;
  source: "database" | "generated";
  matchScore: number;
  originalRecord?: Record<string, any>;
};

type CatalogCocktail = {
  name: string;
  ingredients: string[];
  doses: string[];
  base_alcolica?: string;
  intensita_alcolica?: string;
  profilo_gustativo?: string;
  famiglia_aromatica?: string;
  Genere?: string;
  texture?: string;
  description?: string;
  technique?: string;
  glass?: string;
  garnish?: string;
  tasting_notes?: string[];
  originalRecord?: Record<string, any>;
};

type ValidationResult = {
  isValid: boolean;
  message?: string;
  activeKeys: Array<keyof CocktailPreferences>;
};

type RankedCatalogEntry = {
  cocktail: CatalogCocktail;
  score: number;
  ingredientAffinity: number;
};

const preferenceKeys: Array<keyof CocktailPreferences> = [
  "base_alcolica",
  "intensita_alcolica",
  "profilo_gustativo",
  "famiglia_aromatica",
  "Genere",
  "texture",
];

const autoBaseRules: Array<{
  keys: Array<keyof CocktailPreferences>;
  values: string[];
  suggestions: string[];
}> = [
  { keys: ["Genere", "famiglia_aromatica"], values: ["Frozen", "Fruttato"], suggestions: ["Rum"] },
  { keys: ["intensita_alcolica", "profilo_gustativo"], values: ["Molto alta", "Secco"], suggestions: ["Whisky"] },
  { keys: ["Genere", "profilo_gustativo"], values: ["Highball", "Acido"], suggestions: ["Gin"] },
  { keys: ["Genere", "profilo_gustativo"], values: ["Stirred (mescolati)", "Dolce"], suggestions: ["Brandy"] },
  { keys: ["intensita_alcolica", "texture"], values: ["Bassa", "Leggero"], suggestions: ["Analcolico"] },
];

const spiritProfiles: Record<string, {
  base: string;
  modifiers: string[];
  sweeteners: string[];
  acidic: string[];
  aromatics: string[];
  garnishes: string[];
  glasses: string[];
}> = {
  rum: {
    base: "rum",
    modifiers: ["falernum", "allspice dram", "angostura bitters", "amaro alle erbe"],
    sweeteners: ["sciroppo di zucchero", "sciroppo di miele", "sciroppo di demerara"],
    acidic: ["succo di lime", "succo di ananas acidificato"],
    aromatics: ["menta", "ananas", "noce moscata", "passion fruit"],
    garnishes: ["foglia di menta", "zest di lime", "ananas disidratato"],
    glasses: ["double old fashioned", "tiki mug", "coppetta"],
  },
  "rum scuro": {
    base: "rum scuro",
    modifiers: ["falernum", "allspice dram", "amaro aromatico", "angostura bitters"],
    sweeteners: ["sciroppo di demerara", "sciroppo di miele"],
    acidic: ["succo di lime", "succo di limone"],
    aromatics: ["cannella", "vaniglia", "arancia", "cacao"],
    garnishes: ["zest d'arancia", "cannella", "lime essiccato"],
    glasses: ["double old fashioned", "nick & nora"],
  },
  gin: {
    base: "gin",
    modifiers: ["dry vermouth", "elderflower liqueur", "orange bitters", "liquore ai fiori"],
    sweeteners: ["sciroppo di zucchero", "sciroppo di miele chiaro"],
    acidic: ["succo di limone", "succo di lime"],
    aromatics: ["basilico", "rosmarino", "bergamotto", "camomilla"],
    garnishes: ["zest di limone", "rametto di rosmarino", "foglia di basilico"],
    glasses: ["coupette", "highball", "nick & nora"],
  },
  vodka: {
    base: "vodka",
    modifiers: ["liqueur ai fiori", "vermouth bianco", "orange bitters", "liquore ai frutti rossi"],
    sweeteners: ["sciroppo di zucchero", "sciroppo di agave"],
    acidic: ["succo di limone", "succo di lime"],
    aromatics: ["cetriolo", "foglia di menta", "pompelmo", "mela verde"],
    garnishes: ["slice di cetriolo", "zest di pompelmo", "foglia di menta"],
    glasses: ["highball", "coupette"],
  },
  whisky: {
    base: "whisky",
    modifiers: ["vermouth rosso", "amaro", "angostura bitters", "sherry oloroso"],
    sweeteners: ["sciroppo di miele", "sciroppo di acero", "sciroppo di demerara"],
    acidic: ["succo di limone"],
    aromatics: ["cacao", "caffe", "ciliegia", "arancia"],
    garnishes: ["zest d'arancia", "ciliegia al maraschino", "twist di limone"],
    glasses: ["old fashioned", "nick & nora", "double old fashioned"],
  },
  brandy: {
    base: "brandy",
    modifiers: ["vermouth rosso", "orange curacao", "amaro gentile", "aromatic bitters"],
    sweeteners: ["sciroppo di miele", "sciroppo semplice"],
    acidic: ["succo di limone"],
    aromatics: ["uva passa", "albicocca", "vaniglia", "arancia candita"],
    garnishes: ["zest d'arancia", "albicocca disidratata"],
    glasses: ["coupette", "snifter", "nick & nora"],
  },
  tequila: {
    base: "tequila",
    modifiers: ["triple sec", "aperitivo bitter", "liquore al peperoncino", "saline solution"],
    sweeteners: ["sciroppo di agave", "sciroppo semplice"],
    acidic: ["succo di lime", "succo di pompelmo"],
    aromatics: ["pompelmo", "jalapeno", "sale", "coriandolo"],
    garnishes: ["ruota di lime", "sale al peperoncino", "twist di pompelmo"],
    glasses: ["coupette", "rocks", "highball"],
  },
  mezcal: {
    base: "mezcal",
    modifiers: ["aperitivo bitter", "vermouth dry", "liquore al cacao", "saline solution"],
    sweeteners: ["sciroppo di agave", "sciroppo di miele"],
    acidic: ["succo di lime", "succo di limone"],
    aromatics: ["fumo", "pompelmo", "salvia", "pepe rosa"],
    garnishes: ["zest di pompelmo", "foglia di salvia", "sale affumicato"],
    glasses: ["rocks", "nick & nora"],
  },
};

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function getPreferenceTokens(value: unknown): string[] {
  const normalized = normalizeText(value);
  return normalized ? [normalized] : [];
}

function hasActivePreference(value: unknown) {
  return getPreferenceTokens(value).length > 0;
}

function splitField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const text = String(value || "").trim();
  if (!text) return [];

  return text
    .split(/[;,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCatalogRecord(record: Record<string, any>): CatalogCocktail {
  return {
    name: record.name || record.nome || "Cocktail senza nome",
    ingredients: splitField(record.ingredients || record.ingredienti),
    doses: splitField(record.doses || record.dosi),
    base_alcolica: record.base_alcolica,
    intensita_alcolica: record.intensita_alcolica,
    profilo_gustativo: record.profilo_gustativo,
    famiglia_aromatica: record.famiglia_aromatica || record.profilo_aromatico,
    Genere: record.Genere,
    texture: record.texture,
    description: record.description || record.descrizione,
    technique: record.technique || record.tecnica,
    glass: record.glass || record.bicchiere,
    garnish: record.garnish || record.guarnizione,
    tasting_notes: splitField(record.tasting_notes || record.note_degustazione),
    originalRecord: record,
  };
}

export function validatePreferences(preferences: CocktailPreferences): ValidationResult {
  const activeKeys = preferenceKeys.filter((key) => hasActivePreference(preferences[key]));

  if (activeKeys.length < 2) {
    return {
      isValid: false,
      message: "Seleziona almeno 2 preferenze",
      activeKeys,
    };
  }

  return { isValid: true, activeKeys };
}

export function determineBaseSpirit(preferences: CocktailPreferences): string {
  if (normalizeText(preferences.base_alcolica)) {
    return String(preferences.base_alcolica).trim();
  }

  for (const rule of autoBaseRules) {
    const matched = rule.keys.some((key) => {
      const tokens = getPreferenceTokens(preferences[key]);
      return rule.values.some((value) => {
        const normalizedValue = normalizeText(value);
        return tokens.some((token) => token.includes(normalizedValue) || normalizedValue.includes(token));
      });
    });
    if (matched) {
      return rule.suggestions[0];
    }
  }

  const gusto = getPreferenceTokens(preferences.profilo_gustativo);
  if (gusto.some((value) => value.includes("amaro") || value.includes("amaricante") || value.includes("secco") || value.includes("spirit") || value.includes("umami"))) return "Whisky";
  if (gusto.some((value) => value.includes("dolce") || value.includes("agrodolce") || value.includes("fruttato") || value.includes("tropicale"))) return "Rum";
  if (gusto.some((value) => value.includes("acido") || value.includes("aspro") || value.includes("sour"))) return "Gin";
  return "Gin";
}

export function scoreCocktails(cocktail: CatalogCocktail, preferences: CocktailPreferences) {
  let score = 0;

  for (const key of preferenceKeys) {
    const wanted = normalizeText(preferences[key]);
    const actual = normalizeText(cocktail[key]);
    if (!wanted || !actual) continue;

    if (actual === wanted) {
      score += key === "base_alcolica" ? 4 : 3;
    }
  }

  if (!normalizeText(preferences.base_alcolica)) {
    const automaticBase = determineBaseSpirit(preferences);
    if (normalizeText(cocktail.base_alcolica) === normalizeText(automaticBase)) {
      score += 2;
    }
  }

  return score;
}

function scoreIngredientAffinity(cocktail: CatalogCocktail, referenceIngredients: string[]) {
  if (!referenceIngredients.length || !cocktail.ingredients.length) return 0;

  const normalizedReference = new Set(referenceIngredients.map((ingredient) => normalizeText(ingredient)));
  return cocktail.ingredients.reduce((total, ingredient) => {
    return total + (normalizedReference.has(normalizeText(ingredient)) ? 1 : 0);
  }, 0);
}

export function filterCocktails(catalog: CatalogCocktail[], preferences: CocktailPreferences): SuggestedCocktail[] {
  const base = determineBaseSpirit(preferences);
  const preferBase = normalizeText(preferences.base_alcolica);

  const scopedCatalog = preferBase
    ? catalog.filter((cocktail) => normalizeText(cocktail.base_alcolica) === normalizeText(preferences.base_alcolica))
    : catalog;

  const primaryRanked = scopedCatalog
    .map((cocktail) => ({
      cocktail,
      score: scoreCocktails(cocktail, { ...preferences, base_alcolica: preferBase ? preferences.base_alcolica : base }),
      ingredientAffinity: 0,
    }))
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score);

  const referenceIngredients = primaryRanked[0]?.cocktail.ingredients || [];

  const ranked = primaryRanked
    .map((entry) => ({
      ...entry,
      ingredientAffinity: scoreIngredientAffinity(entry.cocktail, referenceIngredients),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.ingredientAffinity !== a.ingredientAffinity) return b.ingredientAffinity - a.ingredientAffinity;
      return a.cocktail.name.localeCompare(b.cocktail.name);
    })
    .slice(0, 4)
    .map(({ cocktail, score, ingredientAffinity }) => ({
      name: cocktail.name,
      base_spirit: cocktail.base_alcolica || base,
      ingredients: cocktail.ingredients,
      doses: cocktail.doses,
      technique: cocktail.technique || defaultTechnique(preferences),
      glass: cocktail.glass || defaultGlass(preferences, base),
      garnish: cocktail.garnish || defaultGarnish(base),
      description: cocktail.description || buildDescription(
        cocktail.name,
        cocktail.base_alcolica || base,
        preferences,
        0,
        cocktail.technique || defaultTechnique(preferences)
      ),
      tasting_notes: cocktail.tasting_notes?.length ? cocktail.tasting_notes : buildTastingNotes(cocktail.base_alcolica || base, preferences),
      balance_explanation: explainBalance(cocktail.base_alcolica || base, preferences),
      source: "database" as const,
      matchScore: score + ingredientAffinity,
      originalRecord: cocktail.originalRecord,
    }));

  return ranked;
}

function defaultTechnique(preferences: CocktailPreferences) {
  const stile = normalizeText(preferences.Genere);
  if (stile.includes("highball") || stile.includes("pestati")) return "build";
  if (stile.includes("frozen")) return "blend";
  if (stile.includes("shakerato") || stile.includes("agitato")) return "shake";
  if (stile.includes("tiki")) return "shake";
  if (stile.includes("built") || stile.includes("costruito")) return "build";
  if (stile.includes("layered") || stile.includes("strati")) return "layer";
  if (stile.includes("sour")) return "shake";
  return "stir";
}

function defaultGlass(preferences: CocktailPreferences, baseSpirit: string) {
  const style = normalizeText(preferences.Genere);
  if (style.includes("pestati")) return "old fashioned";
  if (style.includes("shakerato") || style.includes("agitato")) return "coupette";
  if (style.includes("stirred") || style.includes("mescolati") || style.includes("miscelati") || normalizeText(baseSpirit).includes("gin")) return "coupette";
  return "highball";
}

function defaultGarnish(baseSpirit: string) {
  const profile = spiritProfiles[resolveProfileKey(baseSpirit)] || spiritProfiles.gin;
  return profile.garnishes[0];
}

function resolveProfileKey(baseSpirit: string) {
  const normalized = normalizeText(baseSpirit);
  if (normalized === "cognac") return "brandy";
  if (normalized === "aperitivo bitter (campari, aperol)" || normalized === "aperitivo bitter") return "gin";
  if (normalized === "bitter") return "gin";
  if (normalized === "liquore (generico)" || normalized === "liquore") return "vodka";
  if (normalized === "vermouth") return "gin";
  if (normalized === "vermouth rosso") return "whisky";
  if (normalized === "sherry") return "whisky";
  if (normalized === "amaro") return "whisky";
  if (normalized === "spumante/champagne") return "gin";
  if (normalized === "vino") return "gin";
  if (normalized === "birra") return "gin";
  if (normalized === "mix (multi base)" || normalized === "mix") return "gin";
  if (normalized === "analcolico") return "gin";
  return normalized;
}

function pickByIndex(list: string[], index: number) {
  return list[index % list.length];
}

function buildGeneratedRecipe(baseSpirit: string, preferences: CocktailPreferences, variant: number) {
  const profile = spiritProfiles[resolveProfileKey(baseSpirit)] || spiritProfiles.gin;
  const intensita = getPreferenceTokens(preferences.intensita_alcolica);
  const gusto = getPreferenceTokens(preferences.profilo_gustativo);
  const isStrong = intensita.some((value) => value.includes("alta"));
  const isSweet = gusto.some((value) => value.includes("dolce") || value.includes("agrodolce") || value.includes("fruttato") || value.includes("tropicale"));
  const isBitter = gusto.some((value) => value.includes("amaro") || value.includes("amaricante") || value.includes("secco") || value.includes("spirit") || value.includes("umami"));
  const normalizedStyle = normalizeText(preferences.Genere);
  const isSparkling = normalizedStyle.includes("highball") || gusto.some((value) => value.includes("fresco") || value.includes("acido") || value.includes("aspro") || value.includes("sour"));
  const isSourStyle = normalizedStyle.includes("sour");

  const baseMl = isStrong ? 55 : 45 + variant * 5;
  const acidMl = isSourStyle ? 25 : (isBitter ? 15 : 20);
  const sweetMl = isSweet ? 18 : 12 + variant * 2;
  const modifierMl = isSparkling ? 60 : 10;

  const modifier = isSparkling
    ? variant === 0 ? "top di soda" : "top di tonica secca"
    : pickByIndex(profile.modifiers, variant);

  const aroma = pickByIndex(profile.aromatics, variant + 1);
  const sweetener = pickByIndex(profile.sweeteners, variant);
  const acidic = pickByIndex(profile.acidic, variant);

  const ingredients = [baseSpirit, acidic, sweetener, modifier];
  const doses = [
    `${baseMl} ml`,
    `${acidMl} ml`,
    `${sweetMl} ml`,
    isSparkling ? `${modifierMl} ml` : `${modifierMl} ml`,
  ];

  if (!isSparkling) {
    ingredients.push(aroma);
    doses.push("2 dash / 5 ml");
  }

  return {
    ingredients,
    doses,
    technique: defaultTechnique(preferences),
    glass: defaultGlass(preferences, baseSpirit),
    garnish: pickByIndex(profile.garnishes, variant),
  };
}

function buildGeneratedName(baseSpirit: string, preferences: CocktailPreferences, variant: number) {
  const taste = getPreferenceTokens(preferences.profilo_gustativo)[0] || "signature";
  const aroma = getPreferenceTokens(preferences.famiglia_aromatica)[0] || "house";
  const texture = normalizeText(preferences.texture) || "lo zio";

  const first = [taste, aroma, texture]
    .find(Boolean)
    ?.split(/[\s&/-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Lo Zio";

  const suffix = variant === 0 ? "Signature" : "Reserve";
  return `${first} ${baseSpirit.charAt(0).toUpperCase() + baseSpirit.slice(1)} ${suffix}`;
}

function buildDescription(
  name: string,
  baseSpirit: string,
  preferences: CocktailPreferences,
  variant = 0,
  technique = "stir"
) {
  const notes = buildTastingNotes(baseSpirit, preferences).slice(0, 3).join(", ");
  const when = defaultMoment(preferences);
  const taste = getPreferenceTokens(preferences.profilo_gustativo)[0] || "equilibrato";
  const texture = normalizeText(preferences.texture) || "setoso";
  
  console.log("[buildDescription] variant:", variant, "typeof:", typeof variant, "name:", name);
  
  if (variant === 0) {
    console.log("  -> Returning SIGNATURE");
    return `Profilo Signature: identita ${taste.toLowerCase()} con attacco diretto, centro bocca compatto e finale netto. Lettura aromatica su ${notes.toLowerCase()} e tessitura ${texture.toLowerCase()}, pensata per un servizio preciso e riconoscibile. Contesto ideale: ${when}.`;
  }
  
  console.log("  -> Returning RESERVE");
  return `Profilo Reserve: sviluppo piu stratificato, ingresso progressivo e chiusura lunga. La tecnica ${technique.toLowerCase()} spinge una percezione piu ampia di ${notes.toLowerCase()}, mantenendo una linea ${taste.toLowerCase()} e una trama ${texture.toLowerCase()} di taglio contemporaneo.`;
}

function buildTastingNotes(baseSpirit: string, preferences: CocktailPreferences) {
  const notes = [
    ...getPreferenceTokens(preferences.famiglia_aromatica),
    ...getPreferenceTokens(preferences.profilo_gustativo),
    defaultFlavorBySpirit(baseSpirit),
    normalizeText(preferences.texture),
  ]
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));

  return notes.length ? notes : ["Agrumato", "Bilanciato", "Pulito", "Lungo"];
}

function defaultFlavorBySpirit(baseSpirit: string) {
  const spirit = normalizeText(baseSpirit);
  if (spirit.includes("rum")) return "Tropicale";
  if (spirit.includes("whisky") || spirit.includes("brandy")) return "Speziato";
  if (spirit.includes("mezcal")) return "Affumicato";
  if (spirit.includes("tequila")) return "Minerale";
  return "Erbaceo";
}

function defaultMoment(preferences: CocktailPreferences) {
  const style = normalizeText(preferences.Genere);
  if (style.includes("frozen")) return "in servizio estivo e rilassato";
  if (style.includes("highball") || style.includes("pestati")) return "in servizio rapido e fresco";
  if (style.includes("shakerato")) return "in servizio pre-serale, fresco e dinamico";
  if (style.includes("sour")) return "in aperitivo o pre-cena";
  return "in servizio serale, sia come signature sia come twist contemporaneo";
}

function parseMl(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function explainBalance(baseSpirit: string, preferences: CocktailPreferences, doses: string[] = []) {
  const style = normalizeText(preferences.Genere) || "contemporaneo";
  const baseMl = parseMl(doses[0]) ?? 50;
  const acidMl = parseMl(doses[1]) ?? 18;
  const sweetMl = parseMl(doses[2]) ?? 14;
  const modifierMl = parseMl(doses[3]) ?? 10;
  const totalCore = Math.max(baseMl + acidMl + sweetMl + modifierMl, 1);
  const spiritShare = baseMl / totalCore;
  const sourSweetDelta = Math.abs(acidMl - sweetMl);
  const acidSweetComment = sourSweetDelta <= 2
    ? "acido/dolce in asse"
    : acidMl > sweetMl
      ? "asse sbilanciato verso freschezza"
      : "asse sbilanciato verso morbidezza";
  const structureComment = spiritShare >= 0.58
    ? "struttura tesa e spirit-forward"
    : spiritShare >= 0.5
      ? "struttura centrata e lineare"
      : "struttura morbida e più distesa";
  const closureComment = modifierMl >= 12
    ? "chiusura ampia e avvolgente"
    : modifierMl >= 8
      ? "chiusura composta e pulita"
      : "chiusura secca e rapida";

  console.log("[explainBalance] doses:", doses, "baseMl:", baseMl, "acidMl:", acidMl, "sweetMl:", sweetMl, "modifierMl:", modifierMl);

  return `Giudizio bilanciamento: ${structureComment}; ${acidSweetComment}; ${closureComment}. Il drink mantiene un assetto ${style} con buona leggibilità aromatica e progressione gustativa coerente.`;
}

export function generateCocktail(preferences: CocktailPreferences, variant = 0): SuggestedCocktail {
  const baseSpirit = determineBaseSpirit(preferences);
  const recipe = buildGeneratedRecipe(baseSpirit, preferences, variant);
  const name = buildGeneratedName(baseSpirit, preferences, variant);

  const description = buildDescription(name, baseSpirit, preferences, variant, recipe.technique);
  const balance = explainBalance(baseSpirit, preferences, recipe.doses);
  
  console.log("[generateCocktail] variant:", variant, "name:", name);
  console.log("  description:", description.substring(0, 80) + "...");
  console.log("  balance:", balance.substring(0, 80) + "...");

  return {
    name,
    base_spirit: baseSpirit,
    ingredients: recipe.ingredients,
    doses: recipe.doses,
    technique: recipe.technique,
    glass: recipe.glass,
    garnish: recipe.garnish,
    description,
    tasting_notes: buildTastingNotes(baseSpirit, preferences),
    balance_explanation: balance,
    source: "generated",
    matchScore: 0,
  };
}

async function fetchCatalog(): Promise<CatalogCocktail[]> {
  const tables = ["cocktail"];

  for (const tableName of tables) {
    const { data, error } = await supabase.from(tableName).select("*");
    if (!error && Array.isArray(data)) {
      return data.map((record) => normalizeCatalogRecord(record));
    }
  }

  return [];
}

export async function getCocktailSuggestions(preferences: CocktailPreferences) {
  const validation = validatePreferences(preferences);
  if (!validation.isValid) {
    return {
      cocktails: [] as SuggestedCocktail[],
      usedFallback: false,
      error: validation.message,
    };
  }

  const catalog = await fetchCatalog();
  const databaseSuggestions = filterCocktails(catalog, preferences);

  const generatedSuggestions = [generateCocktail(preferences, 0), generateCocktail(preferences, 1)];
  const cocktails = [...databaseSuggestions, ...generatedSuggestions];

  console.info("[Lo Zio Configurator] suggestions", {
    preferences,
    catalogSize: catalog.length,
    returned: cocktails.map((cocktail) => ({ name: cocktail.name, source: cocktail.source, score: cocktail.matchScore })),
  });

  return {
    cocktails,
    databaseCocktails: databaseSuggestions,
    generatedCocktails: generatedSuggestions,
    usedFallback: true,
    error: null as string | null,
  };
}
