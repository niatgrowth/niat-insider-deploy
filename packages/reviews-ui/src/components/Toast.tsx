"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@niat/reviews-ui/lib/utils";

const LOGIN_REQUIRED_MESSAGE =
  "No cap — log in first to upvote, comment & do the thing 💀";

const TOAST_DURATION_MS = 4500;

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showLoginRequired: () => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    return {
      showLoginRequired: () => {},
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
      },
    };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [loginVisible, setLoginVisible] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idPrefix = useId();

  const showLoginRequired = useCallback(() => {
    setLoginVisible(true);
    const t = setTimeout(() => setLoginVisible(false), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [idPrefix]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const handler = () => showLoginRequired();
    window.addEventListener("auth:login_required", handler);
    return () => window.removeEventListener("auth:login_required", handler);
  }, [showLoginRequired]);

  return (
    <ToastContext.Provider
      value={{
        showLoginRequired,
        toast: { success: (m) => addToast(m, "success"), error: (m) => addToast(m, "error"), info: (m) => addToast(m, "info") },
      }}
    >
      {children}
      {loginVisible && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl border border-niat-border px-4 py-3 shadow-card"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <p className="text-sm font-medium text-niat-text">{LOGIN_REQUIRED_MESSAGE}</p>
          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
        </div>
      )}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((item) => (
            <div
              key={item.id}
              role="alert"
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-card",
                item.type === "success" && "border-green-200 bg-green-50 text-green-900",
                item.type === "error" && "border-red-200 bg-red-50 text-red-900",
                item.type === "info" && "border-niat-border"
              )}
              style={
                item.type === "info"
                  ? { backgroundColor: "var(--niat-section)" }
                  : undefined
              }
            >
              <span className="shrink-0 mt-0.5">
                {item.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {item.type === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                {item.type === "info" && <Info className="h-5 w-5 text-niat-text-secondary" />}
              </span>
              <p className="text-sm font-medium flex-1 min-w-0">{item.message}</p>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
