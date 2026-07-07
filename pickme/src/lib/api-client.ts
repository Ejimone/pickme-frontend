/**
 * Single fetch wrapper for the PickMe REST API.
 *
 * - Base URL from EXPO_PUBLIC_API_URL (…/api/v1).
 * - Injects `Authorization: Bearer <clerk jwt>` via a registered token getter
 *   (set once in the root layout from Clerk's `getToken`) so non-hook callers
 *   and React Query hooks share one auth path.
 * - Normalises every non-2xx into `ApiError` from the backend envelope
 *   (`error.error.{code,message,details}` — PICKME_API_REFERENCE.md §3).
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  // Surfaced early in dev rather than as a confusing fetch failure later.
  console.warn("[api] EXPO_PUBLIC_API_URL is not set — check your .env");
}

type TokenGetter = () => Promise<string | null>;

let getAuthToken: TokenGetter = async () => null;

/** Register Clerk's getToken so the client can attach the bearer token. */
export function registerTokenGetter(fn: TokenGetter) {
  getAuthToken = fn;
}

export class ApiError extends Error {
  code: string;
  details: Record<string, string[]>;
  status: number;

  constructor(
    message: string,
    code: string,
    details: Record<string, string[]>,
    status: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
  }

  /** First inline error for a field, if the backend returned one. */
  fieldError(field: string): string | undefined {
    return this.details?.[field]?.[0];
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${API_URL}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(
  path: string,
  init: RequestInit & { params?: QueryParams } = {},
): Promise<T> {
  const { params, headers, ...rest } = init;
  const token = await getAuthToken();

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      Accept: "application/json",
      // ngrok free tier serves an HTML interstitial to browsers; this header
      // opts non-browser clients out of it. Harmless against a real backend.
      "ngrok-skip-browser-warning": "true",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const envelope = (data as { error?: Record<string, unknown> } | null)?.error;
    throw new ApiError(
      (envelope?.message as string) ?? "Something went wrong.",
      (envelope?.code as string) ?? "error",
      (envelope?.details as Record<string, string[]>) ?? {},
      res.status,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, params?: QueryParams) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
