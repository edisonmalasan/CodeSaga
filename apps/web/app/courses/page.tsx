import { getCatalog } from '../../src/catalog-client';
import { CourseCatalog } from '../../src/components/catalog';
import { pageMetadata } from '../../src/metadata';
export const generateMetadata = () => pageMetadata('Courses', 'Discover original coding reading previews. Filter by subject or search Python, HTML & CSS, and upcoming courses.', '/courses');
export default async function Courses({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [catalog, params] = await Promise.all([getCatalog(), searchParams]);
  return <div className="page-container catalog-page"><div className="page-intro"><h1>Pick your next trail.</h1><p>Every subject starts with a small idea. Find the reading previews available today, and see what is still ahead.</p></div><CourseCatalog catalog={catalog} initialQuery={typeof params.q === 'string' ? params.q : ''} initialCategory={typeof params.category === 'string' ? params.category : ''} /></div>;
}
