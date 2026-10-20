'use client';

import { useEffect, useRef, useState } from 'react';
import { safeImagePath, safeVideoUrl } from '../media-policy';
import { Icon } from './icons';

export function ContentImage({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // The request can fail before hydration attaches the error handler.
    if (image.current?.complete && image.current.naturalWidth === 0) setFailedSource(src);
  }, [src]);
  if (!safeImagePath(src) || failedSource === src) return <figure className="missing-media"><p>Image unavailable: {alt}</p><figcaption>{caption}</figcaption></figure>;
  return <figure className="content-image"><button ref={trigger} className="image-expand" aria-label={`Expand image: ${alt}`} onClick={() => dialog.current?.showModal()}><img ref={image} src={src} alt={alt} width={width} height={height} loading="lazy" onError={() => setFailedSource(src)} /><span>Expand image</span></button><figcaption>{caption}</figcaption><dialog ref={dialog} className="image-dialog" aria-label={`Expanded image: ${alt}`} onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}><button className="button" onClick={() => dialog.current?.close()}><Icon name="close" />Close image</button><img src={src} alt={alt} width={width} height={height} /><p>{caption}</p></dialog></figure>;
}
export function ContentVideo({ src, title, transcript }: { src: string; title: string; transcript: string }) {
  const [active, setActive] = useState(false);
  return <figure className="content-video">{safeVideoUrl(src) ? active ? <><iframe src={src} title={title} sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen; picture-in-picture" referrerPolicy="no-referrer" loading="lazy" allowFullScreen /><button className="text-button" onClick={() => setActive(false)}>Close video</button></> : <div className="video-placeholder"><h3>{title}</h3><p>This video loads from an external provider only when you choose to open it.</p><button className="button" onClick={() => setActive(true)}>Load video<Icon name="arrow" /></button></div> : <p>Video unavailable. Read the transcript below.</p>}<details><summary>Video transcript</summary><p>{transcript}</p></details></figure>;
}
