import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware global. Refresh la session Supabase à chaque requête pour
 * que les server components aient un user à jour via getUser().
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (assets)
     * - _next/image (optimisation images)
     * - favicon.ico, logo-talc.gif (statiques publics)
     * - fichiers avec extension (svg, png, jpg, css, js, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo-talc.gif|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?)$).*)",
  ],
};
