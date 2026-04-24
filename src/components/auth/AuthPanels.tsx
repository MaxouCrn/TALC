"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * AuthPanels — formulaires connexion + inscription avec toggle.
 *
 * Toute la logique interactive de la page /auth :
 * - Swap panel signin <-> signup + élargit le wrap en mode signup
 * - Toggle visibilité password (œil SVG)
 * - Checklist live contraintes mot de passe
 * - Vérif match password / confirm
 * - Validation format email sur blur
 * - Submit vers Supabase Auth (signInWithPassword / signUp)
 * - Redirect vers / en cas de succès
 */

type Mode = "signin" | "signup";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthPanels({ initialMode = "signin" as Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  /* ----------------------------- signin state ----------------------------- */
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siRemember, setSiRemember] = useState(true);
  const [siEmailErr, setSiEmailErr] = useState(false);
  const [siPwdVisible, setSiPwdVisible] = useState(false);

  /* ----------------------------- signup state ----------------------------- */
  const [suFirstName, setSuFirstName] = useState("");
  const [suLastName, setSuLastName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suPasswordConfirm, setSuPasswordConfirm] = useState("");
  const [suCharte, setSuCharte] = useState(false);
  const [suEmailErr, setSuEmailErr] = useState(false);
  const [suPwdVisible, setSuPwdVisible] = useState(false);
  const [suPwdConfirmVisible, setSuPwdConfirmVisible] = useState(false);

  /* --------------------------- dérivés checklist -------------------------- */
  const pwdRules = useMemo(
    () => ({
      len: suPassword.length >= 8,
      digit: /\d/.test(suPassword),
      special: /[^A-Za-z0-9]/.test(suPassword),
    }),
    [suPassword],
  );
  const pwdAllOk = pwdRules.len && pwdRules.digit && pwdRules.special;
  const pwdMatch = suPasswordConfirm.length > 0 && suPasswordConfirm === suPassword;

  /* ------------------------------- handlers ------------------------------- */
  function handleSwitch(next: Mode) {
    setMode(next);
    setAlert(null);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);
    if (!EMAIL_REGEX.test(siEmail)) {
      setSiEmailErr(true);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: siEmail,
        password: siPassword,
      });
      if (error) {
        setAlert({ kind: "error", text: "Identifiants incorrects." });
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setAlert({ kind: "error", text: "Impossible de se connecter. Réessayez." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);
    if (!EMAIL_REGEX.test(suEmail)) {
      setSuEmailErr(true);
      return;
    }
    if (!pwdAllOk) {
      setAlert({ kind: "error", text: "Le mot de passe ne respecte pas tous les critères." });
      return;
    }
    if (!pwdMatch) {
      setAlert({ kind: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (!suCharte) {
      setAlert({ kind: "error", text: "Merci d'accepter la charte de la communauté." });
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: suEmail,
        password: suPassword,
        options: {
          data: {
            first_name: suFirstName.trim(),
            last_name: suLastName.trim(),
          },
        },
      });
      if (error) {
        setAlert({ kind: "error", text: error.message });
        return;
      }
      setAlert({
        kind: "success",
        text: "Compte créé. Vérifiez votre email pour confirmer l'inscription.",
      });
    } catch {
      setAlert({ kind: "error", text: "Impossible de créer le compte. Réessayez." });
    } finally {
      setBusy(false);
    }
  }

  /* --------------------------------- JSX --------------------------------- */
  return (
    <>
      <div className="auth-deco auth-deco--dance" aria-hidden="true">
        <Image src="/dance.png" alt="" width={700} height={1000} priority unoptimized style={{ height: "100%", width: "auto" }} />
      </div>
      <div className="auth-deco auth-deco--yoga" aria-hidden="true">
        <Image src="/yoga.png" alt="" width={700} height={1000} unoptimized style={{ height: "100%", width: "auto" }} />
      </div>

      <div className={`auth-wrap${mode === "signup" ? " is-wide" : ""}`}>
        <header className="auth-masthead">
          <h1>
            Bienvenue au <em>TALC</em>
          </h1>
          <p>
            Connectez-vous pour commenter, réagir et suivre les activités des
            adhérents de l&apos;association.
          </p>
        </header>

        <section className="auth-card">
          {alert && (
            <div className={`form-alert${alert.kind === "success" ? " is-success" : ""}`}>
              {alert.text}
            </div>
          )}

          {/* ============ SIGNIN ============ */}
          <div className={`auth-panel${mode === "signin" ? " is-active" : ""}`}>
            <header className="auth-head">
              <div className="auth-eyebrow">Déjà membre</div>
              <h2 className="auth-title">
                Se <em>connecter</em>
              </h2>
              <p className="auth-sub">Content de vous revoir parmi nous.</p>
            </header>

            <form onSubmit={handleSignIn}>
              <div className={`form-field${siEmailErr ? " has-error" : ""}`}>
                <label className="form-label" htmlFor="signin-email">Adresse email</label>
                <input
                  className="form-input"
                  type="email"
                  id="signin-email"
                  autoComplete="email"
                  value={siEmail}
                  onChange={(e) => {
                    setSiEmail(e.target.value);
                    if (siEmailErr && EMAIL_REGEX.test(e.target.value)) setSiEmailErr(false);
                  }}
                  onBlur={() => setSiEmailErr(siEmail.length > 0 && !EMAIL_REGEX.test(siEmail))}
                  placeholder="vous@exemple.fr"
                />
                {siEmailErr && <span className="form-error">Cet email n&apos;est pas valide.</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="signin-password">Mot de passe</label>
                <div className="password-wrap">
                  <input
                    className="form-input"
                    type={siPwdVisible ? "text" : "password"}
                    id="signin-password"
                    autoComplete="current-password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <EyeToggle visible={siPwdVisible} onClick={() => setSiPwdVisible((v) => !v)} />
                </div>
              </div>

              <div className="form-row between">
                <label className="form-check">
                  <input type="checkbox" checked={siRemember} onChange={(e) => setSiRemember(e.target.checked)} />
                  <span>Se souvenir de moi</span>
                </label>
                <Link href="/mot-de-passe-oublie" className="form-link">
                  Mot de passe oublié&nbsp;?
                </Link>
              </div>

              <button type="submit" className="form-submit" disabled={busy}>
                {busy ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            <div className="auth-switch">
              <div className="auth-switch-label">Pas encore de compte&nbsp;?</div>
              <button type="button" className="auth-switch-btn" onClick={() => handleSwitch("signup")}>
                Créer un compte
              </button>
            </div>
          </div>

          {/* ============ SIGNUP ============ */}
          <div className={`auth-panel${mode === "signup" ? " is-active" : ""}`}>
            <header className="auth-head">
              <div className="auth-eyebrow">Nouveau membre</div>
              <h2 className="auth-title">
                Créer un <em>compte</em>
              </h2>
              <p className="auth-sub">Gratuit, trente secondes chrono.</p>
            </header>

            <form onSubmit={handleSignUp}>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label" htmlFor="signup-firstname">
                    Prénom <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="signup-firstname"
                    autoComplete="given-name"
                    value={suFirstName}
                    onChange={(e) => setSuFirstName(e.target.value)}
                    placeholder="Marie"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="signup-lastname">
                    Nom <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="signup-lastname"
                    autoComplete="family-name"
                    value={suLastName}
                    onChange={(e) => setSuLastName(e.target.value)}
                    placeholder="Dubois"
                  />
                </div>

                <div className={`form-field full${suEmailErr ? " has-error" : ""}`}>
                  <label className="form-label" htmlFor="signup-email">
                    Adresse email <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    id="signup-email"
                    autoComplete="email"
                    value={suEmail}
                    onChange={(e) => {
                      setSuEmail(e.target.value);
                      if (suEmailErr && EMAIL_REGEX.test(e.target.value)) setSuEmailErr(false);
                    }}
                    onBlur={() => setSuEmailErr(suEmail.length > 0 && !EMAIL_REGEX.test(suEmail))}
                    placeholder="vous@exemple.fr"
                  />
                  {suEmailErr && <span className="form-error">Cet email n&apos;est pas valide.</span>}
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="signup-password">
                    Mot de passe <span className="req">*</span>
                  </label>
                  <div className="password-wrap">
                    <input
                      className="form-input"
                      type={suPwdVisible ? "text" : "password"}
                      id="signup-password"
                      autoComplete="new-password"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <EyeToggle visible={suPwdVisible} onClick={() => setSuPwdVisible((v) => !v)} />
                  </div>
                  <ul className={`password-check${suPassword.length > 0 ? " is-visible" : ""}`}>
                    <li className={pwdRules.len ? "ok" : ""}>Au moins 8 caractères</li>
                    <li className={pwdRules.digit ? "ok" : ""}>Au moins un chiffre</li>
                    <li className={pwdRules.special ? "ok" : ""}>
                      Au moins un caractère spécial (ex&nbsp;: !&nbsp;?&nbsp;@&nbsp;#&nbsp;&amp;&nbsp;*)
                    </li>
                  </ul>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="signup-password-confirm">
                    Confirmez le mot de passe <span className="req">*</span>
                  </label>
                  <div className="password-wrap">
                    <input
                      className="form-input"
                      type={suPwdConfirmVisible ? "text" : "password"}
                      id="signup-password-confirm"
                      autoComplete="new-password"
                      value={suPasswordConfirm}
                      onChange={(e) => setSuPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                    />
                    <EyeToggle
                      visible={suPwdConfirmVisible}
                      onClick={() => setSuPwdConfirmVisible((v) => !v)}
                    />
                  </div>
                  <ul className={`password-check${suPasswordConfirm.length > 0 ? " is-visible" : ""}`}>
                    <li className={pwdMatch ? "ok" : ""}>Les mots de passe correspondent</li>
                  </ul>
                </div>
              </div>

              <div className="form-row">
                <label className="form-check">
                  <input
                    type="checkbox"
                    checked={suCharte}
                    onChange={(e) => setSuCharte(e.target.checked)}
                  />
                  <span>
                    J&apos;ai lu et j&apos;accepte la{" "}
                    <Link href="/charte" className="form-link">
                      charte de la communauté
                    </Link>{" "}
                    (respect, droit à l&apos;image des mineurs, etc.).
                  </span>
                </label>
              </div>

              <button type="submit" className="form-submit" disabled={busy}>
                {busy ? "Création…" : "Créer mon compte"}
              </button>
            </form>

            <div className="auth-switch">
              <div className="auth-switch-label">Déjà membre&nbsp;?</div>
              <button type="button" className="auth-switch-btn" onClick={() => handleSwitch("signin")}>
                Se connecter
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ---------------------------- EyeToggle sub ---------------------------- */
function EyeToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`password-toggle${visible ? " is-visible" : ""}`}
      onClick={onClick}
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      <svg className="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg className="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.8 19.8 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.8 19.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    </button>
  );
}
