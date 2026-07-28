import type { ReactNode } from "react";

import Link from "next/link";

import type { ArticleBlock } from "@/lib/articles";

// The only three inline forms lib/articles.ts allows: [label](href), `code` and
// **bold**. Parsed into React elements, never into HTML, so an article can never
// inject markup no matter what lands in a text field.
const INLINE = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/gu;

const renderInline = (text: string, keyBase: string): ReactNode[] => {
  const out: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const key = `${keyBase}-${String(match.index)}`;
    const [, label, href, code, bold] = match;

    if (code !== undefined) {
      out.push(
        <code key={key} className="code-inline">
          {code}
        </code>
      );
    } else if (bold !== undefined) {
      out.push(
        <strong key={key} className="text-ink font-semibold">
          {bold}
        </strong>
      );
    } else if (label !== undefined && href !== undefined) {
      // Internal routes go through Link so the prefetch and client nav match the
      // rest of the site; outbound links stay plain anchors, same as the case pages.
      out.push(
        href.startsWith("/") ? (
          <Link key={key} href={href} className="prose-link">
            {label}
          </Link>
        ) : (
          <a key={key} href={href} className="prose-link">
            {label}
          </a>
        )
      );
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
};

const renderBlock = (block: ArticleBlock, index: number): ReactNode => {
  const key = `${block.kind}-${String(index)}`;

  switch (block.kind) {
    case "h2": {
      // The id is authored, not slugified from the text, so an edit to a heading
      // never silently breaks an anchor someone already shared.
      return (
        <h2
          key={key}
          id={block.id}
          className="mt-14 scroll-mt-24 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {block.text}
        </h2>
      );
    }

    case "p": {
      return (
        <p key={key} className="text-ink/80 mt-5 leading-relaxed">
          {renderInline(block.text, key)}
        </p>
      );
    }

    case "list": {
      return (
        <ul key={key} className="mt-5 space-y-2.5">
          {block.items.map((item, itemIndex) => (
            <li
              key={`${key}-${String(itemIndex)}`}
              className="text-ink/80 border-stamp/30 border-l-2 pl-4 leading-relaxed"
            >
              {renderInline(item, `${key}-${String(itemIndex)}`)}
            </li>
          ))}
        </ul>
      );
    }

    case "aside": {
      return (
        <p
          key={key}
          className="border-stamp/40 text-ink/90 mt-8 border-l-2 py-1 pl-5 leading-relaxed font-medium"
        >
          {renderInline(block.text, key)}
        </p>
      );
    }

    case "code": {
      // The code panel is the spine's dark channel, reused: green ink needs black
      // to bloom against, and it reads as the same document furniture. tabIndex
      // makes the scroll container reachable when a sample is wider than the column.
      return (
        <figure key={key} className="mt-8">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a horizontally
              scrollable region must be keyboard-reachable (WCAG 2.1.1); the rule does not
              model scroll containers, and role="region" + a label keep it announced. */}
          <pre className="code-block" tabIndex={0} role="region" aria-label={block.lang}>
            <code>{block.code}</code>
          </pre>
          <figcaption className="eyebrow text-trace mt-3">
            {block.lang}
            {block.caption === undefined ? null : ` · ${block.caption}`}
          </figcaption>
        </figure>
      );
    }
  }
};

export const ArticleBody = ({ blocks }: { blocks: readonly ArticleBlock[] }) => (
  <div className="max-w-[68ch] text-lg">
    {blocks.map((block, index) => renderBlock(block, index))}
  </div>
);
