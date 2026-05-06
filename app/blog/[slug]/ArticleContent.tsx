"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  // Wrap every table in a horizontally-scrollable container so long rows
  // don't overflow on narrow viewports.
  table: ({ children }) => (
    <div className="overflow-x-auto my-8 rounded border border-white/10">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.04] border-b border-white/20">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left px-4 py-3 text-white font-semibold font-display text-xs uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-montana-muted border-b border-white/5 align-top">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-white/[0.02]">{children}</tr>
  ),
};

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div
      className={[
        "prose prose-invert prose-lg max-w-none",
        "prose-headings:font-display prose-headings:text-white prose-headings:tracking-tight",
        "prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3",
        "prose-p:text-montana-muted prose-p:leading-relaxed",
        "prose-a:text-montana-pink prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-white prose-strong:font-semibold",
        "prose-ul:text-montana-muted prose-li:my-1",
        "prose-ol:text-montana-muted",
        "prose-blockquote:border-l-montana-pink prose-blockquote:text-montana-muted/80",
        "prose-code:text-montana-pink prose-code:bg-montana-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-montana-surface prose-pre:border prose-pre:border-white/10",
        "prose-hr:border-white/10",
        // Suppress prose's default table styles — our custom components handle them
        "prose-table:my-0",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
