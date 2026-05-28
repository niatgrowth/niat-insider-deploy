"use client";

import { useState } from "react";
import { ChevronDown, User, CheckCircle } from "lucide-react";
import type { Question } from "@niat/reviews-ui/types/question";
import { cn } from "@niat/reviews-ui/lib/utils";
import { MarkdownBody } from "@niat/reviews-ui/components/MarkdownBody";

interface FAQItemProps {
  question: Question;
}

export function FAQItem({ question }: FAQItemProps) {
  const [isOpen, setOpen] = useState(false);
  const answer = question.answers?.[0] ?? question.answer;

  return (
    <li className="py-3 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left rounded-lg hover:bg-niat-border/30 transition-colors py-2 -mx-2 px-2"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-niat-text line-clamp-2">{question.title}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-niat-text-secondary transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {isOpen && answer && (
          <div className="pt-2 pl-2 space-y-2">
            <MarkdownBody content={answer.body} className="text-sm" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-niat-text-secondary">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4 shrink-0" />
                @{answer.author?.username ?? "unknown"}
                {answer.author?.is_verified_senior && (
                  <CheckCircle className="h-3.5 w-3.5 text-primary" aria-label="Verified Senior" />
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
