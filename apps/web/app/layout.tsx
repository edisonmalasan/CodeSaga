import type { Metadata } from 'next';
import '@fontsource/silkscreen/latin-400.css';
import './globals.css';
import { Header, Footer } from '../src/components/shell';
import { PreferenceProvider } from '../src/components/preferences';
import { webOrigin } from '../src/catalog-client';

export const metadata: Metadata = {
  metadataBase: new URL(webOrigin()),
  title: { default: 'CodeSaga · A place to begin coding', template: '%s | CodeSaga' },
  description: 'Explore original Python and HTML & CSS reading previews. Find a small, understandable place to begin coding.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><PreferenceProvider><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer /></PreferenceProvider></body></html>;
}
