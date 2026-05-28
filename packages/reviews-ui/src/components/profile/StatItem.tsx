"use client";

export interface StatItemProps {
  value: string | number;
  label: string;
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-niat-text">{value}</p>
      <p className="text-xs text-niat-text-secondary mt-0.5">{label}</p>
    </div>
  );
}
