import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ACTIVITIES, type Activity } from "@/lib/mock-data";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Transforme un index 0-based en chiffre romain décoratif "№ I".
 * Utilisé comme `plate` sur les tuiles d'activité, cohérent avec le mock.
 */
function plateFor(index: number): string {
  return `№ ${ROMAN[index + 1] ?? String(index + 1)}`;
}

/**
 * Retourne les activités racines affichées sur la home. Exclut le scope
 * technique "actualites-officielles" (réservé aux posts officiels, pas une
 * activité visible). Trie par sort_order.
 *
 * Fallback sur ACTIVITIES mock si Supabase pas configuré, zéro activité
 * seedée, ou erreur.
 */
export async function fetchActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured()) {
    return ACTIVITIES;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("activities")
      .select("id, slug, name, description, cover_url, sort_order")
      .is("parent_id", null)
      .neq("slug", "actualites-officielles")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return ACTIVITIES;
    }

    return data.map((a, i): Activity => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description ?? "",
      // `meta` (ex: "Classique, modern'jazz · 4 créneaux") n'existe pas en
      // DB V1. À ajouter via colonne dédiée ou agregat children count plus
      // tard. Vide = caché naturellement par le CSS.
      meta: "",
      coverUrl: a.cover_url ?? "",
      plate: plateFor(i),
    }));
  } catch (err) {
    console.error("fetchActivities: fallback to mock —", err);
    return ACTIVITIES;
  }
}
