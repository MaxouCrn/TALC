"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/data/current-user";

export default function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Click-outside + Escape → fermer
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleSignOut() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const initials = user.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="user-avatar"
          style={
            user.avatarUrl
              ? { backgroundImage: `url(${user.avatarUrl})` }
              : undefined
          }
        >
          {!user.avatarUrl && initials}
        </span>
        <span className="user-name">{user.displayName}</span>
        <svg
          viewBox="0 0 24 24"
          width={12}
          height={12}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`user-caret${open ? " is-open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          <Link
            href="/profil"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          <Link
            href="/parametres"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Paramètres
          </Link>
          <div className="user-menu-sep" />
          <button
            type="button"
            className="user-menu-item user-menu-danger"
            role="menuitem"
            onClick={handleSignOut}
            disabled={busy}
          >
            {busy ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      )}
    </div>
  );
}
