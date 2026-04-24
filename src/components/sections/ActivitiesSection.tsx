import Link from "next/link";
import { ACTIVITIES, type Activity } from "@/lib/mock-data";

function ActivityTile({ activity }: { activity: Activity }) {
  return (
    <Link href={`/activites/${activity.slug}`} className="activity">
      <figure className="activity-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activity.coverUrl} alt="" />
      </figure>
      <div className="activity-body">
        <span className="activity-plate">{activity.plate}</span>
        <h3 className="activity-name">{activity.name}</h3>
        <p className="activity-meta">{activity.meta}</p>
        <p className="activity-desc">{activity.description}</p>
        <span className="activity-cta">Découvrir →</span>
      </div>
    </Link>
  );
}

export default function ActivitiesSection() {
  return (
    <section className="activities">
      <header className="section-head">
        <div className="section-eyebrow">Le répertoire du club</div>
        <h2 className="section-title">
          Nos <em>activités</em>
        </h2>
        <div className="section-rule">
          <span />
          <span />
        </div>
        <p className="section-lede">
          Six disciplines, cinquante ateliers hebdomadaires, tous les âges
          confondus. Choisissez la vôtre&nbsp;— ou venez en découvrir plusieurs.
        </p>
      </header>

      <div className="activities-grid">
        {ACTIVITIES.map((a) => (
          <ActivityTile key={a.id} activity={a} />
        ))}
      </div>

      <div className="activities-footer">
        <Link href="/activites" className="all-activities">
          Toutes les activités &nbsp;→
        </Link>
      </div>
    </section>
  );
}
