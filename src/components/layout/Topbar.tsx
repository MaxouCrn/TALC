import Link from "next/link";

/**
 * Topbar — bandeau haut de page.
 *
 * Affiche la date courante, le prochain évènement mis en avant et un CTA
 * vers la billetterie (V2). En V1 les valeurs sont passées en props
 * directement ; à terme la prochaine actualité "evenement" sera résolue
 * côté serveur depuis Supabase.
 */

type NextEvent = {
  title: string;
  /** Ex : "samedi 14 juin 2026" */
  dateLabel: string;
  href: string;
};

export type TopbarProps = {
  /** Date formatée, ex : "Vendredi 24 avril 2026". Calcul côté serveur. */
  dateLabel?: string;
  nextEvent?: NextEvent;
  ticketHref?: string;
};

const DEFAULT_NEXT_EVENT: NextEvent = {
  title: "Gala de danse",
  dateLabel: "samedi 14 juin 2026",
  href: "#",
};

function formatTodayFr(): string {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function Topbar({
  dateLabel,
  nextEvent = DEFAULT_NEXT_EVENT,
  ticketHref = "#",
}: TopbarProps) {
  const resolvedDate = dateLabel ?? formatTodayFr();

  return (
    <div className="topbar anim-fade d1">
      <div className="date">{resolvedDate}</div>

      <Link href={nextEvent.href} className="next-event">
        <span className="label">Prochain évènement</span>
        <span className="title-evt">
          {nextEvent.title} &nbsp;·&nbsp; {nextEvent.dateLabel}
        </span>
      </Link>

      <Link href={ticketHref} className="topbar-cta">
        Billetterie &nbsp;→
      </Link>
    </div>
  );
}
