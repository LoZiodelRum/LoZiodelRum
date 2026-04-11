const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildPrompt(name, campo) {
  const prompts = {
    descrizione: `Scrivi una breve descrizione del cocktail "${name}", massimo 3 righe, tono professionale ma accessibile.`,
    preparazione: `Scrivi le istruzioni di preparazione del cocktail "${name}", in modo chiaro e ordinato, massimo 5 righe.`,
    ingredienti: `Elenca gli ingredienti tipici del cocktail "${name}" con le dosi indicative, separati da punto e virgola.`,
    storia: `Scrivi una breve storia del cocktail "${name}", massimo 5 righe, tono professionale ma semplice.`,
    consigli: `Scrivi 2-3 consigli di servizio e abbinamento per il cocktail "${name}", tono diretto.`,
    guarnizione: `Scrivi la guarnizione ideale per il cocktail "${name}", massimo 1-2 righe.`,
    intensita_alcolica: `Indica il livello di intensità alcolica del cocktail "${name}". Rispondi con una sola parola tra: Bassa, Media, Alta, Molto alta.`,
    profilo_gustativo: `Indica il profilo gustativo prevalente del cocktail "${name}". Rispondi con una sola parola tra: Dolce, Secco, Amaro, Agrodolce, Acido, Fresco.`,
    famiglia_aromatica: `Indica la famiglia aromatica del cocktail "${name}". Rispondi con una sola parola tra: Agrumato, Fruttato, Speziato, Erbaceo, Floreale, Tostato, Piccante, Neutro.`,
    base_alcolica: `Indica la base alcolica principale del cocktail "${name}". Rispondi con una sola parola o breve espressione tra: Rum, Gin, Vodka, Whisky, Tequila, Mezcal, Brandy, Cognac, Aperitivo bitter, Bitter, Vermouth, Sherry, Liquore, Amaro, Analcolico, Mix.`,
    Genere: `Indica il genere/stile del cocktail "${name}". Rispondi con una sola parola tra: Sour, Highball, Stirred, Pestati, Frozen, Shakerato, Tiki, Build.`,
  };

  return prompts[campo] || `Scrivi un breve testo sul campo "${campo}" del cocktail "${name}", massimo 3 righe.`;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ errore: "Metodo non consentito" }) };
  }

  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ errore: "OPENAI_API_KEY non configurata" }) };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ errore: "JSON non valido" }) };
  }

  const { name, campo } = parsed;

  if (!name || typeof name !== "string" || !name.trim()) {
    return { statusCode: 400, body: JSON.stringify({ errore: "Nome cocktail mancante" }) };
  }

  if (!campo || typeof campo !== "string") {
    return { statusCode: 400, body: JSON.stringify({ errore: "Campo mancante" }) };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: buildPrompt(name.trim(), campo),
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const testo = data?.choices?.[0]?.message?.content || "Errore nella generazione del testo";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testo }),
    };
  } catch (error) {
    console.error("Errore API AI:", error);
    return { statusCode: 500, body: JSON.stringify({ errore: "Errore server AI" }) };
  }
}
