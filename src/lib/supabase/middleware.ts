import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Refresh de session à chaque requête.
 *
 * Appelé depuis src/middleware.ts. Lit les cookies entrants, refresh
 * le token auprès de Supabase si besoin, et repose les cookies mis à
 * jour sur la réponse sortante.
 *
 * Si Supabase n'est pas configuré (env manquante), on no-op — permet
 * à l'app de tourner en dev sans dépendance dure.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Déclenche le refresh si le JWT est expiré. Ne pas retirer —
  // sinon les server components voient une session obsolète.
  await supabase.auth.getUser();

  return response;
}
