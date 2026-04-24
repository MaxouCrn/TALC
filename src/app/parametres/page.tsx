import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/current-user";

/**
 * /parametres — paramètres du compte.
 *
 * V1 placeholder. Section à remplir dans V1.5 avec : changement de
 * mot de passe, préférences de notifications, suppression du compte
 * (RGPD), gestion des sessions actives.
 */
export default async function ParametresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  return (
    <main className="account-page">
      <header className="account-head">
        <div className="account-eyebrow">Mon espace</div>
        <h1 className="account-title">
          Mes <em>paramètres</em>
        </h1>
        <p className="account-sub">
          Gérez votre compte, votre mot de passe et vos préférences.
        </p>
      </header>

      <section className="account-card">
        <div className="account-placeholder">
          <div className="account-placeholder-badge">Bientôt disponible</div>
          <p>
            Changement de mot de passe, préférences de notifications et
            suppression du compte arrivent prochainement.
          </p>
        </div>
      </section>
    </main>
  );
}
