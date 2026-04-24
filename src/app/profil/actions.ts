"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const COVER_BUCKET = "profile-covers";
const COVER_MAX_BYTES = 2 * 1024 * 1024; // 2 MB apres compression
const AVATAR_BUCKET = "profile-avatars";
const AVATAR_MAX_BYTES = 500 * 1024; // 500 KB apres compression (512x512 webp)

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string };

const TAGLINE_MAX = 100;
const BIO_MAX = 600;

export async function updateProfile(input: {
  tagline: string;
  bio: string;
}): Promise<UpdateProfileResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase non configuré." };
  }

  const tagline = input.tagline.trim();
  const bio = input.bio.trim();

  if (tagline.length > TAGLINE_MAX) {
    return { ok: false, error: `Tagline trop longue (max ${TAGLINE_MAX}).` };
  }
  if (bio.length > BIO_MAX) {
    return { ok: false, error: `Bio trop longue (max ${BIO_MAX}).` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Non authentifié." };

  const { error } = await supabase
    .from("users")
    .update({ tagline: tagline || null, bio: bio || null })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil");
  return { ok: true };
}

export type UpdateCoverResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Upload une bannière compressée (webp) dans le bucket profile-covers
 * et met à jour profiles.cover_url + cover_position_y.
 * Le fichier est écrasé à chaque upload (chemin `{user_id}/cover.webp`).
 */
export async function updateCover(formData: FormData): Promise<UpdateCoverResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase non configuré." };
  }

  const file = formData.get("file");
  const positionYRaw = formData.get("position_y");

  if (!(file instanceof File)) {
    return { ok: false, error: "Fichier manquant." };
  }
  if (file.size > COVER_MAX_BYTES) {
    return { ok: false, error: "Fichier trop lourd (> 2 Mo)." };
  }
  if (file.type !== "image/webp") {
    return { ok: false, error: "Format attendu : webp (compression client)." };
  }

  const parsed = positionYRaw != null ? Number(positionYRaw) : NaN;
  const positionY = Number.isFinite(parsed)
    ? Math.max(0, Math.min(100, Math.round(parsed)))
    : 50;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const path = `${user.id}/cover.webp`;
  const { error: uploadError } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/webp",
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);

  // Cache-bust : on ajoute updated_at pour forcer le refresh du <img>
  const url = `${publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("users")
    .update({ cover_url: url, cover_position_y: positionY })
    .eq("id", user.id);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath("/profil");
  return { ok: true, url };
}

export type UpdateAvatarResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Upload un avatar recadré (webp carré) dans le bucket profile-avatars
 * et met à jour profiles.avatar_url.
 */
export async function updateAvatar(formData: FormData): Promise<UpdateAvatarResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase non configuré." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Fichier manquant." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "Fichier trop lourd (> 500 Ko)." };
  }
  if (file.type !== "image/webp") {
    return { ok: false, error: "Format attendu : webp (compression client)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const path = `${user.id}/avatar.webp`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/webp",
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const url = `${publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath("/profil");
  return { ok: true, url };
}
