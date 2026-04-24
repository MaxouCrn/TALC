import Image from "next/image";
import Link from "next/link";

type FooterCol = { title: string; links: { label: string; href: string }[] };

const COLS: FooterCol[] = [
  {
    title: "Le Club",
    links: [
      { label: "Notre histoire", href: "/histoire" },
      { label: "Le bureau",      href: "/bureau" },
      { label: "Adhésion",       href: "/adhesion" },
      { label: "Charte",         href: "/charte" },
    ],
  },
  {
    title: "Activités",
    links: [
      { label: "Danse",            href: "/activites/danse" },
      { label: "Peinture",         href: "/activites/peinture" },
      { label: "Théâtre",          href: "/activites/theatre" },
      { label: "Musique",          href: "/activites/musique" },
      { label: "Écriture",         href: "/activites/ecriture" },
      { label: "Jeux de société",  href: "/activites/jeux" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Actualités",       href: "/actualites" },
      { label: "Feed",             href: "/feed" },
      { label: "Créer un compte",  href: "/inscription" },
      { label: "Se connecter",     href: "/connexion" },
      { label: "Contact",          href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-ornament" aria-hidden="true">
        ❦ ❧ ❦
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <Image
              src="/logo-talc.gif"
              alt="Logo TALC"
              width={140}
              height={100}
              unoptimized
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <p className="footer-tagline">
            <em>Tatinghem Arts Loisirs Culture</em>
            <br />
            Association Loi 1901 &nbsp;·&nbsp; Fondée en 1985
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" className="social"><IconFacebook /></a>
            <a href="#" aria-label="Instagram" className="social"><IconInstagram /></a>
            <a href="#" aria-label="YouTube" className="social"><IconYouTube /></a>
          </div>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} className="footer-nav">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          © {new Date().getFullYear()} TALC &nbsp;·&nbsp; Tatinghem Arts Loisirs Culture
        </div>
        <div className="legal">
          <Link href="/mentions-legales">Mentions légales</Link>
          <span>·</span>
          <Link href="/rgpd">RGPD</Link>
          <span>·</span>
          <Link href="/charte">Charte photo</Link>
          <span>·</span>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M13.4 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1A23 23 0 0 0 14 4c-2.7 0-4.5 1.6-4.5 4.6v2H7v3.2h2.5V22h3.9z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M23 7.2a2.8 2.8 0 0 0-2-2C19.3 5 12 5 12 5s-7.3 0-9 .3a2.8 2.8 0 0 0-2 2A29 29 0 0 0 .8 12 29 29 0 0 0 1 16.8a2.8 2.8 0 0 0 2 2c1.7.3 9 .3 9 .3s7.3 0 9-.3a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23.2 12 29 29 0 0 0 23 7.2zM9.8 15.4V8.6l6 3.4z" />
    </svg>
  );
}
