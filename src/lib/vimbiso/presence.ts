/**
 * Quiet online presence — no spam popups.
 * Heartbeat to localStorage + optional Supabase patch when user id exists.
 */

const KEY = "vimbiso_presence_v1";

export type PresenceSnap = {
  userId: string;
  name: string;
  role: string;
  city: string;
  at: number;
  quiet: boolean;
};

export function setPresence(p: Omit<PresenceSnap, "at">) {
  try {
    const snap: PresenceSnap = { ...p, at: Date.now(), quiet: true };
    localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export function getPresence(): PresenceSnap | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PresenceSnap;
    // stale after 15 min
    if (Date.now() - p.at > 15 * 60 * 1000) return null;
    return p;
  } catch {
    return null;
  }
}

/** Soft badge text — never a forced modal */
export function presenceBadge(online: boolean): string {
  return online ? "On network" : "Away";
}
