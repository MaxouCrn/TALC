"use client";

import { useEffect, useRef, useState } from "react";

const VIEWPORT = 280; // taille du cercle d'apercu (px)
const OUTPUT_SIZE = 512; // resolution finale carree (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const WEBP_QUALITY = 0.9;

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void> | void;
  saving: boolean;
};

/**
 * Modale de recadrage circulaire pour l'avatar.
 * - Image affichee en 'cover' sur un viewport carré (clip-path circle).
 * - Drag pointer pour panner, slider pour zoomer (1x à 3x).
 * - Au save : rendu canvas 512x512 webp, cercle applique uniquement en
 *   affichage côté client (border-radius) — le fichier stocke reste carre.
 */
export function AvatarCropperModal({ file, onCancel, onSave, saving }: Props) {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    createImageBitmap(file)
      .then((bm) => {
        if (!cancelled) setBitmap(bm);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger l'image.");
      });
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Empeche scroll page quand la modale est ouverte
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Contraintes : l'image doit toujours couvrir le viewport carre.
  function clampOffset(x: number, y: number, z: number) {
    if (!bitmap) return { x, y };
    const baseScale = VIEWPORT / Math.min(bitmap.width, bitmap.height);
    const dispW = bitmap.width * baseScale * z;
    const dispH = bitmap.height * baseScale * z;
    const maxX = Math.max(0, (dispW - VIEWPORT) / 2);
    const maxY = Math.max(0, (dispH - VIEWPORT) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!bitmap) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startOffset = offset;
    (e.target as Element).setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const nx = startOffset.x + (ev.clientX - startX);
      const ny = startOffset.y + (ev.clientY - startY);
      setOffset(clampOffset(nx, ny, zoom));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleZoom(z: number) {
    setZoom(z);
    setOffset((o) => clampOffset(o.x, o.y, z));
  }

  async function handleSave() {
    if (!bitmap) return;
    setError(null);
    try {
      const baseScale = VIEWPORT / Math.min(bitmap.width, bitmap.height);
      const dispW = bitmap.width * baseScale * zoom;
      const dispH = bitmap.height * baseScale * zoom;
      // Source crop en coord image native (avant baseScale*zoom)
      const srcW = VIEWPORT / (baseScale * zoom);
      const srcH = srcW;
      const srcX = (dispW / 2 - VIEWPORT / 2 - offset.x) / (baseScale * zoom);
      const srcY = (dispH / 2 - VIEWPORT / 2 - offset.y) / (baseScale * zoom);

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D non supporté");
      ctx.drawImage(
        bitmap,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
      });
      if (!blob) throw new Error("Export échoué");

      await onSave(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recadrage échoué.");
    }
  }

  const imgStyle: React.CSSProperties = bitmap
    ? (() => {
        const baseScale = VIEWPORT / Math.min(bitmap.width, bitmap.height);
        const w = bitmap.width * baseScale * zoom;
        const h = bitmap.height * baseScale * zoom;
        return {
          position: "absolute",
          width: `${w}px`,
          height: `${h}px`,
          left: `${VIEWPORT / 2 - w / 2 + offset.x}px`,
          top: `${VIEWPORT / 2 - h / 2 + offset.y}px`,
          userSelect: "none",
          pointerEvents: "none",
        };
      })()
    : {};

  return (
    <div className="avatar-modal-overlay" role="dialog" aria-modal="true">
      <div className="avatar-modal">
        <h2 className="avatar-modal-title">Recadrer la photo</h2>
        <p className="avatar-modal-sub">
          Glissez l&apos;image pour la positionner, zoomez avec le curseur.
        </p>
        <p className="avatar-modal-dims">
          Format recommandé · 512 × 512 px
        </p>

        <div
          className="avatar-cropper-viewport"
          style={{ width: VIEWPORT, height: VIEWPORT }}
          onPointerDown={handlePointerDown}
        >
          {previewUrl && bitmap ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" style={imgStyle} draggable={false} />
          ) : (
            <div className="avatar-cropper-loading">Chargement…</div>
          )}
          <div className="avatar-cropper-circle-mask" aria-hidden="true" />
        </div>

        <div className="avatar-cropper-slider">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M11 8v6M8 11h6" />
          </svg>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(Number(e.target.value))}
            disabled={!bitmap}
          />
        </div>

        {error ? (
          <p role="alert" className="avatar-modal-error">
            {error}
          </p>
        ) : null}

        <div className="avatar-modal-actions">
          <button
            type="button"
            className="profile-btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="button"
            className="profile-btn-save"
            onClick={handleSave}
            disabled={saving || !bitmap}
          >
            {saving ? "Upload…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
