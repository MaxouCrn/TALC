import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * /profil — vue des infos du membre connecté.
 *
 * V1 en lecture seule. Édition inline (changer avatar, nom, bio) à
 * faire dans une V1.5 via server actions.
 */
export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  let createdAt: string | null = null;
  let bio: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("created_at, bio")
      .eq("id", user.id)
      .maybeSingle();
    createdAt = data?.created_at ?? null;
    bio = data?.bio ?? null;
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
    <main className="account-page">
      <header className="account-head">
        <div className="account-eyebrow">Mon espace</div>
        <h1 className="account-title">
          Mon <em>profil</em>
        </h1>
        <p className="account-sub">
          Les informations publiques qui apparaissent à côté de vos
          commentaires et réactions.
        </p>
      </header>

      <section className="account-card">
        <div className="account-identity">
          <div
            className="account-avatar"
            style={
              user.avatarUrl
                ? { backgroundImage: `url(${user.avatarUrl})` }
                : undefined
            }
          >
            {!user.avatarUrl && initials}
          </div>
          <div className="account-identity-text">
            <div className="account-name">{user.displayName}</div>
            <div className="account-email">{user.email ?? "email non renseigné"}</div>
          </div>
        </div>

        <dl className="account-meta">
          <dt>Membre depuis</dt>
          <dd>{memberSince}</dd>

          <dt>Rôle</dt>
          <dd>Membre du site</dd>

          <dt>Bio</dt>
          <dd>{bio || <em>Pas encore renseignée.</em>}</dd>
        </dl>
      </section>
    </main>
  );
}
