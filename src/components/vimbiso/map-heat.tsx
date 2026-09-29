
import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/vimbiso/config";
import { buildHeatCells, type HeatCell } from "@/lib/vimbiso/heatmap";

type MapLike = {
  on: (e: string, cb: () => void) => void;
  addSource: (id: string, src: unknown) => void;
  addLayer: (layer: unknown) => void;
  remove: () => void;
  flyTo?: (o: Record<string, unknown>) => void;
  addControl?: (c: unknown, pos?: string) => void;
  resize?: () => void;
};

declare global {
  interface Window {
    mapboxgl?: {
      accessToken: string;
      Map: new (opts: Record<string, unknown>) => MapLike;
      NavigationControl: new () => unknown;
      Marker: new (opts?: Record<string, unknown>) => {
        setLngLat: (ll: [number, number]) => { addTo: (m: MapLike) => unknown };
        remove: () => void;
      };
      Popup: new (opts?: Record<string, unknown>) => {
        setLngLat: (ll: [number, number]) => {
          setHTML: (h: string) => { addTo: (m: MapLike) => unknown };
        };
      };
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
    document.body.appendChild(script);
  });
}

function getPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: -17.8292, lon: 31.0522 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve({ lat: -17.8292, lon: 31.0522 }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export function MapHeat({
  className,
  showNearby = true,
}: {
  className?: string;
  showNearby?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [label, setLabel] = useState("Locating you…");

  useEffect(() => {
    let map: MapLike | null = null;
    let dead = false;

    (async () => {
      const token = config.mapbox.token;
      if (!token) {
        setErr("Mapbox token missing (VITE_MAPBOX_TOKEN)");
        return;
      }
      try {
        await loadMapbox();
        if (dead || !ref.current || !window.mapboxgl) return;

        const me = await getPosition();
        if (dead) return;
        setLabel(`You · ${me.lat.toFixed(4)}, ${me.lon.toFixed(4)}`);

        window.mapboxgl.accessToken = token;
        map = new window.mapboxgl.Map({
          container: ref.current,
          // Light streets — not dark
          style: "mapbox://styles/mapbox/streets-v12",
          center: [me.lon, me.lat],
          zoom: 13,
          attributionControl: false,
        });

        map.addControl?.(new window.mapboxgl.NavigationControl(), "top-right");

        map.on("load", async () => {
          if (!map || !window.mapboxgl) return;
          map.resize?.();

          // You are here
          const el = document.createElement("div");
          el.style.width = "18px";
          el.style.height = "18px";
          el.style.borderRadius = "999px";
          el.style.background = "#0f766e";
          el.style.border = "3px solid #fff";
          el.style.boxShadow = "0 0 0 4px rgba(15,118,110,0.25)";
          new window.mapboxgl.Marker({ element: el })
            .setLngLat([me.lon, me.lat])
            .addTo(map);

          // Heat cells around you
          const cells: HeatCell[] = buildHeatCells(me.lat, me.lon);
          if (cells.length) {
            map.addSource("heat", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: cells.map((c) => ({
                  type: "Feature",
                  properties: { w: c.weight },
                  geometry: { type: "Point", coordinates: [c.lon, c.lat] },
                })),
              },
            });
            map.addLayer({
              id: "heat-c",
              type: "circle",
              source: "heat",
              paint: {
                "circle-radius": ["interpolate", ["linear"], ["get", "w"], 0, 8, 1, 28],
                "circle-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "w"],
                  0,
                  "#99f6e4",
                  0.5,
                  "#14b8a6",
                  1,
                  "#0f766e",
                ],
                "circle-opacity": 0.35,
              },
            });
          }

          // Nearby approved traders
          if (showNearby) {
            try {
              const { listOnlineTraders } = await import("@/lib/vimbiso/api");
              const { data } = await listOnlineTraders();
              (data || []).slice(0, 30).forEach((u, i) => {
                if (!map || !window.mapboxgl) return;
                // Without stored lat/lon, place slightly around user by index (UI only until GPS saved on profiles)
                const dlat = ((i % 5) - 2) * 0.008;
                const dlon = (((i * 3) % 5) - 2) * 0.008;
                const mEl = document.createElement("div");
                mEl.style.width = "12px";
                mEl.style.height = "12px";
                mEl.style.borderRadius = "999px";
                mEl.style.background = "#e0a32b";
                mEl.style.border = "2px solid #fff";
                mEl.title = u.name || "Trader";
                new window.mapboxgl.Marker({ element: mEl })
                  .setLngLat([me.lon + dlon, me.lat + dlat])
                  .addTo(map);
              });
            } catch {
              /* ignore */
            }
          }
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Map error");
      }
    })();

    return () => {
      dead = true;
      try {
        map?.remove();
      } catch {
        /* ignore */
      }
    };
  }, [showNearby]);

  if (err) {
    return (
      <div className={className}>
        <div className="rounded-lg bg-navy/5 p-4 text-sm text-mut">{err}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-1 text-[11px] font-bold text-mut">{label}</div>
      <div ref={ref} className="h-[220px] w-full overflow-hidden rounded-lg border border-line" />
      <p className="mt-1 text-[11px] text-mut">
        Teal = you · Gold = network traders (exact pins when profiles save GPS)
      </p>
    </div>
  );
}
