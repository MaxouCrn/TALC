"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import UserMenu from "@/components/layout/UserMenu";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/data/current-user";

type NavLink = { label: string; href: string };

const LINKS: NavLink[] = [
  { label: "Accueil",    href: "/" },
  { label: "Le Club",    href: "#" },
  { label: "Activités",  href: "#" },
  { label: "Actualités", href: "#" },
  { label: "Feed",       href: "#" },
  { label: "Contact",    href: "#" },
];

export default function Nav({ user }: { user: CurrentUser | null }) {
  const navRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    const sentinel = sentinelRef.current;
    if (!nav || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.classList.toggle("is-stuck", !entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.classList.add("nav-drawer-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("nav-drawer-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
      <nav ref={navRef} className="masthead-nav anim-fade d2">
        {/* Mobile : burger gauche */}
        <button
          type="button"
          className="nav-burger"
          aria-label="Ouvrir le menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <span /><span /><span />
        </button>

        {/* Mobile : titre centré */}
        <Link href="/" className="nav-brand-mobile">TALC</Link>

        {/* Desktop : liens centrés */}
        <div className="nav-links">
          {LINKS.map((link, i) => (
            <span key={link.href + link.label} style={{ display: "contents" }}>
              {i > 0 && <span className="sep">·</span>}
              <Link href={link.href}>{link.label}</Link>
            </span>
          ))}
        </div>

        {/* Desktop : auth slot absolu droite */}
        <div className="nav-auth">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/auth" className="nav-cta">
              Se connecter / S&apos;inscrire
            </Link>
          )}
        </div>
      </nav>

      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*                              Drawer                                 */
/* ------------------------------------------------------------------ */

function NavDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: CurrentUser | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      onClose();
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const initials = user
    ? user.displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s.charAt(0))
        .join("")
        .toUpperCase()
    : "";

  return (
    <div className="nav-drawer" hidden={!open}>
      <div
        className="nav-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="nav-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
      >
        <button
          type="button"
          className="nav-drawer-close"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          ×
        </button>

        {user && (
          <div className="nav-drawer-user">
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
            <div className="nav-drawer-user-meta">
              <span className="nav-drawer-user-name">{user.displayName}</span>
              <Link
                href="/profil"
                className="nav-drawer-user-link"
                onClick={onClose}
              >
                Mon profil
              </Link>
            </div>
          </div>
        )}

        <ul className="nav-drawer-list">
          {LINKS.map((link) => (
            <li key={link.href + link.label}>
              <Link href={link.href} onClick={onClose}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-drawer-footer">
          {user ? (
            <>
              <Link
                href="/parametres"
                className="nav-drawer-secondary"
                onClick={onClose}
              >
                Paramètres
              </Link>
              <button
                type="button"
                className="nav-drawer-secondary nav-drawer-danger"
                onClick={handleSignOut}
                disabled={busy}
              >
                {busy ? "Déconnexion…" : "Se déconnecter"}
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="nav-drawer-cta"
              onClick={onClose}
            >
              Se connecter / S&apos;inscrire
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
