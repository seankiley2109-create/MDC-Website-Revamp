import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  formatDate,
  CATEGORY_COLORS,
} from "@/lib/blog";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ArticleContent } from "./ArticleContent";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Montana Data Company`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.category, 3);
  const colors = CATEGORY_COLORS[post.category];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://montanadc.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Montana Data Company",
      logo: {
        "@type": "ImageObject",
        url: "https://montanadc.com/logos/montana-logo.svg",
      },
    },
    datePublished: post.publishedAt,
    keywords: post.tags.join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://montanadc.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://montanadc.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://montanadc.com/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="pt-24 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 pb-24">

          {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
          <nav className="flex items-center gap-2 py-8 text-sm text-montana-muted/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span
              className={`${colors.text} font-medium`}
            >
              {post.category}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

            {/* ── Main Column ───────────────────────────────────────────────── */}
            <article>
              {/* Header */}
              <header className="mb-12">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-bold uppercase border mb-6 ${colors.bg} ${colors.border} ${colors.text}`}
                >
                  {post.category}
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                  {post.title}
                </h1>
                <p className="text-lg text-montana-muted leading-relaxed mb-8">
                  {post.excerpt}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-6 py-5 border-y border-white/10 text-sm text-montana-muted/70">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                  <span className="text-montana-muted">
                    {post.author} · {post.authorTitle}
                  </span>
                </div>
              </header>

              {/* Body */}
              <ArticleContent content={post.content} />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-montana-muted/50 shrink-0" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-white/[0.03] border border-white/10 text-montana-muted/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Back link */}
              <div className="mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-montana-muted hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to all articles
                </Link>
              </div>
            </article>

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <aside className="space-y-6">

              {/* Service CTA */}
              {post.serviceLink && (
                <SpotlightCard customSize className="p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-montana-muted mb-3">
                    Need help with this?
                  </div>
                  <p className="text-sm text-montana-muted leading-relaxed mb-5">
                    Our team can assess your organisation&apos;s exposure and
                    build a remediation plan.
                  </p>
                  <Link href={post.serviceLink}>
                    <AnimatedButton variant="primary" className="w-full text-sm">
                      {post.serviceLinkLabel ?? "Get in Touch"}
                      <ArrowRight className="ml-2 h-3.5 w-3.5 btn-arrow" />
                    </AnimatedButton>
                  </Link>
                </SpotlightCard>
              )}

              {/* Free Assessment */}
              <SpotlightCard customSize className="p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-montana-muted mb-3">
                  Free Risk Assessment
                </div>
                <p className="text-sm text-montana-muted leading-relaxed mb-5">
                  Get a personalised security or POPIA compliance score in under
                  10 minutes.
                </p>
                <Link href="/assessments">
                  <AnimatedButton variant="outline" className="w-full text-sm">
                    Start Assessment
                  </AnimatedButton>
                </Link>
              </SpotlightCard>

              {/* Related articles */}
              {related.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-montana-muted mb-4">
                    Related Articles
                  </div>
                  <div className="space-y-3">
                    {related.map((rel) => {
                      const rc = CATEGORY_COLORS[rel.category];
                      return (
                        <Link
                          key={rel.slug}
                          href={`/blog/${rel.slug}`}
                          className="block group"
                        >
                          <div className="border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                            <span
                              className={`text-xs font-bold uppercase ${rc.text} mb-2 block`}
                            >
                              {rel.category}
                            </span>
                            <p className="text-sm text-white/80 group-hover:text-white leading-snug transition-colors">
                              {rel.title}
                            </p>
                            <p className="text-xs text-montana-muted/50 mt-1">
                              {rel.readTime}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* ── Related grid (mobile / full-width) ──────────────────────────── */}
          {related.length > 0 && (
            <div className="mt-20 lg:hidden">
              <h2 className="font-display text-xl font-bold text-white mb-6">
                More in {post.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {related.map((rel) => {
                  const rc = CATEGORY_COLORS[rel.category];
                  return (
                    <SpotlightCard key={rel.slug} customSize className="flex flex-col h-full group">
                      <span className={`text-xs font-bold uppercase ${rc.text} mb-3 block`}>
                        {rel.category}
                      </span>
                      <h3 className="font-display text-base font-bold text-white mb-3 leading-snug group-hover:text-montana-pink transition-colors">
                        {rel.title}
                      </h3>
                      <p className="text-sm text-montana-muted flex-1 mb-4">{rel.excerpt}</p>
                      <Link href={`/blog/${rel.slug}`}>
                        <AnimatedButton variant="outline" className="w-full text-sm">
                          Read
                          <ArrowRight className="ml-2 h-3.5 w-3.5 btn-arrow" />
                        </AnimatedButton>
                      </Link>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
