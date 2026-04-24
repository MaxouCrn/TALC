import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ProfileView } from "@/components/profile/ProfileView";

// Toujours re-fetch : évite un cache stale apres upload avatar/cover.
export const dynamic = "force-dynamic";

/**
 * /profil — profil public du membre connecté avec edition inline
 * (tagline + bio). Cover + avatar affichage seul pour l'instant,
 * upload ulterieur.
 */
export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  let createdAt: string | null = null;
  let bio = "";
  let tagline = "";
  let coverUrl: string | null = null;
  let coverPositionY = 50;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("created_at, bio, tagline, cover_url, cover_position_y")
      .eq("id", user.id)
      .maybeSingle<{
        created_at: string;
        bio: string | null;
        tagline: string | null;
        cover_url: string | null;
        cover_position_y: number | null;
      }>();
    createdAt = data?.created_at ?? null;
    bio = data?.bio ?? "";
    tagline = data?.tagline ?? "";
    coverUrl = data?.cover_url ?? null;
    coverPositionY = data?.cover_position_y ?? 50;
  }

  const initials = user.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase();

  const memberSince = createdAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(createdAt))
    : "—";

  return (
    <ProfileView
      displayName={user.displayName}
      initials={initials}
      avatarUrl={user.avatarUrl}
      coverUrl={coverUrl}
      coverPositionY={coverPositionY}
      tagline={tagline}
      bio={bio}
      memberSince={memberSince}
      activities=""
      canEdit
    />
  );
}
