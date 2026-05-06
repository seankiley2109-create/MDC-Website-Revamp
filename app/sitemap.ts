import { MetadataRoute } from 'next';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';

const BASE = 'https://montanadc.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const blogArticles: MetadataRoute.Sitemap = getAllSlugs().map((slug) => {
    const post = getPostBySlug(slug);
    return {
      url: `${BASE}/blog/${slug}`,
      lastModified: post ? new Date(post.publishedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [
    // Core pages — highest priority
    { url: BASE,                              lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/services`,               lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/assessments`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/pos`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },

    // Assessment tools
    { url: `${BASE}/assessments/security`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/assessments/popia`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Supporting pages
    { url: `${BASE}/resources`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/blog`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/partners`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE}/contact`,                lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },

    // Legal — excluded from search indexing via metadata but included for crawlability
    { url: `${BASE}/privacy`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/paia`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },

    // Blog articles
    ...blogArticles,
  ];
}
