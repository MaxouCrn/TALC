export default function PracticalSection() {
  return (
    <section className="practical">
      <header className="section-head">
        <div className="section-eyebrow">Nous trouver</div>
        <h2 className="section-title">
          Infos <em>pratiques</em>
        </h2>
        <div className="section-rule">
          <span />
          <span />
        </div>
      </header>

      <div className="practical-grid">
        <div className="practical-info">
          <div className="info-block">
            <div className="info-head">
              <IconPin />
              <h3>Adresse</h3>
            </div>
            <p className="info-body">
              Complexe Sportif Polyvalent Gilbert Liévin
              <br />
              176 route de Boulogne
              <br />
              62500 Saint-Martin-lez-Tatinghem
            </p>
            <a
              href="https://maps.app.goo.gl/ozZgqS5MrZRsmqRi8"
              target="_blank"
              rel="noopener noreferrer"
              className="info-link"
            >
              Itinéraire →
            </a>
          </div>

          <div className="info-block">
            <div className="info-head">
              <IconClock />
              <h3>Permanences du bureau</h3>
            </div>
            <dl className="info-hours">
              <dt>Mercredi</dt>
              <dd>17h — 19h</dd>
              <dt>Samedi</dt>
              <dd>10h — 12h</dd>
              <dt>Vacances scolaires</dt>
              <dd>Sur rendez-vous</dd>
            </dl>
            <p className="info-note">
              Les horaires des <em>ateliers</em> sont propres à chaque activité.
            </p>
          </div>

          <div className="info-block">
            <div className="info-head">
              <IconPhone />
              <h3>Nous joindre</h3>
            </div>
            <p className="info-body">
              <a href="tel:+33321000000" className="info-inline">
                03&nbsp;21&nbsp;00&nbsp;00&nbsp;00
              </a>
              <br />
              <a href="mailto:contact@le-talc.fr" className="info-inline">
                contact@le-talc.fr
              </a>
            </p>
            <a href="#" className="info-link">
              Formulaire de contact →
            </a>
          </div>
        </div>

        <aside className="practical-map">
          <div className="map-frame">
            <iframe
              className="map-iframe"
              src="https://www.google.com/maps?q=50.7451014,2.2074231&z=17&output=embed"
              title="Carte — Complexe Sportif Polyvalent Gilbert Liévin"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-compass" aria-hidden="true">
              <Compass />
            </div>
          </div>
          <figcaption className="map-caption">
            «&nbsp;À deux pas de la mairie et de l&apos;église
            Saint-Pierre.&nbsp;»
          </figcaption>
        </aside>
      </div>
    </section>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.6-3.1 19.8 19.8 0 0 1-6-6A20 20 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
function Compass() {
  return (
    <svg viewBox="0 0 80 80" width={56} height={56}>
      <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth={1} />
      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth={0.6} strokeDasharray="2 4" />
      <polygon points="40,8 46,40 40,36 34,40" fill="currentColor" />
      <polygon points="40,72 34,40 40,44 46,40" fill="none" stroke="currentColor" strokeWidth={1} />
      <text x="40" y="14" textAnchor="middle" fontFamily="var(--font-display)" fontSize={10} fill="currentColor">
        N
      </text>
    </svg>
  );
}
