import fetch from 'node-fetch';

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const API_KEY = process.env.DEEPL_API_KEY;

// Modular: puoi sostituire questa funzione per usare Google, OpenAI, ecc.
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!API_KEY) throw new Error('DEEPL_API_KEY non impostata nelle variabili ambiente');
  const params = new URLSearchParams();
  params.append('auth_key', API_KEY);
  params.append('text', text);
  params.append('target_lang', targetLang.toUpperCase());
  params.append('tag_handling', 'html');

  const res = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`DeepL API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!data.translations || !data.translations[0] || !data.translations[0].text) {
    throw new Error('Traduzione non ricevuta da DeepL');
  }
  return data.translations[0].text;
}
