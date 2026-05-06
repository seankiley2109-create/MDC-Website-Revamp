import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import {
  getAllPosts,
  formatDate,
  CATEGORY_COLORS,
  BLOG_CATEGORIES,
  type BlogCategory,
} from "@/lib/blog";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { CategoryFilter } from "./components/CategoryFilter";

export const metadata: Metadata = {
  title: "Blog & Insights | Montana Data Company",
  description:
    "Data protection expertise from the Montana Data Company team. In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365 backup, and enterprise data resilience in South Africa.",
  openGraph: {
    title: "Blog & Insights | Montana Data Company",
    description:
      "In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365 backup, and enterprise data resilience.",
    type: "website",
  },
};

export default async function BlogPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category as BlogCategory | undefined;

  const allPosts = getAllPosts();

  const filtered = activeCategory
    ? allPosts.filter((p) => p.category === activeCategory)
    : allPosts;

  const featured = allPosts.find((p) => p.featured);
  const nonFeatured = filtered.filter((p) => !p.featured || activeCategory);

  // Category counts for filter badges
  const counts = BLOG_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = allPosts.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="py-16 md:py-20">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink rounded-full mr-3 shadow-[0_0_8px_#F24567]" />
            Blog &amp; Insights
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 max-w-3xl">
            Data protection expertise{" "}
            <span className="text-montana-gradient">you can trust.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl">
            In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365
            backup, and enterprise data resilience — written by our team for South
            African organisations.
          </p>
        </div>

        {/* ── Featured Post ─────────────────────────────────────────────────── */}
        {featured && !activeCategory && (
          <div className="mb-16">
            <SpotlightCard customSize className="p-0 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
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
                {/* Accent panel */}
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

        {/* ── Filter + Grid ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <CategoryFilter counts={counts} totalCount={allPosts.length} />
        </div>

        {nonFeatured.length === 0 ? (
          <div className="py-24 text-center text-montana-muted">
            <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles in this category yet.</p>
            <p className="text-sm mt-1 opacity-60">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {nonFeatured.map((post) => {
              const colors = CATEGORY_COLORS[post.category];
              return (
                <SpotlightCard key={post.slug} customSize className="flex flex-col h-full group">
                  {/* Category badge */}
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

                  {/* Title + excerpt */}
                  <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug group-hover:text-montana-pink transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-montana-muted leading-relaxed flex-1 mb-5">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-1.5 text-xs text-montana-muted/50 mb-5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </div>

                  {/* Tags */}
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
        )}

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <div className="border border-white/10 bg-montana-surface/30 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to protect your organisation&apos;s data?
            </h2>
            <p className="text-montana-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Our team assesses your current exposure and builds a practical
              remediation plan — no obligation, no jargon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessments">
                <AnimatedButton variant="primary">
                  Take a Free Assessment
                </AnimatedButton>
              </Link>
              <Link href="/contact">
                <AnimatedButton variant="secondary">
                  Speak to an Expert
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
