import AuthPanels from "@/components/auth/AuthPanels";

type Props = {
  searchParams?: Promise<{ mode?: string }>;
};

/**
 * /auth — page unifiée connexion + inscription.
 *
 * Lit `?mode=signup` ou `?mode=signin` (default). Le toggle client
 * bascule sans reload et met à jour l'URL côté navigateur uniquement
 * si besoin (géré à l'intérieur d'AuthPanels si on veut plus tard
 * router.replace). En V1, pas de sync URL — on ouvre au mode initial.
 */
export default async function AuthPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const initialMode = params.mode === "signup" ? "signup" : "signin";
  return <AuthPanels initialMode={initialMode} />;
}
