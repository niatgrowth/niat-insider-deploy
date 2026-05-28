"use client";

import type { Question } from "@niat/reviews-ui/types/question";
import { FAQItem } from "./FAQItem";

interface FAQAccordionProps {
  items: Question[];
  maxItems?: number;
}

export function FAQAccordion({ items, maxItems = 8 }: FAQAccordionProps) {
  const list = items.slice(0, maxItems);

  return (
    <ul className="divide-y divide-niat-border">
      {list.map((q) => (
        <FAQItem key={q.id} question={q} />
      ))}
    </ul>
  );
}
