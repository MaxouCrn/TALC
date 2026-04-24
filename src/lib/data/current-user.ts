import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CurrentUser = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
};

/**
 * Récupère l'utilisateur connecté côté serveur. Retourne null si
 * anonyme, Supabase pas configuré, ou erreur. Jointe avec public.users
 * pour first_name + last_name + avatar_url.
 *
 * displayName est composé à partir de first_name + last_name.
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
      .from("users")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";
    const displayName =
      `${firstName} ${lastName}`.trim() ||
      (user.email ? user.email.split("@")[0] : "Membre");

    return {
      id: user.id,
      email: user.email ?? null,
      firstName,
      lastName,
      displayName,
      avatarUrl: profile?.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}
