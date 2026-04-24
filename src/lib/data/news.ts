import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { NEWS, type NewsItem } from "@/lib/mock-data";

/**
 * Slug de l'activité racine qui reçoit les posts officiels du bureau TALC.
 * Seede en migration 0004_seed_roles.sql.
 */
const ACTUALITES_SLUG = "actualites-officielles";

/**
 * Formatte une date ISO en "18 avril 2026".
 */
function formatDateFr(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Les posts n'ont pas de colonne `title` — la première ligne du body
 * sert de titre, le reste d'extrait. Si body mono-ligne, excerpt vide.
 */
function extractTitleAndExcerpt(body: string): { title: string; excerpt: string } {
  const trimmed = body.trim();
  const firstNewline = trimmed.indexOf("\n");
  if (firstNewline === -1) {
    return { title: trimmed, excerpt: "" };
  }
  return {
    title: trimmed.slice(0, firstNewline).trim(),
    excerpt: trimmed.slice(firstNewline + 1).trim(),
  };
}

/**
 * Retourne les N derniers posts publiés dans le scope "Actualités
 * officielles", mappés vers NewsItem. Fallback vers le mock si :
 * - Supabase pas configuré (env manquante)
 * - Scope pas trouvé (migration pas jouée)
 * - Zéro post publié (BDD encore vide)
 * - Erreur réseau / RLS
 */
export async function fetchLatestNews(limit = 3): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    return NEWS.slice(0, limit);
  }

  try {
    const supabase = await createClient();

    // 1. Résoudre l'id du scope racine depuis son slug.
    const { data: scope, error: scopeError } = await supabase
      .from("activities")
      .select("id, name")
      .eq("slug", ACTUALITES_SLUG)
      .maybeSingle();

    if (scopeError || !scope) {
      return NEWS.slice(0, limit);
    }

    // 2. Fetch les posts + leurs médias.
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        id,
        body,
        category,
        created_at,
        post_media (
          url,
          media_type,
          sort_order
        )
        `,
      )
      .eq("activity_scope_id", scope.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (postsError || !posts || posts.length === 0) {
      return NEWS.slice(0, limit);
    }

    // 3. Mapper vers NewsItem.
    return posts.map((p): NewsItem => {
      const { title, excerpt } = extractTitleAndExcerpt(p.body);

      // Première photo du post triée par sort_order = cover
      const cover = [...(p.post_media ?? [])]
        .filter((m) => m.media_type === "photo")
        .sort((a, b) => a.sort_order - b.sort_order)[0];

      return {
        id: p.id,
        title: title || "Sans titre",
        excerpt,
        category: p.category ?? scope.name,
        dateLabel: formatDateFr(p.created_at),
        coverUrl: cover?.url ?? "",
        href: `/actualites/${p.id}`,
      };
    });
  } catch (err) {
    console.error("fetchLatestNews: fallback to mock —", err);
    return NEWS.slice(0, limit);
  }
}
