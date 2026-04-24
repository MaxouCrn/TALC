import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

/**
 * Récupère l'utilisateur connecté côté serveur. Retourne null si
 * anonyme, Supabase pas configuré, ou erreur. Jointe avec le profil
 * pour display_name + avatar_url.
 *
 * À utiliser dans les server components (layout, page). Le JWT est
 * validé par supabase.auth.getUser() qui hit Supabase Auth.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? null,
      displayName:
        profile?.display_name ??
        (user.email ? user.email.split("@")[0] : "Membre"),
      avatarUrl: profile?.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}
