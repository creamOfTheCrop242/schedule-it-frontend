import { HttpErrorResponse } from '@angular/common/http';

/** User-facing message for GET /logs/summaries failures. */
export function logSummaryHttpErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string | string[] } | undefined;
    if (body?.message !== undefined) {
      return Array.isArray(body.message) ? body.message.join('; ') : body.message;
    }
    if (err.status === 404) {
      return 'No saved summary for this period yet. Summaries are generated overnight after each day, week, month, or year ends (in your account time zone).';
    }
    if (err.status === 504 || err.status === 503) {
      return 'The server took too long to finish the summary. Try again in a moment.';
    }
    if (err.status === 0) {
      return 'The request did not complete (network or timeout). Check your connection and try again.';
    }
    return err.message || `Request failed (${err.status})`;
  }
  return 'Something went wrong.';
}
