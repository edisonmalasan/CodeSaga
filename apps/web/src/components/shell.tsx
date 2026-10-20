'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { PreferenceControls } from './preferences';

const links = [['/courses', 'Courses'], ['/resources', 'Resources'], ['/about', 'About'], ['/help', 'Help']] as const;
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  return <header className="site-header" onKeyDown={(event) => { if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); } }}>
    <div className="header-inner">
      <Link href="/" className="wordmark" aria-label="CodeSaga home">CodeSaga<span className="wordmark-square" aria-hidden="true" /></Link>
      <nav className={`primary-nav${open ? ' is-open' : ''}`} id="primary-navigation" aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={path.startsWith(href) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
      <div className="header-actions"><Link className="icon-link" href="/search" aria-label="Search public content"><Icon name="search" /></Link><PreferenceControls /><button ref={toggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button></div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><div><Link href="/" className="wordmark">CodeSaga</Link><p>A place for small beginnings.</p></div><nav aria-label="Footer navigation"><Link href="/courses">Courses</Link><Link href="/tutorials">Tutorials</Link><Link href="/blog">Learning notes</Link><Link href="/pricing">Membership status</Link><Link href="/help">Help</Link></nav><p className="footer-note">Original reading previews. Interactive learning is still ahead.</p></div></footer>;
}
