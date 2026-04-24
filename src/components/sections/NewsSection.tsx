import Link from "next/link";
import { fetchLatestNews } from "@/lib/data/news";
import type { NewsItem } from "@/lib/mock-data";

function roman(n: number): string {
  const map = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return map[n] ?? String(n);
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <article className="news-card">
      <Link href={item.href} className="news-thumb">
        {/* Image distante → <img> natif pour eviter le loader next/image V1.
            A remplacer par next/image + domain whitelist quand les posts
            viendront de Supabase Storage. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.coverUrl} alt="" />
        <span className="news-num">№ {roman(index + 1)}</span>
      </Link>
      <div className="news-body">
        <div className="news-meta">
          <span className="news-cat">{item.category}</span>
          <span className="news-dot">·</span>
          <time>{item.dateLabel}</time>
        </div>
        <h3 className="news-title">{item.title}</h3>
        <p className="news-excerpt">{item.excerpt}</p>
        <Link href={item.href} className="news-link">
          Lire l&apos;article →
        </Link>
      </div>
    </article>
  );
}

export default async function NewsSection() {
  const items = await fetchLatestNews(3);
  if (items.length === 0) return null;

  return (
    <section className="news">
      <header className="section-head">
        <div className="section-eyebrow">Chronique du club</div>
        <h2 className="section-title">
          Dernières <em>actualités</em>
        </h2>
        <div className="section-rule">
          <span />
          <span />
        </div>
      </header>

      <div className="news-grid">
        {items.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>

      <div className="news-footer">
        <Link href="#" className="all-news">
          Toutes les actualités &nbsp;→
        </Link>
      </div>
    </section>
  );
}
