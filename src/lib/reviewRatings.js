/**
 * Opzioni per i menu a tendina delle valutazioni recensioni.
 * Ogni categoria ha 6 scelte con etichetta e valore numerico (per la media).
 */
export const ratingOptions = {
  drink_quality: [
    { label: "Squilibrato", value: 2 },
    { label: "Piatto", value: 4 },
    { label: "Discreto", value: 6 },
    { label: "Equilibrato", value: 7 },
    { label: "Raffinato", value: 9 },
    { label: "Memorabile", value: 10 },
  ],
  staff_competence: [
    { label: "Impreparato", value: 2 },
    { label: "Rudimentale", value: 4 },
    { label: "Sufficiente", value: 6 },
    { label: "Competente", value: 7 },
    { label: "Esperto", value: 9 },
    { label: "Maestro", value: 10 },
  ],
  atmosphere: [
    { label: "Anonima", value: 2 },
    { label: "Povera", value: 4 },
    { label: "Accettabile", value: 6 },
    { label: "Accogliente", value: 7 },
    { label: "Suggestiva", value: 9 },
    { label: "Indimenticabile", value: 10 },
  ],
  value_for_money: [
    { label: "Sproporzionato", value: 2 },
    { label: "Caro", value: 4 },
    { label: "Nella media", value: 6 },
    { label: "Conveniente", value: 7 },
    { label: "Buon rapporto", value: 9 },
    { label: "Ottimo valore", value: 10 },
  ],
};

/** Restituisce l'etichetta per un valore numerico (per recensioni esistenti) */
export function getLabelForValue(categoryKey, value) {
  const opts = ratingOptions[categoryKey];
  if (!opts) return String(value);
  const found = opts.find((o) => o.value === value);
  if (found) return found.label;
  const closest = opts.reduce((a, b) =>
    Math.abs(a.value - value) <= Math.abs(b.value - value) ? a : b
  );
  return closest?.label ?? String(value);
}

/** Mappa chiavi avg_* alle chiavi delle opzioni */
export const avgKeyToOptionKey = {
  avg_drink_quality: "drink_quality",
  avg_staff_competence: "staff_competence",
  avg_atmosphere: "atmosphere",
  avg_value: "value_for_money",
};

/** Restituisce il valore più vicino tra le opzioni (per compatibilità con dati esistenti) */
export function getClosestValue(categoryKey, value) {
  const opts = ratingOptions[categoryKey];
  if (!opts || value == null) return value;
  const found = opts.find((o) => o.value === value);
  if (found) return found.value;
  const closest = opts.reduce((a, b) =>
    Math.abs(a.value - value) <= Math.abs(b.value - value) ? a : b
  );
  return closest?.value ?? value;
}
