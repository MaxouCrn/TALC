import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { POSTS, type Post } from "@/lib/mock-data";

/**
 * Format relatif en français ("il y a 2 jours", "il y a 3 h", "à l'instant").
 * Au-delà de 7 jours, bascule sur une date absolue.
 */
function relativeTimeFr(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 7) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(new Date(iso));
  }
  if (days >= 1) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  if (hours >= 1) return `il y a ${hours} h`;
  if (minutes >= 1) return `il y a ${minutes} min`;
  return "à l'instant";
}

/**
 * Retourne les N derniers posts communautaires tous scopes confondus, sauf
 * "actualites-officielles" (affichées via fetchLatestNews). Joint scope +
 * media + compteurs reactions/comments, puis hydrate le profil auteur en
 * 2ᵉ query (pas de FK direct posts.author_id → profiles.id, V1 choisit de
 * pas dupliquer la FK). Fallback POSTS mock si erreur ou vide.
 */
export async function fetchLatestPosts(limit = 3): Promise<Post[]> {
  if (!isSupabaseConfigured()) {
    return POSTS.slice(0, limit);
  }

  try {
    const supabase = await createClient();

    // 1. Résoudre le scope technique à exclure.
    const { data: actualites } = await supabase
      .from("activities")
      .select("id")
      .eq("slug", "actualites-officielles")
      .maybeSingle();

    // 2. Query posts principale.
    let query = supabase
      .from("posts")
      .select(
        `
        id,
        body,
        author_id,
        created_at,
        scope:activities!posts_activity_scope_id_fkey (id, slug, name),
        post_media (url, media_type, sort_order),
        reactions (count),
        comments (count)
        `,
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (actualites) {
      query = query.neq("activity_scope_id", actualites.id);
    }

    const { data: posts, error } = await query;

    if (error || !posts || posts.length === 0) {
      return POSTS.slice(0, limit);
    }

    // 3. Hydrate les profils en une query groupée.
    const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", authorIds);
    const profileMap = new Map(profiles?.map((pr) => [pr.id, pr]) ?? []);

    // 4. Mapper vers Post.
    return posts.map((p): Post => {
      const cover = [...(p.post_media ?? [])]
        .filter((m) => m.media_type === "photo")
        .sort((a, b) => a.sort_order - b.sort_order)[0];

      const profile = profileMap.get(p.author_id);
      const scope = Array.isArray(p.scope) ? p.scope[0] : p.scope;

      return {
        id: p.id,
        author: {
          displayName: profile?.display_name ?? "Anonyme",
          avatarUrl: profile?.avatar_url ?? "",
        },
        scope: {
          name: scope?.name ?? "",
          slug: scope?.slug ?? "",
        },
        timeLabel: relativeTimeFr(p.created_at),
        mediaUrl: cover?.url ?? "",
        caption: p.body,
        // Supabase renvoie les aggregats sous forme [{ count: N }]
        reactionsCount: (p.reactions as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
        commentsCount: (p.comments as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
      };
    });
  } catch (err) {
    console.error("fetchLatestPosts: fallback to mock —", err);
    return POSTS.slice(0, limit);
  }
}
