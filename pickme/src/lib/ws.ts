/**
 * Thin reconnecting WebSocket helper.
 *
 * Clerk JWT goes in the query string as `?token=` (RN WebSocket can't set
 * headers — PICKME_API_REFERENCE.md §1/§9). Exponential backoff on drop; the
 * socket hooks that consume this (trip/chat/notifications, later stages) refetch
 * the relevant queries on reconnect and only ever write into the Query cache.
 *
 * Close codes: 4001 = bad/absent token, 4003 = valid token, wrong room.
 */

const WS_BASE = process.env.EXPO_PUBLIC_WS_URL;

export interface ReconnectingSocketOptions {
  /** ws path, e.g. `/ws/trips/<id>/` (NOT under /api/v1). */
  path: string;
  /** Returns a fresh Clerk JWT for each (re)connect. */
  getToken: () => Promise<string | null>;
  onMessage: (data: unknown) => void;
  onOpen?: () => void;
  /** Called on close; `permanent` = auth/room rejection, no retry. */
  onClose?: (info: { code: number; permanent: boolean }) => void;
  maxBackoffMs?: number;
}

export interface ReconnectingSocket {
  send: (data: unknown) => void;
  close: () => void;
}

const NON_RETRYABLE = new Set([4001, 4003]);

export function createReconnectingSocket(
  opts: ReconnectingSocketOptions,
): ReconnectingSocket {
  const maxBackoff = opts.maxBackoffMs ?? 30_000;
  let ws: WebSocket | null = null;
  let attempt = 0;
  let closedByUs = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (closedByUs) return;
    const token = await opts.getToken();
    const url = `${WS_BASE}${opts.path}?token=${encodeURIComponent(token ?? "")}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      attempt = 0;
      opts.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        opts.onMessage(JSON.parse(event.data as string));
      } catch {
        // Ignore non-JSON frames.
      }
    };

    ws.onclose = (event) => {
      const permanent = NON_RETRYABLE.has(event.code);
      opts.onClose?.({ code: event.code, permanent });
      if (closedByUs || permanent) return;
      const delay = Math.min(maxBackoff, 1000 * 2 ** attempt);
      attempt += 1;
      retryTimer = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  connect();

  return {
    send: (data) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(typeof data === "string" ? data : JSON.stringify(data));
      }
    },
    close: () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
    },
  };
}
