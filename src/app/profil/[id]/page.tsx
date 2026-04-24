import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ProfileView } from "@/components/profile/ProfileView";

// Pas de cache statique : on veut toujours voir la derniere version publiee.
export const dynamic = "force-dynamic";

/**
 * /profil/[id] — profil public d'un membre du club.
 * Consultable par anyone, edition desactivee. Si l'utilisateur connecte
 * visite son propre profil via cette route, on lui montre tout de meme la
 * version publique (pas de boutons edit). Pour editer, il passe par /profil.
 */
export default async function ProfilPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, avatar_url, cover_url, cover_position_y, bio, tagline, created_at, deleted_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data || data.deleted_at) notFound();

  const displayName =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "Membre";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase();
  const memberSince = data.created_at
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(data.created_at))
    : "—";

  return (
    <ProfileView
      displayName={displayName}
      initials={initials}
      avatarUrl={data.avatar_url}
      coverUrl={data.cover_url}
      coverPositionY={data.cover_position_y ?? 50}
      tagline={data.tagline ?? ""}
      bio={data.bio ?? ""}
      memberSince={memberSince}
      activities=""
      canEdit={false}
    />
  );
}
