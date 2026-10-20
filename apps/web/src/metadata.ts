import type { Metadata } from 'next';
import { webOrigin } from './catalog-client';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${webOrigin()}${path}`;
  return {
    title, description, alternates: { canonical: url },
    openGraph: { title: `${title} | CodeSaga`, description, url, siteName: 'CodeSaga', type: 'website' },
    twitter: { card: 'summary', title: `${title} | CodeSaga`, description },
  };
}
