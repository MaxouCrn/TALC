import Link from "next/link";
import PostCard from "@/components/feed/PostCard";
import { fetchLatestPosts } from "@/lib/data/posts";

export default async function FeedPreview() {
  const posts = await fetchLatestPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="feed-preview">
      <header className="section-head">
        <div className="section-eyebrow">La vie du club, en images</div>
        <h2 className="section-title">
          Le <em>feed</em> communautaire
        </h2>
        <div className="section-rule">
          <span />
          <span />
        </div>
        <p className="section-lede">
          Chaque activité partage ses moments. Ouvrez les coulisses des
          ateliers, des répétitions et des galas&nbsp;— et, si le cœur vous en
          dit, rejoignez la conversation.
        </p>
      </header>

      <div className="posts-row">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="feed-invite">
        <div className="feed-invite-inner">
          <p className="invite-kicker">
            Vous n&apos;êtes pas encore inscrit&nbsp;?
          </p>
          <h3 className="invite-title">
            Rejoignez la communauté pour <em>commenter</em> et <em>réagir</em>
          </h3>
          <p className="invite-text">
            L&apos;inscription est libre et gratuite. Adhérents, familles,
            proches&nbsp;: tout le monde y a sa place.
          </p>
          <div className="invite-actions">
            <Link href="/inscription" className="btn btn-primary">
              Créer mon compte
            </Link>
            <Link href="/feed" className="btn btn-ghost">
              Voir tout le feed
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
