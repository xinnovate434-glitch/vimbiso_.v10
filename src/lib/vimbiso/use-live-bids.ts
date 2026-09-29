import { useCallback, useEffect, useState } from "react";
import { listOpenBids, type BidRow } from "./api";
import { subscribeOpenBids } from "./realtime";

export function useLiveBids(city?: string) {
  const [bids, setBids] = useState<BidRow[]>([]);
  const [status, setStatus] = useState("init");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await listOpenBids(city);
    if (err) setError(err);
    else {
      setError(null);
      setBids(data ?? []);
    }
  }, [city]);

  useEffect(() => {
    void refresh();
    const unsub = subscribeOpenBids<BidRow & Record<string, unknown>>({
      onInsert: (row) => {
        if (row.status && row.status !== "open") return;
        setBids((prev) => (prev.some((b) => b.id === row.id) ? prev : [row as BidRow, ...prev]));
      },
      onUpdate: (row) => {
        setBids((prev) => {
          if (row.status && row.status !== "open") return prev.filter((b) => b.id !== row.id);
          return prev.map((b) => (b.id === row.id ? (row as BidRow) : b));
        });
      },
      onDelete: (row) => setBids((prev) => prev.filter((b) => b.id !== row.id)),
      onStatus: setStatus,
    });
    return unsub;
  }, [city, refresh]);

  return { bids, status, error, refresh };
}
