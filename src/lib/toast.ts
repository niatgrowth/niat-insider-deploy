import { toast } from 'sonner';
import { extractDjangoError } from '@/lib/utils/errors';

const DEFAULT_ERROR = 'Something went wrong. Please try again.';

/** Normalize API / thrown errors into user-facing copy. */
export function getApiErrorMessage(
  err: unknown,
  fallback: string = DEFAULT_ERROR
): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data !== undefined && data !== null) {
      return extractDjangoError(data);
    }
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err === 'string' && err.trim()) {
    return err.trim();
  }
  return fallback;
}

export const notify = {
  success(message: string) {
    toast.success(message);
  },

  error(message: string) {
    toast.error(message);
  },

  /** Show an error derived from an API response or thrown value. */
  apiError(err: unknown, fallback?: string) {
    toast.error(getApiErrorMessage(err, fallback ?? DEFAULT_ERROR));
  },

  info(message: string) {
    toast.info(message);
  },

  loading(message: string) {
    return toast.loading(message);
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error?: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error:
        messages.error ??
        ((err: unknown) => getApiErrorMessage(err)),
    });
  },
};
