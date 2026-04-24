import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * Client Supabase pour les server components et route handlers.
 *
 * Utilisation dans un RSC :
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("posts").select("*");
 *
 * Les cookies sont lus depuis la requête en cours via next/headers.
 * Le setAll est no-op côté RSC (cookies en lecture seule) — la session
 * est refresh via le middleware, pas ici.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignoré : setAll appelé depuis un RSC (read-only). Le refresh
          // de session se fait dans le middleware.
        }
      },
    },
  });
}
