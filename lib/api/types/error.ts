/**
 * Transport-level error shape thrown by `request<T>` in `../client.ts`.
 * Lives in its own file so the category type modules don't have to
 * depend on each other or on the client transport.
 */

export interface ApiError {
  status: number;
  message: string;
  /** Raw response body if available, for debugging. */
  body?: unknown;
}