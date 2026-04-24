import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero">
      <div className="flourish tl" />
      <div className="flourish tr" />
      <div className="flourish bl" />
      <div className="flourish br" />

      <div className="double-rule">
        <span />
        <span />
      </div>

      <div className="ornament">❦ ❧ ❦</div>

      <div className="eyebrow">
        Fondé en 1985 &nbsp;·&nbsp; Association Loi 1901
      </div>

      <div className="logo-wrap">
        <Image
          src="/logo-talc.gif"
          alt="Logo TALC — Tatinghem Arts Loisirs Culture"
          width={360}
          height={260}
          priority
          unoptimized
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <h1 className="title">
        Tatinghem <em>Arts</em>
        <br />
        Loisirs &amp; <em>Culture</em>
      </h1>

      <p className="subtitle">
        <span className="drop">D</span>epuis quarante années, le TALC réunit
        danseurs, peintres, comédiens et familles autour d&apos;un même
        feu&nbsp;: vivre ensemble, créer ensemble, se souvenir ensemble.
        Adhérez, suivez vos proches, conservez la mémoire des saisons.
      </p>

      <div className="cta-row">
        <a href="#" className="btn btn-primary">
          Rejoindre le Club
        </a>
        <a href="#" className="btn btn-ghost">
          Lire les actualités
        </a>
      </div>

      <div className="double-rule" style={{ marginTop: 60 }}>
        <span />
        <span />
      </div>
    </section>
  );
}
