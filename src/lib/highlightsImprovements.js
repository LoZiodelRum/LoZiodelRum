/**
 * Opzioni per Punti di forza e Aree di miglioramento.
 * Mappa vecchie → nuove per migrare recensioni esistenti.
 */
export const highlightOptions = [
  "Cocktail ben fatti",
  "Buona carta rum",
  "Staff competente",
  "Atmosfera accogliente",
  "Rapporto qualità/prezzo ok",
  "Selezione vini interessante",
  "Ingredienti curati",
  "Location curata",
  "Servizio puntuale",
  "Musica di sottofondo",
];

export const improvementOptions = [
  "Servizio lento",
  "Prezzi alti",
  "Ambiente rumoroso",
  "Cocktail a volte inconsistenti",
  "Poca varietà in carta",
  "Difficile da trovare",
  "Orari limitati",
  "Coperto fuori",
  "Prenotazione consigliata",
];

const highlightOldToNew = {
  "Cocktail eccezionali": "Cocktail ben fatti",
  "Carta rum straordinaria": "Buona carta rum",
  "Staff preparatissimo": "Staff competente",
  "Atmosfera unica": "Atmosfera accogliente",
  "Ottimo rapporto Q/P": "Rapporto qualità/prezzo ok",
  "Selezione vini top": "Selezione vini interessante",
  "Ingredienti premium": "Ingredienti curati",
  "Location suggestiva": "Location curata",
};

const improvementOldToNew = {
  "Prezzi elevati": "Prezzi alti",
  "Rumoroso": "Ambiente rumoroso",
  "Cocktail inconsistenti": "Cocktail a volte inconsistenti",
  "Poca varietà": "Poca varietà in carta",
};

/** Migra highlights/improvements vecchi alle nuove etichette, rimuove duplicati */
export function migrateHighlights(arr) {
  if (!Array.isArray(arr)) return [];
  const set = new Set();
  for (const v of arr) {
    const migrated = highlightOldToNew[v] || v;
    if (highlightOptions.includes(migrated)) set.add(migrated);
  }
  return [...set];
}

export function migrateImprovements(arr) {
  if (!Array.isArray(arr)) return [];
  const set = new Set();
  for (const v of arr) {
    const migrated = improvementOldToNew[v] || v;
    if (improvementOptions.includes(migrated)) set.add(migrated);
  }
  return [...set];
}
