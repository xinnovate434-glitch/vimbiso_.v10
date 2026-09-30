import { config } from "./config";
import { listOnlineTraders } from "./api";

/** City centres in Zimbabwe for heat map cells */
export const ZW_CELLS: { id: string; name: string; lat: number; lng: number }[] = [
  { id: "harare", name: "Harare", lat: -17.8292, lng: 31.0522 },
  { id: "chitungwiza", name: "Chitungwiza", lat: -18.0127, lng: 31.0756 },
  { id: "bulawayo", name: "Bulawayo", lat: -20.1325, lng: 28.6265 },
  { id: "mutare", name: "Mutare", lat: -18.9707, lng: 32.6709 },
  { id: "gweru", name: "Gweru", lat: -19.45, lng: 29.8167 },
  { id: "kwekwe", name: "Kwekwe", lat: -18.9281, lng: 29.8149 },
  { id: "masvingo", name: "Masvingo", lat: -20.0637, lng: 30.8277 },
  { id: "avondale", name: "Avondale", lat: -17.8, lng: 31.03 },
  { id: "mbare", name: "Mbare", lat: -17.86, lng: 31.04 },
];

export type HeatCell = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Relative demand / activity 0–1 */
  intensity: number;
  traders: number;
};

/**
 * Build heat cells from live traders in DB + baseline activity.
 */
export async function buildHeatCells(): Promise<HeatCell[]> {
  const { data } = await listOnlineTraders();
  const byCity: Record<string, number> = {};
  for (const t of data ?? []) {
    const c = (t.city || "Harare").toLowerCase();
    byCity[c] = (byCity[c] || 0) + 1;
  }
  const max = Math.max(1, ...Object.values(byCity));
  return ZW_CELLS.map((cell) => {
    const key = cell.name.toLowerCase();
    const traders = byCity[key] || 0;
    // slight baseline so map is never empty
    const intensity = traders === 0 ? 0 : Math.min(1, traders / max);
    return { ...cell, intensity, traders };
  });
}

export function mapboxStaticUrl(lat: number, lng: number, zoom = 10): string | null {
  const token = config.mapbox.token;
  if (!token) return null;
  // Simple static map; interactive map needs mapbox-gl in the client
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `${lng},${lat},${zoom},0/600x320@2x?access_token=${token}`
  );
}
