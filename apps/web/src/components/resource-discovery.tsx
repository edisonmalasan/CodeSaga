'use client';
import { useState } from 'react';
import type { Resource } from '@codesaga/contracts';
import { categoryNames } from '../content-paths';
import { ResourceList } from './content-ui';
import { Icon } from './icons';
export function ResourceDiscovery({ resources }: { resources: Resource[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const matches = resources.filter((resource) => (!category || resource.category === category) && query.trim().toLowerCase().split(/\s+/).every((word) => `${resource.title} ${resource.summary}`.toLowerCase().includes(word)));
  return <section aria-label="Find reading material"><div className="catalog-controls"><label className="search-label"><span>Search this collection</span><span className="search-field"><Icon name="search" /><input type="search" maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a note, concept or reference…" /></span></label><label className="subject-select">Subject<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All subjects</option>{Object.entries(categoryNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="text-button" disabled={!query && !category} onClick={() => { setQuery(''); setCategory(''); }}>Reset filters</button></div><p className="result-count" role="status">{matches.length} {matches.length === 1 ? 'item' : 'items'} in this collection</p>{matches.length ? <ResourceList resources={matches} headingLevel={2} /> : <div className="empty-state"><h2>No reading material matches yet</h2><p>Try another word or reset the subject and search.</p><button className="button" onClick={() => { setQuery(''); setCategory(''); }}>Show the whole collection</button></div>}</section>;
}
