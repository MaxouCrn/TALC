/**
 * Données mockées V1. À remplacer par des queries Supabase quand la BDD
 * sera branchée. Structurées pour matcher grosso modo le schéma cible
 * décrit dans docs/superpowers/specs/2026-04-24-talc-v1-design.md §10.
 */

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  coverUrl: string;
  href: string;
};

export const NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Les répétitions du Gala battent leur plein",
    excerpt:
      "À deux mois du grand soir, les troupes de danse enchaînent les filages. Mélanie, chorégraphe, nous ouvre les coulisses…",
    category: "Gala de danse",
    dateLabel: "18 avril 2026",
    coverUrl:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=900&q=80",
    href: "#",
  },
  {
    id: "2",
    title: "Exposition de fin d'année : soixante toiles à l'honneur",
    excerpt:
      "Le vernissage aura lieu le samedi 25 mai à la salle des fêtes. Venez découvrir le travail des adhérents de l'atelier peinture…",
    category: "Atelier peinture",
    dateLabel: "12 avril 2026",
    coverUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80",
    href: "#",
  },
  {
    id: "3",
    title: "Assemblée générale : bilan d'une belle saison",
    excerpt:
      "Plus de quatre-vingts adhérents présents pour ce rendez-vous annuel. Retour sur les moments forts et les projets pour 2026-2027…",
    category: "Vie du club",
    dateLabel: "3 avril 2026",
    coverUrl:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80",
    href: "#",
  },
];

export type Activity = {
  id: string;
  slug: string;
  name: string;
  meta: string;
  description: string;
  coverUrl: string;
  plate: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "1",
    slug: "danse",
    name: "Danse",
    meta: "Classique, modern'jazz, ados, adultes · 4 créneaux",
    description:
      "Du premier pas à la grande scène du Gala, quatre groupes d'âge encadrés par Mélanie et Sophie.",
    coverUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=900&q=80",
    plate: "№ I",
  },
  {
    id: "2",
    slug: "peinture",
    name: "Peinture",
    meta: "Aquarelle, huile, acrylique · 2 ateliers",
    description:
      "Atelier libre le jeudi, cours guidé le samedi. Exposition annuelle à la salle des fêtes en mai.",
    coverUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80",
    plate: "№ II",
  },
  {
    id: "3",
    slug: "theatre",
    name: "Théâtre",
    meta: "Troupe adulte, atelier jeunes · 2 créneaux",
    description:
      "Une pièce montée chaque saison. Répétitions le vendredi soir, représentation fin mars au foyer.",
    coverUrl:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80",
    plate: "№ III",
  },
  {
    id: "4",
    slug: "musique",
    name: "Musique",
    meta: "Chorale, guitare, piano · 3 ateliers",
    description:
      "Chorale tous les mardis, cours d'instrument individuels sur inscription. Concert d'hiver au mois de décembre.",
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80",
    plate: "№ IV",
  },
  {
    id: "5",
    slug: "ecriture",
    name: "Écriture",
    meta: "Atelier mensuel · tous niveaux",
    description:
      "Un samedi par mois, plume à la main. Nouvelle, poésie, fragments : publication annuelle en recueil.",
    coverUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80",
    plate: "№ V",
  },
  {
    id: "6",
    slug: "jeux",
    name: "Jeux de société",
    meta: "Bridge, tarot, échecs · tous les mercredis",
    description:
      "Rendez-vous hebdomadaire au foyer, de 14h à 18h. Table ouverte aux débutants, initiation sur place.",
    coverUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
    plate: "№ VI",
  },
];

export type Post = {
  id: string;
  author: {
    displayName: string;
    avatarUrl: string;
  };
  scope: {
    name: string;
    slug: string;
  };
  timeLabel: string;
  mediaUrl: string;
  caption: string;
  reactionsCount: number;
  commentsCount: number;
};

export const POSTS: Post[] = [
  {
    id: "1",
    author: { displayName: "Mélanie Leclerc", avatarUrl: "https://i.pravatar.cc/120?img=45" },
    scope: { name: "Danse 18-25", slug: "danse-18-25" },
    timeLabel: "il y a 2 jours",
    mediaUrl:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=900&q=80",
    caption:
      "Répétition générale à J-60 du Gala. Elles sont prêtes, mes danseuses ! ✨",
    reactionsCount: 42,
    commentsCount: 8,
  },
  {
    id: "2",
    author: { displayName: "Sylvie Marchand", avatarUrl: "https://i.pravatar.cc/120?img=32" },
    scope: { name: "Peinture adultes", slug: "peinture-adultes" },
    timeLabel: "il y a 4 jours",
    mediaUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80",
    caption:
      "Les toiles de l'atelier de printemps sont enfin terminées après trois mois de travail acharné. Vernissage prévu le samedi 25 mai à partir de 18h à la salle des fêtes de Tatinghem. Un verre de l'amitié clôturera la soirée, venez nombreux découvrir le travail des adhérents !",
    reactionsCount: 24,
    commentsCount: 3,
  },
  {
    id: "3",
    author: { displayName: "Jean-Pierre Dubois", avatarUrl: "https://i.pravatar.cc/120?img=12" },
    scope: { name: "Théâtre", slug: "theatre" },
    timeLabel: "il y a 6 jours",
    mediaUrl:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80",
    caption:
      "Filage complet ce soir. La troupe tient le rythme. Représentation dans trois semaines !",
    reactionsCount: 27,
    commentsCount: 5,
  },
];
