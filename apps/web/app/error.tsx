'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="page-container status-page" role="alert"><h1>The reading desk is unavailable.</h1><p>Published content could not be loaded safely. Please retry in a moment.</p><div className="utility-actions"><button className="button" onClick={reset}>Retry content</button><Link href="/help">Read preview help</Link></div></div>;
}
