/**
 * Real trust only — from completed trades in DB, never hardcoded demo scores.
 */

export type TrustSnapshot = {
  trustScore: number; // 0–100
  rating: number; // 0–5
  completedTrades: number;
  source: "database" | "none";
};

/** Simple formula: more completed trades + ratings → higher trust. Empty = zeros. */
export function computeTrust(input: {
  completedTrades?: number | null;
  rating?: number | null;
  trustScore?: number | null;
}): TrustSnapshot {
  const completed = Math.max(0, Number(input.completedTrades) || 0);
  const rating = Math.min(5, Math.max(0, Number(input.rating) || 0));
  let score = Number(input.trustScore);
  if (!Number.isFinite(score) || score < 0) {
    // derive when DB has no column value yet
    const base = Math.min(80, completed * 4);
    const rateBoost = rating > 0 ? rating * 4 : 0;
    score = Math.min(100, Math.round(base + rateBoost));
  }
  if (completed === 0 && rating === 0) {
    return { trustScore: 0, rating: 0, completedTrades: 0, source: "none" };
  }
  return {
    trustScore: Math.min(100, Math.max(0, Math.round(score))),
    rating: Math.round(rating * 10) / 10,
    completedTrades: completed,
    source: "database",
  };
}

export function trustLabel(t: TrustSnapshot): string {
  if (t.completedTrades === 0) return "New on network";
  if (t.trustScore >= 80) return "High trust";
  if (t.trustScore >= 50) return "Building trust";
  return "Early trader";
}
