/**
 * Supabase Realtime (WebSocket) + reconnection for Vimbiso.
 * Run migrations/realtime.sql so tables are in supabase_realtime publication.
 */
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type RealtimeHandlers<T extends Record<string, unknown> = Record<string, unknown>> = {
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
  onStatus?: (status: string) => void;
};

type SubOpts = {
  filter?: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  /** Max reconnect attempts (default unlimited-ish) */
  maxRetries?: number;
};

const DEFAULT_MAX = 20;

/**
 * Subscribe with automatic resubscribe on CHANNEL_ERROR / TIMED_OUT / CLOSED.
 * Returns unsubscribe that stops reconnects.
 */
export function subscribeTable<T extends Record<string, unknown>>(
  table: string,
  handlers: RealtimeHandlers<T>,
  opts?: SubOpts,
): () => void {
  const sb = getSupabase();
  if (!sb) {
    handlers.onStatus?.("no-client");
    return () => {};
  }

  let disposed = false;
  let channel: RealtimeChannel | null = null;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const maxRetries = opts?.maxRetries ?? DEFAULT_MAX;
  const event = opts?.event ?? "*";
  const filter = opts?.filter;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const attach = () => {
    if (disposed) return;
    clearTimer();
    if (channel) {
      void sb.removeChannel(channel);
      channel = null;
    }

    const name = `vimbiso:${table}:${filter ?? "all"}:${attempt}`;
    channel = sb
      .channel(name)
      .on(
        // @ts-expect-error realtime filter typing
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: { eventType?: string; new?: T; old?: T }) => {
          const et = payload.eventType;
          if (et === "INSERT" && payload.new) handlers.onInsert?.(payload.new);
          else if (et === "UPDATE" && payload.new) handlers.onUpdate?.(payload.new);
          else if (et === "DELETE" && payload.old) handlers.onDelete?.(payload.old);
        },
      )
      .subscribe((status) => {
        handlers.onStatus?.(String(status));
        if (disposed) return;
        if (status === "SUBSCRIBED") {
          attempt = 0;
          return;
        }
        // Reconnect on failure / close
        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          if (attempt >= maxRetries) {
            handlers.onStatus?.("reconnect-exhausted");
            return;
          }
          attempt += 1;
          const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
          handlers.onStatus?.(`reconnecting:${attempt}:${delay}ms`);
          clearTimer();
          timer = setTimeout(attach, delay);
        }
      });
  };

  attach();

  // Browser: reconnect when tab comes back online
  const onOnline = () => {
    if (disposed) return;
    handlers.onStatus?.("online-resync");
    attempt = 0;
    attach();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
  }

  return () => {
    disposed = true;
    clearTimer();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onOnline);
    }
    if (channel) void sb.removeChannel(channel);
    channel = null;
  };
}

export function subscribeOpenBids<T extends Record<string, unknown>>(
  handlers: RealtimeHandlers<T>,
) {
  return subscribeTable<T>("bids", handlers, { filter: "status=eq.open" });
}

export function subscribeActiveOffers<T extends Record<string, unknown>>(
  handlers: RealtimeHandlers<T>,
  bidId?: string,
) {
  return subscribeTable<T>("offers", handlers, {
    filter: bidId ? `bid_id=eq.${bidId}` : "status=eq.active",
  });
}

export function subscribeMessages<T extends Record<string, unknown>>(
  threadId: string,
  handlers: RealtimeHandlers<T>,
) {
  return subscribeTable<T>("messages", handlers, {
    filter: `thread_id=eq.${threadId}`,
  });
}

export function realtimeClient(): SupabaseClient | null {
  return getSupabase();
}
