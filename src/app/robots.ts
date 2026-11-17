import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/rooms', '/rooms/*', '/booking', '/booking/*', '/contact', '/about'],
        disallow: [
          '/manager',
          '/manager/*',
          '/reception',
          '/reception/*',
          '/owner',
          '/owner/*',
          '/admin',
          '/admin/*',
          '/api/*',
        ],
      },
      // Explicit permissions for AI & Generative Search Engines (AEO / GEO)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/', '/rooms', '/rooms/*', '/booking', '/contact', '/about'],
        disallow: ['/manager/*', '/reception/*', '/owner/*', '/api/*'],
      },
    ],
    sitemap: `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
