"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/mock-data";

/**
 * Post card — format Instagram-like.
 *
 * Gère localement l'état "liked" (toggle) avec animation heart-pop +
 * heart-glow, et détecte si la caption dépasse 3 lignes pour ajouter
 * .is-clamped (affiche " [...]" en bas droite via ::after CSS).
 *
 * En V1 le like est purement visuel côté client. En V2, brancher sur
 * Supabase (insert/delete dans table `reactions`).
 */
export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.reactionsCount);
  const captionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = captionRef.current;
    if (!el) return;

    const apply = () => {
      el.classList.toggle("is-clamped", el.scrollHeight - 1 > el.clientHeight);
    };
    apply();

    window.addEventListener("resize", apply);
    if (document.fonts?.ready) document.fonts.ready.then(apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  }

  return (
    <article className="post-card">
      <header className="post-head">
        <div
          className="post-avatar"
          style={{ backgroundImage: `url(${post.author.avatarUrl})` }}
        />
        <div className="post-ident">
          <div className="post-author">{post.author.displayName}</div>
          <div className="post-scope">
            <span className="post-scope-name">{post.scope.name}</span>
            &nbsp;·&nbsp; {post.timeLabel}
          </div>
        </div>
        <button type="button" className="post-more" aria-label="Menu">
          ⋯
        </button>
      </header>

      <a href="#" className="post-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.mediaUrl} alt="" />
      </a>

      <div className="post-actions">
        <button
          type="button"
          className="post-btn post-like"
          aria-label="Réagir"
          aria-pressed={liked}
          onClick={toggleLike}
        >
          <svg
            className="icon-heart"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={22}
            height={22}
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>

        <button type="button" className="post-btn" aria-label="Commenter">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={22}
            height={22}
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>

        <span className="post-count">
          ♥ {count} réaction{count > 1 ? "s" : ""}
        </span>
      </div>

      <div className="post-caption" ref={captionRef}>
        <span className="caption-author">{post.author.displayName.split(" ")[0]}</span>
        {post.caption}
      </div>

      <a href="#" className="post-comments">
        Voir les {post.commentsCount} commentaires →
      </a>
    </article>
  );
}
