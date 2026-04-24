"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import UserMenu from "@/components/layout/UserMenu";
import type { CurrentUser } from "@/lib/data/current-user";

/**
 * Nav — masthead sticky, conscient de l'authentification.
 *
 * Client component car surveille sa propre position via IntersectionObserver
 * pour basculer entre l'état "normal" et "stuck". Reçoit l'utilisateur via
 * prop depuis le layout (server component) qui fait la query Supabase.
 */

type NavLink = { label: string; href: string };

const LINKS: NavLink[] = [
  { label: "Le Club",    href: "#" },
  { label: "Activités",  href: "#" },
  { label: "Actualités", href: "#" },
  { label: "Feed",       href: "#" },
  { label: "Contact",    href: "#" },
];

export default function Nav({ user }: { user: CurrentUser | null }) {
  const navRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
      <nav ref={navRef} className="masthead-nav anim-fade d2">
        {LINKS.map((link, i) => (
          <span key={link.href + link.label} style={{ display: "contents" }}>
            {i > 0 && <span className="sep">·</span>}
            <Link href={link.href}>{link.label}</Link>
          </span>
        ))}

        <span className="sep">·</span>

        {user ? (
          <UserMenu user={user} />
        ) : (
          <Link href="/auth" className="nav-cta">
            Se connecter / S&apos;inscrire
          </Link>
        )}
      </nav>
    </>
  );
}
