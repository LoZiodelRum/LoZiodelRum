import { translateText } from './translator';

export const LANGS = ['en', 'de', 'es', 'fr', 'bg'] as const;
export const FIELDS = [
  'titolo',
  'sottotitolo',
  'descrizione',
  'contenuto',
  'excerpt',
  'categoria',
  'seo_title',
  'seo_description',
] as const;

type Article = Record<string, any>;

type TranslationResult = {
  updates: Record<string, string>;
  skipped: string[];
  errors: { field: string; lang: string; error: string }[];
};

export async function translateArticle(article: Article): Promise<TranslationResult> {
  const updates: Record<string, string> = {};
  const skipped: string[] = [];
  const errors: { field: string; lang: string; error: string }[] = [];

  for (const lang of LANGS) {
    for (const field of FIELDS) {
      const key = `${field}_${lang}`;
      if (article[key] && article[key].trim() !== '') {
        skipped.push(key);
        continue;
      }
      // Sorgente: preferisci IT, fallback EN
      const source = article[field] || article[`${field}_en`];
      if (!source || source.trim() === '') {
        skipped.push(key);
        continue;
      }
      try {
        const translated = await translateText(source, lang);
        updates[key] = translated;
      } catch (error: any) {
        errors.push({ field, lang, error: error?.message || String(error) });
      }
    }
  }
  return { updates, skipped, errors };
}
