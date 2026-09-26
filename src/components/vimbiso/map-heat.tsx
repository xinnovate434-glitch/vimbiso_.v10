import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/vimbiso/config";
import { buildHeatCells, type HeatCell } from "@/lib/vimbiso/heatmap";

declare global {
  interface Window {
    mapboxgl?: {
      accessToken: string;
      Map: new (opts: Record<string, unknown>) => {
        on: (e: string, cb: () => void) => void;
        addSource: (id: string, src: unknown) => void;
        addLayer: (layer: unknown) => void;
        remove: () => void;
      };
      NavigationControl: new () => unknown;
    };
  }
}

function loadMapbox(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.mapboxgl) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Mapbox failed to load"));
    document.head.appendChild(script);
  });
}

type Props = {
  className?: string;
  height?: number;
};

/** Interactive Mapbox heat map of demand / traders in Zimbabwe */
export function MapHeat({ className, height = 280 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<HeatCell[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    buildHeatCells().then(setCells).catch(() => setCells([]));
  }, []);

  useEffect(() => {
    const token = config.mapbox.token;
    if (!token || !ref.current || cells.length === 0) return;

    let map: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        await loadMapbox();
        if (cancelled || !window.mapboxgl || !ref.current) return;
        window.mapboxgl.accessToken = token;
        const m = new window.mapboxgl.Map({
          container: ref.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [31.05, -17.85],
          zoom: 8.2,
        });
        map = m;
        m.on("load", () => {
          const geojson = {
            type: "FeatureCollection",
            features: cells.map((c) => ({
              type: "Feature",
              properties: {
                name: c.name,
                intensity: c.intensity,
                traders: c.traders,
              },
              geometry: {
                type: "Point",
                coordinates: [c.lng, c.lat],
              },
            })),
          };
          m.addSource("demand", { type: "geojson", data: geojson });
          m.addLayer({
            id: "demand-heat",
            type: "heatmap",
            source: "demand",
            maxzoom: 12,
            paint: {
              "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 12, 1.4],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(0,0,0,0)",
                0.2,
                "rgb(14,42,71)",
                0.4,
                "rgb(15,118,110)",
                0.7,
                "rgb(20,184,166)",
                1,
                "rgb(224,163,43)",
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 28, 12, 50],
              "heatmap-opacity": 0.85,
            },
          });
          m.addLayer({
            id: "demand-points",
            type: "circle",
            source: "demand",
            minzoom: 9,
            paint: {
              "circle-radius": 6,
              "circle-color": "#14b8a6",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          });
          setReady(true);
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Map error");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [cells]);

  if (!config.mapbox.token) {
    return (
      <div className={className} style={{ height }}>
        <p className="p-4 text-sm text-mut">Mapbox token missing</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={ref}
        style={{ height, borderRadius: 16, overflow: "hidden" }}
        className="bg-navy-3"
      />
      {!ready && !err ? (
        <p className="mt-1 text-center text-[11px] text-mut">Loading map…</p>
      ) : null}
      {err ? <p className="mt-1 text-center text-[11px] text-err">{err}</p> : null}
    </div>
  );
}
