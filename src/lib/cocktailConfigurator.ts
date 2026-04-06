import { supabase } from "./supabaseClient";

export type CocktailPreferences = {
  base_alcolica?: string;
  intensita_alcolica?: string;
  profilo_gustativo?: string;
  profilo_aromatico?: string;
  stile_consumo?: string;
  carattere?: string;
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
  profilo_aromatico?: string;
  stile_consumo?: string;
  carattere?: string;
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
  "profilo_aromatico",
  "stile_consumo",
  "carattere",
];

const autoBaseRules: Array<{
  keys: Array<keyof CocktailPreferences>;
  values: string[];
  suggestions: string[];
}> = [
  { keys: ["stile_consumo", "carattere", "profilo_aromatico"], values: ["tiki", "esotico", "tropicale"], suggestions: ["rum"] },
  { keys: ["intensita_alcolica", "carattere"], values: ["strong", "bold", "strong & bold", "deciso"], suggestions: ["whisky", "rum scuro"] },
  { keys: ["profilo_gustativo", "profilo_aromatico", "stile_consumo"], values: ["fresco", "agrumato", "refreshing", "day drinking"], suggestions: ["gin", "vodka"] },
  { keys: ["stile_consumo", "carattere"], values: ["after dinner", "meditativo", "elegante"], suggestions: ["brandy", "whisky"] },
  { keys: ["carattere", "profilo_aromatico"], values: ["sperimentale", "affumicato", "funky"], suggestions: ["tequila", "mezcal"] },
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
    profilo_aromatico: record.profilo_aromatico,
    stile_consumo: record.stile_consumo,
    carattere: record.carattere,
    description: record.description || record.descrizione,
    technique: record.technique || record.tecnica,
    glass: record.glass || record.bicchiere,
    garnish: record.garnish || record.guarnizione,
    tasting_notes: splitField(record.tasting_notes || record.note_degustazione),
    originalRecord: record,
  };
}

export function validatePreferences(preferences: CocktailPreferences): ValidationResult {
  const activeKeys = preferenceKeys.filter((key) => normalizeText(preferences[key]));

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
    const matched = rule.keys.some((key) => rule.values.some((value) => normalizeText(preferences[key]).includes(value)));
    if (matched) {
      return rule.suggestions[0];
    }
  }

  const gusto = normalizeText(preferences.profilo_gustativo);
  if (gusto.includes("amaro") || gusto.includes("secco")) return "whisky";
  if (gusto.includes("dolce") || gusto.includes("speziato")) return "rum";
  return "gin";
}

export function scoreCocktails(cocktail: CatalogCocktail, preferences: CocktailPreferences) {
  let score = 0;

  for (const key of preferenceKeys) {
    const wanted = normalizeText(preferences[key]);
    const actual = normalizeText(cocktail[key]);
    if (!wanted || !actual) continue;

    if (actual === wanted) {
      score += key === "base_alcolica" ? 3 : 2;
    } else if (actual.includes(wanted) || wanted.includes(actual)) {
      score += key === "base_alcolica" ? 2 : 1;
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
      description: cocktail.description || buildDescription(cocktail.name, cocktail.base_alcolica || base, preferences),
      tasting_notes: cocktail.tasting_notes?.length ? cocktail.tasting_notes : buildTastingNotes(cocktail.base_alcolica || base, preferences),
      balance_explanation: explainBalance(cocktail.base_alcolica || base, preferences),
      source: "database" as const,
      matchScore: score + ingredientAffinity,
      originalRecord: cocktail.originalRecord,
    }));

  return ranked;
}

function defaultTechnique(preferences: CocktailPreferences) {
  const stile = normalizeText(preferences.stile_consumo);
  if (stile.includes("highball") || stile.includes("aperitivo")) return "build";
  if (stile.includes("tiki") || stile.includes("signature")) return "shake";
  return "stir";
}

function defaultGlass(preferences: CocktailPreferences, baseSpirit: string) {
  const style = normalizeText(preferences.stile_consumo);
  if (style.includes("after dinner") || style.includes("meditazione")) return "old fashioned";
  if (style.includes("aperitivo") || normalizeText(baseSpirit).includes("gin")) return "coupette";
  return "highball";
}

function defaultGarnish(baseSpirit: string) {
  const profile = spiritProfiles[normalizeText(baseSpirit)] || spiritProfiles.gin;
  return profile.garnishes[0];
}

function pickByIndex(list: string[], index: number) {
  return list[index % list.length];
}

function buildGeneratedRecipe(baseSpirit: string, preferences: CocktailPreferences, variant: number) {
  const profile = spiritProfiles[normalizeText(baseSpirit)] || spiritProfiles.gin;
  const isStrong = normalizeText(preferences.intensita_alcolica).includes("alta") || normalizeText(preferences.intensita_alcolica).includes("strong");
  const isSweet = normalizeText(preferences.profilo_gustativo).includes("dolce");
  const isBitter = normalizeText(preferences.profilo_gustativo).includes("amaro");
  const isSparkling = normalizeText(preferences.stile_consumo).includes("highball") || normalizeText(preferences.profilo_gustativo).includes("fresco");

  const baseMl = isStrong ? 55 : 45 + variant * 5;
  const acidMl = isBitter ? 15 : 20;
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
  const taste = normalizeText(preferences.profilo_gustativo) || "signature";
  const aroma = normalizeText(preferences.profilo_aromatico) || "house";
  const character = normalizeText(preferences.carattere) || "lo zio";

  const first = [taste, aroma, character]
    .find(Boolean)
    ?.split(/[\s&/-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Lo Zio";

  const suffix = variant === 0 ? "Signature" : "Reserve";
  return `${first} ${baseSpirit.charAt(0).toUpperCase() + baseSpirit.slice(1)} ${suffix}`;
}

function buildDescription(name: string, baseSpirit: string, preferences: CocktailPreferences) {
  const notes = buildTastingNotes(baseSpirit, preferences).slice(0, 3).join(", ");
  const when = defaultMoment(preferences);
  return `${name} e un cocktail costruito su ${baseSpirit}, con un profilo ${normalizeText(preferences.profilo_gustativo) || "equilibrato"} e una lettura aromatica di ${notes}. Funziona bene ${when}, con una progressione gustativa pulita e professionale.`;
}

function buildTastingNotes(baseSpirit: string, preferences: CocktailPreferences) {
  const notes = [
    normalizeText(preferences.profilo_aromatico),
    normalizeText(preferences.profilo_gustativo),
    defaultFlavorBySpirit(baseSpirit),
    normalizeText(preferences.carattere),
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
  const style = normalizeText(preferences.stile_consumo);
  if (style.includes("after dinner")) return "a fine serata o come drink da conversazione";
  if (style.includes("aperitivo")) return "prima di cena, quando serve tensione e freschezza";
  return "in servizio serale, sia come signature sia come twist contemporaneo";
}

function explainBalance(baseSpirit: string, preferences: CocktailPreferences) {
  const taste = normalizeText(preferences.profilo_gustativo) || "equilibrato";
  const style = normalizeText(preferences.stile_consumo) || "contemporaneo";
  return `Bilanciamento costruito con base alcolica tra 45 e 55 ml, parte acida intorno ai 15-20 ml e supporto dolce tra 12 e 18 ml. Il risultato mantiene una bevuta ${style} e un profilo ${taste}, senza perdere bevibilita e definizione aromatica.`;
}

export function generateCocktail(preferences: CocktailPreferences, variant = 0): SuggestedCocktail {
  const baseSpirit = determineBaseSpirit(preferences);
  const recipe = buildGeneratedRecipe(baseSpirit, preferences, variant);
  const name = buildGeneratedName(baseSpirit, preferences, variant);

  return {
    name,
    base_spirit: baseSpirit,
    ingredients: recipe.ingredients,
    doses: recipe.doses,
    technique: recipe.technique,
    glass: recipe.glass,
    garnish: recipe.garnish,
    description: buildDescription(name, baseSpirit, preferences),
    tasting_notes: buildTastingNotes(baseSpirit, preferences),
    balance_explanation: explainBalance(baseSpirit, preferences),
    source: "generated",
    matchScore: 0,
  };
}

async function fetchCatalog(): Promise<CatalogCocktail[]> {
  const tables = ["cocktails", "cocktail"];

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
