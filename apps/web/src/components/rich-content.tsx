import type { RichBlock } from '@codesaga/contracts';
import { ContentImage, ContentVideo } from './media';

function Inline({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/g).map((piece, index) => piece.startsWith('`') && piece.endsWith('`') ? <code key={index}>{piece.slice(1, -1)}</code> : piece)}</>;
}
export function headingId(text: string, index: number) { return `section-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`; }
export function RichContent({ blocks }: { blocks: RichBlock[] }) {
  return <div className="rich-content">{blocks.map((block, index) => {
    switch (block.type) {
      case 'paragraph': return <p key={index}><Inline text={block.text} /></p>;
      case 'heading': return block.level === 2 ? <h2 key={index} id={headingId(block.text, index)}>{block.text}</h2> : <h3 key={index} id={headingId(block.text, index)}>{block.text}</h3>;
      case 'code': return <figure key={index} className="code-example"><figcaption>{block.caption ?? (block.language === 'text' ? 'Expected output · static example' : `${block.language.toUpperCase()} · code example`)}</figcaption><pre tabIndex={0} role="group" aria-label={`${block.language} code sample`}><code>{block.code}</code></pre></figure>;
      case 'list': { const List = block.ordered ? 'ol' : 'ul'; return <List key={index}>{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</List>; }
      case 'callout': return <aside key={index} className={`callout ${block.tone}`}><h3>{block.title}</h3><p><Inline text={block.text} /></p></aside>;
      case 'instructions': return <section key={index} className="instructions"><h3>{block.title}</h3><ol>{block.steps.map((step, i) => <li key={i}><Inline text={step} /></li>)}</ol></section>;
      case 'image': return <ContentImage key={index} {...block} />;
      case 'video': return <ContentVideo key={index} {...block} />;
    }
  })}</div>;
}
