import { useCallback, useEffect, useState } from "react";
import { listActiveOffers, type OfferRow } from "./api";
import { subscribeActiveOffers } from "./realtime";

export function useLiveOffers(bidId?: string) {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [status, setStatus] = useState("init");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await listActiveOffers(bidId);
    if (err) setError(err);
    else {
      setError(null);
      setOffers(data ?? []);
    }
  }, [bidId]);

  useEffect(() => {
    void refresh();
    const unsub = subscribeActiveOffers<OfferRow & Record<string, unknown>>(
      {
        onInsert: (row) => {
          if (row.status && row.status !== "active") return;
          if (bidId && row.bid_id && row.bid_id !== bidId) return;
          setOffers((prev) => (prev.some((o) => o.id === row.id) ? prev : [row as OfferRow, ...prev]));
        },
        onUpdate: (row) => {
          setOffers((prev) => {
            if (row.status && row.status !== "active") return prev.filter((o) => o.id !== row.id);
            return prev.map((o) => (o.id === row.id ? (row as OfferRow) : o));
          });
        },
        onDelete: (row) => setOffers((prev) => prev.filter((o) => o.id !== row.id)),
        onStatus: setStatus,
      },
      bidId,
    );
    return unsub;
  }, [bidId, refresh]);

  return { offers, status, error, refresh };
}
