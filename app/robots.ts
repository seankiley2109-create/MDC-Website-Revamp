import { MetadataRoute } from 'next';

const BASE = 'https://montanadc.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/sign-in', '/sign-up', '/billing', '/portal', '/checkout'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
