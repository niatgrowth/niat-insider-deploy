"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { cn } from "@niat/reviews-ui/lib/utils";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => void;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) return { confirm: (_opts: ConfirmOptions) => {} };
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    options?.onConfirm();
    setOpen(false);
    setOptions(null);
  }, [options]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setOptions(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleCancel]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && options && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancel}
            aria-hidden
          />
          <div
            className="relative rounded-2xl border border-niat-border shadow-card w-full max-w-md p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-niat-text">
              {options.title}
            </h2>
            <p id="confirm-desc" className="text-sm text-niat-text-secondary">
              {options.message}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 transition-colors"
                style={{ backgroundColor: "var(--niat-section)" }}
              >
                {options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  options.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
