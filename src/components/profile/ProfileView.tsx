"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateProfile, updateCover, updateAvatar } from "@/app/profil/actions";
import { compressCoverImage } from "@/lib/image/compress-cover";
import { AvatarCropperModal } from "./AvatarCropperModal";

const TAGLINE_MAX = 100;
const BIO_MAX = 600;
const COVER_HINT_DIMS = "2400 × 400 px";

type Props = {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  coverPositionY: number;
  tagline: string;
  bio: string;
  memberSince: string;
  activities: string;
  canEdit: boolean;
};

export function ProfileView({
  displayName,
  initials,
  avatarUrl,
  coverUrl: initialCoverUrl,
  coverPositionY: initialPositionY,
  tagline: initialTagline,
  bio: initialBio,
  memberSince,
  activities,
  canEdit,
}: Props) {
  const [tagline, setTagline] = useState(initialTagline);
  const [bio, setBio] = useState(initialBio);
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState({ tagline: initialTagline, bio: initialBio });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const taglineRef = useRef<HTMLTextAreaElement>(null);

  // Cover state : url rendue + draft pendant l'edition
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [coverPositionY, setCoverPositionY] = useState(initialPositionY);
  const [coverDraft, setCoverDraft] = useState<{
    blob: Blob;
    previewUrl: string;
  } | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  // Avatar state
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      document.body.classList.add("is-editing");
      taglineRef.current?.focus();
    } else {
      document.body.classList.remove("is-editing");
    }
    return () => {
      document.body.classList.remove("is-editing");
    };
  }, [editing]);

  // Cleanup object URL au unmount ou changement de draft
  useEffect(() => {
    return () => {
      if (coverDraft?.previewUrl) URL.revokeObjectURL(coverDraft.previewUrl);
    };
  }, [coverDraft]);

  function handleEdit() {
    setSnapshot({ tagline, bio });
    setError(null);
    setEditing(true);
  }
  function handleCancelProfile() {
    setTagline(snapshot.tagline);
    setBio(snapshot.bio);
    setError(null);
    setEditing(false);
  }
  function handleSaveProfile() {
    setError(null);
    startTransition(async () => {
      const res = await updateProfile({ tagline, bio });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(false);
    });
  }

  // ---- Cover edit ----
  function handleOpenFilePicker() {
    setCoverError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset pour permettre le meme fichier à nouveau
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverError("Format d'image non supporté.");
      return;
    }
    try {
      const blob = await compressCoverImage(file);
      const previewUrl = URL.createObjectURL(blob);
      setCoverDraft({ blob, previewUrl });
      setCoverPositionY(50);
      setCoverError(null);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Compression échouée.");
    }
  }

  function handleCancelCover() {
    if (coverDraft?.previewUrl) URL.revokeObjectURL(coverDraft.previewUrl);
    setCoverDraft(null);
    setCoverPositionY(initialPositionY);
    setCoverError(null);
  }

  function handleSaveCover() {
    if (!coverDraft) return;
    setCoverError(null);
    setCoverUploading(true);
    (async () => {
      try {
        const fd = new FormData();
        fd.append(
          "file",
          new File([coverDraft.blob], "cover.webp", { type: "image/webp" })
        );
        fd.append("position_y", String(Math.round(coverPositionY)));
        const res = await updateCover(fd);
        if (!res.ok) {
          setCoverError(res.error);
          return;
        }
        URL.revokeObjectURL(coverDraft.previewUrl);
        setCoverUrl(res.url);
        setCoverDraft(null);
      } finally {
        setCoverUploading(false);
      }
    })();
  }

  // ---- Avatar edit ----
  function handleOpenAvatarPicker() {
    avatarFileInputRef.current?.click();
  }
  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setAvatarFile(file);
  }
  async function handleAvatarSave(blob: Blob) {
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append(
        "file",
        new File([blob], "avatar.webp", { type: "image/webp" })
      );
      const res = await updateAvatar(fd);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setCurrentAvatarUrl(res.url);
      setAvatarFile(null);
    } finally {
      setAvatarUploading(false);
    }
  }
  function handleAvatarCancel() {
    setAvatarFile(null);
  }

  // Drag vertical pour ajuster cover_position_y pendant l'edit
  function handleCoverPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!coverDraft) return;
    const cover = coverRef.current;
    if (!cover) return;
    const startY = e.clientY;
    const startPos = coverPositionY;
    const height = cover.getBoundingClientRect().height;
    (e.target as Element).setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const deltaY = ev.clientY - startY;
      // drag bas → image descend (positionY diminue, on voit plus le haut)
      const deltaPct = (-deltaY / height) * 100;
      const next = Math.max(0, Math.min(100, startPos + deltaPct));
      setCoverPositionY(next);
    }
    function onUp(ev: PointerEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      (ev.target as Element).releasePointerCapture?.(ev.pointerId);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const taglineCountClass =
    "profile-char-counter" + (tagline.length >= TAGLINE_MAX ? " is-full" : "");
  const bioCountClass =
    "profile-char-counter" + (bio.length >= BIO_MAX ? " is-full" : "");

  const isCoverEditing = coverDraft !== null;
  const displayedCoverUrl = coverDraft?.previewUrl ?? coverUrl;

  return (
    <main className="profile-page">
      <div className="profile-frame">
        {/* Header : cover + bouton edit bannière */}
        <div className="profile-header">
          <div
            ref={coverRef}
            className={
              "profile-cover" + (isCoverEditing ? " is-editing-cover" : "")
            }
            onPointerDown={handleCoverPointerDown}
          >
            {displayedCoverUrl ? (
              <img
                src={displayedCoverUrl}
                alt=""
                style={{ objectPosition: `center ${coverPositionY}%` }}
                draggable={false}
              />
            ) : null}
          </div>

          {canEdit && !isCoverEditing ? (
            <button
              type="button"
              className="profile-cover-edit"
              aria-label="Changer la bannière"
              data-tooltip="Modifier la photo de couverture"
              onClick={handleOpenFilePicker}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Modifier</span>
            </button>
          ) : null}

          {isCoverEditing ? (
            <div className="profile-cover-actions">
              <button
                type="button"
                className="profile-cover-cancel"
                onClick={handleCancelCover}
                disabled={coverUploading}
              >
                Annuler
              </button>
              <button
                type="button"
                className="profile-cover-save"
                onClick={handleSaveCover}
                disabled={coverUploading}
              >
                {coverUploading ? "Upload…" : "Enregistrer"}
              </button>
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {isCoverEditing ? (
            <div className="profile-cover-hint-bubble" role="status">
              <span>Glissez verticalement pour ajuster</span>
              <span className="profile-cover-hint-bubble-sub">
                Format recommandé · {COVER_HINT_DIMS}
              </span>
            </div>
          ) : null}
        </div>

        {coverError ? (
          <p
            role="alert"
            style={{
              color: "var(--accent)",
              padding: "12px 32px 0",
              fontSize: 14,
            }}
          >
            {coverError}
          </p>
        ) : null}

        <div className="profile-body">
          {/* Identity : nom + tagline + bouton edit */}
          <div className="profile-identity">
            <div className="profile-name-row">
              <h1 className="profile-name">{displayName}</h1>
              {canEdit ? (
                <>
                  {!editing ? (
                    <button
                      type="button"
                      className="profile-edit-main"
                      onClick={handleEdit}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                      <span>Modifier le profil</span>
                    </button>
                  ) : (
                    <div
                      className="profile-edit-actions"
                      style={{ display: "inline-flex" }}
                    >
                      <button
                        type="button"
                        className="profile-btn-cancel"
                        onClick={handleCancelProfile}
                        disabled={isPending}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="profile-btn-save"
                        onClick={handleSaveProfile}
                        disabled={isPending}
                      >
                        {isPending ? "Enregistrement…" : "Enregistrer"}
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {!editing ? (
              <p className="profile-tagline">
                {tagline || <em>Aucune accroche renseignée.</em>}
              </p>
            ) : (
              <div style={{ position: "relative" }}>
                <textarea
                  ref={taglineRef}
                  className="profile-editable is-tagline"
                  style={{ display: "block" }}
                  rows={1}
                  maxLength={TAGLINE_MAX}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Une courte phrase d'accroche…"
                />
                <span className={taglineCountClass}>
                  {tagline.length} / {TAGLINE_MAX}
                </span>
              </div>
            )}

            {error ? (
              <p
                role="alert"
                style={{ color: "var(--accent)", marginTop: 12, fontSize: 14 }}
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="profile-divider" aria-hidden="true" />

          {/* Bio block : avatar à gauche + bio à droite */}
          <div className="profile-grid">
            <section className="profile-block profile-block--bio">
              <div className="profile-avatar-wrap">
                <div
                  className="profile-avatar"
                  style={
                    currentAvatarUrl
                      ? { backgroundImage: `url(${currentAvatarUrl})` }
                      : undefined
                  }
                >
                  {!currentAvatarUrl && initials}
                </div>
                {canEdit ? (
                  <>
                    <button
                      type="button"
                      className="profile-avatar-edit"
                      aria-label="Changer l'avatar"
                      data-tooltip="Modifier la photo de profil"
                      onClick={handleOpenAvatarPicker}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarFileChange}
                    />
                  </>
                ) : null}
              </div>
              <div className="profile-bio-content">
                <h3 className="profile-block-title">Bio</h3>
                {!editing ? (
                  <p className="profile-bio">
                    {bio || <em>Pas encore de bio.</em>}
                  </p>
                ) : (
                  <div style={{ position: "relative" }}>
                    <textarea
                      className="profile-editable is-bio"
                      style={{ display: "block" }}
                      rows={6}
                      maxLength={BIO_MAX}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Présentez-vous en quelques lignes…"
                    />
                    <span className={bioCountClass}>
                      {bio.length} / {BIO_MAX}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer strip : meta bas de frame */}
        <dl className="profile-footer-strip">
          <div>
            <dt>Membre depuis</dt>
            <dd>{memberSince}</dd>
          </div>
          <div>
            <dt>Activités suivies</dt>
            <dd>{activities || "—"}</dd>
          </div>
        </dl>
      </div>

      {avatarFile ? (
        <AvatarCropperModal
          file={avatarFile}
          onCancel={handleAvatarCancel}
          onSave={handleAvatarSave}
          saving={avatarUploading}
        />
      ) : null}
    </main>
  );
}
