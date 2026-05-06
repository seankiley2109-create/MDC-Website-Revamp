"use client";

import ReactMarkdown from "react-markdown";

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
      ].join(" ")}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
