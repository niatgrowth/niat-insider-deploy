'use client';

import { cn } from '@/lib/utils';

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Stagger delay in milliseconds */
  delay?: number;
  as?: 'div' | 'section' | 'main' | 'article';
};

export function FadeIn({
  children,
  className,
  style,
  delay,
  as: Tag = 'div',
}: FadeInProps) {
  return (
    <Tag
      className={cn('animate-niat-fade-in opacity-0', className)}
      style={{
        ...style,
        ...(delay != null ? { animationDelay: `${delay}ms` } : {}),
      }}
    >
      {children}
    </Tag>
  );
}
