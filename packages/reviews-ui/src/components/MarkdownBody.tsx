"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@niat/reviews-ui/lib/utils";

interface MarkdownBodyProps {
  content: string;
  className?: string;
}

const proseClasses =
  "text-niat-text text-[15px] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline [&_code]:bg-niat-border/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-niat-border/30 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-niat-text-secondary";

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  if (!content?.trim()) return null;
  return (
    <div className={cn(proseClasses, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.trim()}</ReactMarkdown>
    </div>
  );
}
