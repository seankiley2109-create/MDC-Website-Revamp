"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import {
  BLOG_CATEGORIES,
  CATEGORY_COLORS,
  formatDate,
  type BlogCategory,
} from "@/lib/blog";
import type { getAllPosts } from "@/lib/blog";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";

type Post = ReturnType<typeof getAllPosts>[number];

interface BlogGridProps {
  posts: Post[];
  featured: Post | undefined;
}

export function BlogGrid({ posts, featured }: BlogGridProps) {
  const [active, setActive] = useState<BlogCategory | null>(null);

  const filtered = active ? posts.filter((p) => p.category === active) : posts;

  const showFeatured = !active && featured;
  const otherPosts = filtered.filter((p) => !p.featured);
  const gridPosts =
    !active && otherPosts.length > 0 ? otherPosts : filtered;

  const counts = BLOG_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = posts.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <>
      {/* ── Featured Post ──────────────────────────────────────────────────── */}
      {showFeatured && (
        <div className="mb-16">
          <SpotlightCard customSize className="p-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase border ${CATEGORY_COLORS[featured.category].bg} ${CATEGORY_COLORS[featured.category].border} ${CATEGORY_COLORS[featured.category].text}`}
                    >
                      {featured.category}
                    </span>
                    <span className="text-xs text-montana-muted/60 font-medium uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-montana-muted leading-relaxed mb-6 max-w-xl">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link href={`/blog/${featured.slug}`}>
                    <AnimatedButton variant="primary" className="group">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 btn-arrow" />
                    </AnimatedButton>
                  </Link>
                  <div className="flex items-center gap-4 text-xs text-montana-muted/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(featured.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex w-72 bg-montana-pink/5 border-l border-white/5 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-montana-pink/10 border border-montana-pink/20 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-montana-pink" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-montana-muted">
                    {featured.readTime}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {featured.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 text-montana-muted/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
            !active
              ? "bg-montana-pink/10 border-montana-pink/40 text-montana-pink"
              : "bg-transparent border-white/10 text-montana-muted hover:text-white hover:border-white/20"
          }`}
        >
          All
          <span className="ml-2 text-xs opacity-60">{posts.length}</span>
        </button>

        {BLOG_CATEGORIES.map((cat) => {
          const isActive = active === cat;
          const colors = CATEGORY_COLORS[cat];
          const count = counts[cat] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
                isActive
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : "bg-transparent border-white/10 text-montana-muted hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
              <span className="ml-2 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {active && gridPosts.length === 0 ? (
        <div className="py-24 text-center text-montana-muted">
          <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No articles in this category yet.</p>
          <p className="text-sm mt-1 opacity-60">Check back soon.</p>
        </div>
      ) : gridPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {gridPosts.map((post) => {
            const colors = CATEGORY_COLORS[post.category];
            return (
              <SpotlightCard
                key={post.slug}
                customSize
                className="flex flex-col h-full group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase border ${colors.bg} ${colors.border} ${colors.text}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-montana-muted/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug group-hover:text-montana-pink transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-sm text-montana-muted leading-relaxed flex-1 mb-5">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-montana-muted/50 mb-5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt)}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-white/[0.03] border border-white/5 text-montana-muted/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href={`/blog/${post.slug}`} className="mt-auto">
                  <AnimatedButton variant="outline" className="w-full text-sm">
                    Read Article
                    <ArrowRight className="ml-2 h-3.5 w-3.5 btn-arrow" />
                  </AnimatedButton>
                </Link>
              </SpotlightCard>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
