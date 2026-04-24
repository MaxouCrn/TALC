"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Nav — masthead sticky.
 *
 * Client component car surveille sa propre position via IntersectionObserver
 * pour basculer entre l'état "normal" (fond papier plein) et "stuck"
 * (fond semi-transparent + backdrop-blur + shadow) quand elle colle au
 * haut de la viewport.
 */

type NavLink = {
  label: string;
  href: string;
  /** Mis en avant (rouge + semi-bold) pour les CTAs type "Se connecter". */
  cta?: boolean;
};

const LINKS: NavLink[] = [
  { label: "Le Club",    href: "#" },
  { label: "Activités",  href: "#" },
  { label: "Actualités", href: "#" },
  { label: "Feed",       href: "#" },
  { label: "Contact",    href: "#" },
  { label: "Se connecter / S'inscrire", href: "/auth", cta: true },
];

export default function Nav() {
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
            <Link
              href={link.href}
              className={link.cta ? "nav-cta" : undefined}
            >
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
    </>
  );
}
