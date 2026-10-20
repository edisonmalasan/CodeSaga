'use client';

import { useId, useState } from 'react';

export function ShareLink({ canonicalPath }: { canonicalPath: string }) {
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'denied'>('idle');
  const [url, setUrl] = useState('');
  const fieldId = useId();
  async function copyLink() {
    const canonicalUrl = new URL(canonicalPath, window.location.origin).href;
    setUrl(canonicalUrl);
    setState('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(canonicalUrl);
      setState('copied');
    } catch { setState('denied'); }
  }
  return <div className="share-link"><div className="share-link-action"><button type="button" className="text-button" onClick={copyLink} disabled={state === 'copying'}>{state === 'copying' ? 'Copying link…' : 'Copy link'}</button><span role="status">{state === 'copied' ? 'Link copied.' : state === 'denied' ? 'Clipboard is unavailable. Select and copy the link below.' : ''}</span></div>{state === 'denied' && <div className="share-link-fallback"><label htmlFor={fieldId}>Canonical page link</label><input id={fieldId} type="url" value={url} readOnly onFocus={(event) => event.currentTarget.select()} /></div>}</div>;
}
