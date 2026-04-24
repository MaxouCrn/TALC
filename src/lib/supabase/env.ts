/**
 * Variables d'environnement Supabase.
 *
 * En V1 l'app reste fonctionnelle sans Supabase : si les clés ne sont
 * pas définies, les helpers Supabase retournent null et les composants
 * tombent en fallback sur les données mock (src/lib/mock-data.ts).
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Lance une erreur explicite si l'env manque. À appeler uniquement dans
 * les code paths qui *exigent* Supabase (création de compte, insert post…).
 * Les reads peuvent utiliser isSupabaseConfigured() pour fallback doux.
 */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env manquante : NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local.",
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
