import { createContext, useContext } from 'react';

export interface ToastOptions {
  tone?: 'info' | 'error';
  action?: { label: string; onClick: () => void };
  durationMs?: number;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface FeedbackApi {
  toast(message: string, options?: ToastOptions): void;
  /** Resolves true when the user confirms. */
  confirm(options: ConfirmOptions): Promise<boolean>;
  /** Shows a write error as a toast (use as `.catch(reportError)`). */
  reportError(err: unknown): void;
}

export const FeedbackContext = createContext<FeedbackApi | null>(null);

export function useFeedback(): FeedbackApi {
  const api = useContext(FeedbackContext);
  if (!api) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return api;
}

export function errorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'permission-denied':
      return 'Aquesta tablet no té permís per desar canvis. Torna-la a vincular.';
    case 'resource-exhausted':
      return "S'ha superat el límit gratuït de Firebase per avui.";
    case 'invalid-argument':
      return 'Les dades no són vàlides (potser la foto és massa gran).';
    default:
      return "No s'ha pogut desar el canvi.";
  }
}
