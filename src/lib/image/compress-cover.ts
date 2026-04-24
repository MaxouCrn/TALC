/**
 * Redimensionne + compresse une image de couverture côté client.
 * - Contrainte: ratio final libre, mais width max 2400px (downscale si plus)
 * - Sortie: webp qualité 0.85
 *
 * On garde l'aspect ratio natif de l'image source. Le recadrage 6:1 est
 * fait au rendu via CSS (aspect-ratio + object-fit: cover). L'utilisateur
 * ajuste la zone visible avec cover_position_y.
 */

const MAX_WIDTH = 2400;
const WEBP_QUALITY = 0.85;

export async function compressCoverImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D non supporté");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
  });
  if (!blob) throw new Error("Compression échouée");
  return blob;
}
