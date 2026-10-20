import type { MetadataRoute } from 'next';
import { webOrigin } from '../src/catalog-client';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/search', '/account/', '/home', '/api/'] }, sitemap: `${webOrigin()}/sitemap.xml` }; }
