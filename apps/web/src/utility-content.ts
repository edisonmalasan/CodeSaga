import type { RichBlock } from '@codesaga/contracts';
export const utilityPages: Record<string, { title: string; summary: string; body: RichBlock[] }> = {
  about: { title: 'A place for curious beginnings.', summary: 'CodeSaga is being built for people learning to code one understandable step at a time.', body: [
    { type: 'paragraph', text: 'The intended learning loop joins explanations, real code, useful feedback and durable progress. This release opens the explanations first.' },
    { type: 'heading', level: 2, text: 'What you can explore today' },
    { type: 'paragraph', text: 'The public collection contains original reading previews: one Python chapter with three lessons and one HTML & CSS lesson, with supporting notes and a local-file tutorial. Interactive execution, accounts, saved work, progress and community features are not connected here.' },
    { type: 'paragraph', text: 'Available content is labelled in the catalog. Upcoming subjects are plans, without a promised release date.' },
    { type: 'heading', level: 2, text: 'An original world' },
    { type: 'paragraph', text: 'The woodland scene, characters and written curriculum were created for CodeSaga. The site pairs a locally served, licensed pixel display font with readable system type. No customer outcomes, issued credentials or adoption figures are claimed.' },
  ] },
  help: { title: 'A little help along the way.', summary: 'What reading previews include, how to find them, and what is still being built.', body: [
    { type: 'heading', level: 2, text: 'What can I do here?' }, { type: 'paragraph', text: 'Browse courses, filter by subject or words, and read available lessons and resources. A reading preview is a published explanation with static code and expected-output examples.' },
    { type: 'heading', level: 2, text: 'Can I run or submit code?' }, { type: 'paragraph', text: 'Execution and checking are not connected. There is no running or submission action on these pages. You may copy samples into your own trusted tools if you want to experiment.' },
    { type: 'heading', level: 2, text: 'Will my progress be saved?' }, { type: 'paragraph', text: 'No learning progress, answers or source files are stored. Theme, motion and sound preferences can be stored on this browser. If storage is unavailable, those controls still work for the current session and show a notice.' },
    { type: 'heading', level: 2, text: 'Why is a course upcoming?' }, { type: 'paragraph', text: 'Its subject is planned, but no lesson preview has been published. No release date is established.' },
    { type: 'heading', level: 2, text: 'How do I find something?' }, { type: 'paragraph', text: 'Search the course catalog or choose a category. Reset clears both filters. The resource, tutorial and learning-note indexes link to original published reading material. The search page searches courses and resource titles together.' },
    { type: 'heading', level: 2, text: 'What if a page does not load?' }, { type: 'paragraph', text: 'Retry the page. A missing identity returns a not-found page; an unavailable content service shows a separate message. No substitute lesson is silently selected.' },
  ] },
  pricing: { title: 'Membership is not open.', summary: 'Plans, prices and purchases have not been published.', body: [
    { type: 'paragraph', text: 'You can browse the current reading previews without an account. Future commercial decisions will be described here when they are established. There is no checkout or billing integration in this release.' },
    { type: 'heading', level: 2, text: 'Available now' }, { type: 'paragraph', text: 'Explore the Python First light chapter, the HTML & CSS reading preview, and their supporting notes and tutorial.' },
  ] },
};
