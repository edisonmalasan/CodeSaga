import Link from 'next/link';
export default function NotFound() { return <div className="page-container status-page"><h1>This trail is not on the map.</h1><p>That published page could not be found. Check the address or choose a course to find your bearings.</p><Link className="button" href="/courses">Back to the courses</Link></div>; }
