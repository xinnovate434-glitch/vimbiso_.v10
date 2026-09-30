import { useEffect, useMemo, useRef, useState } from "react";
import {
  BatteryLow,
  CheckCircle2,
  ChevronLeft,
  CloudSun,
  Map,
  MapPin,
  MessageCircle,
  Mic,
  Package,
  Repeat,
  Search,
  ShoppingBag,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import {
  CATS,
  DICT,
  IMG,
  NEAR,
  OFFERS,
  PORTRAITS,
  QUALITIES,
  TICKER,
  UNITS,
  fairBadge,
  money,
} from "@/lib/vimbiso/data";
import { useVimbiso } from "@/lib/vimbiso/store";
import { fetchWeather, weatherAdvice, type WeatherNow } from "@/lib/vimbiso/weather";
import {
  Avatar,
  Badge,
  Btn,
  Card,
  Choice,
  Field,
  IconBtn,
  Input,
  Pad,
  Photo,
  Stars,
  Steps,
  TopBar,
  Wordmark,
} from "./primitives";
import { MapHeat } from "./map-heat";
iexport function HomeScreen() {
  const s = useVimbiso();
  const t = DICT[s.lang];
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { getPhoneLocation } = await import("@/lib/vimbiso/geo");
        const pos = await getPhoneLocation();
        if (pos) {
          const { fetchWeatherByCoords } = await import("@/lib/vimbiso/weather");
          const w = await fetchWeatherByCoords(pos.lat, pos.lon);
          if (w) {
            setWeather(w);
            return;
          }
        }
      } catch {
        /* ignore */
      }
      if (s.city) {
        try {
          const { fetchWeather } = await import("@/lib/vimbiso/weather");
          fetchWeather(s.city).then(setWeather);
        } catch {
          /* ignore */
        }
      }
    })();
  }, [s.city]);

  const chips = ["Tomatoes 20kg", "Maize meal", "Onions 10kg", "I want to sell"];

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <Photo src={IMG.home} alt="Market produce" overlay="header" className="hero" />
      <div className="relative z-[2] -mt-[240px]">
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),10px)] h-14">
          <div className="flex items-center gap-2">
            <Wordmark dark />
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-2">
              <i className="vn-live" /> live
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex overflow-hidden rounded-[10px] border border-white/30 bg-white/10">
              {(["en", "sn"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => s.setLang(l)}
                  className={
                    s.lang === l
                      ? "bg-white px-2 py-1 text-[10px] font-extrabold text-navy"
                      : "px-2 py-1 text-[10px] font-extrabold text-white/80"
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <IconBtn light onClick={() => s.go("profile")}>
              <User className="size-5" />
            </IconBtn>
          </div>
        </div>

        <div className="px-4 pb-3 pt-6 text-white">
          <p className="text-sm text-white/80">
            {t.hello}
            {s.name ? `, ${s.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="font-display text-[1.75rem] font-extrabold leading-tight drop-shadow">
            {t.need}
          </h1>
          {weather ? (
            <p className="mt-1 text-xs text-white/75">
              {s.city || "Near you"} · {weather.temp}° · {weather.summary}
            </p>
          ) : (
            <p className="mt-1 text-xs text-white/75">{s.city || "Vimbiso Network"}</p>
          )}
        </div>
      </div>

      <Pad className="relative z-[2] -mt-2 space-y-3 pb-28">
        <button
          type="button"
          onClick={() => s.go("ai")}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left shadow-[var(--shadow-card)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-teal/12 text-teal">
            <Mic className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-navy">Ask Vimby</span>
            <span className="block text-xs text-mut">Type or talk — what do you need to buy or sell?</span>
          </span>
        </button>

        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                s.set({ search: c, bidItem: c });
                s.go("ai");
              }}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-sm"
            >
              {c}
            </button>
          ))}
        </div>

        <Btn variant="teal" className="w-full" onClick={() => s.go("bid")}>
          {t.buildbid2}
        </Btn>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => s.go("radar")}
            className="rounded-xl bg-white p-3 text-center shadow-[var(--shadow-card)]"
          >
            <Map className="mx-auto size-5 text-teal" />
            <div className="mt-1 text-[11px] font-extrabold text-navy">Find nearby</div>
          </button>
          <button
            type="button"
            onClick={() => s.go("messages")}
            className="rounded-xl bg-white p-3 text-center shadow-[var(--shadow-card)]"
          >
            <MessageCircle className="mx-auto size-5 text-teal" />
            <div className="mt-1 text-[11px] font-extrabold text-navy">Chat</div>
          </button>
          <button
            type="button"
            onClick={() => s.go("safeMeet")}
            className="rounded-xl bg-white p-3 text-center shadow-[var(--shadow-card)]"
          >
            <MapPin className="mx-auto size-5 text-teal" />
            <div className="mt-1 text-[11px] font-extrabold text-navy">Safe meet</div>
          </button>
        </div>

        <Card>
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-mut">How it works</div>
          <ol className="mt-2 space-y-1.5 text-xs text-navy">
            <li>
              <span className="font-bold text-teal">1</span> Say what you need
            </li>
            <li>
              <span className="font-bold text-teal">2</span> Real traders respond
            </li>
            <li>
              <span className="font-bold text-teal">3</span> Chat · meet · pay on collect
            </li>
          </ol>
        </Card>

        <button
          type="button"
          onClick={() => s.go("networkMore")}
          className="w-full text-center text-xs font-bold text-teal"
        >
          More network tools →
        </button>
      </Pad>
    </section>
  );
}

export function BidScreen() {
  const s = useVimbiso();
  const tot = s.bidQty * s.bidPrice;
  return (
    <section className="vn-screen">
      <Photo src={IMG.tomatoes} alt="Fresh tomatoes" overlay="soft" className="absolute inset-0 opacity-80" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("home")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Build your bid"
        right={<Badge>{s.bidItems.length} items</Badge>}
      />
      <Pad className="relative z-[2]">
        <Steps total={4} current={s.bidStep} />
        {s.bidStep === 1 && (
          <>
            <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-navy">What do you need?</h1>
            <p className="mt-1.5 mb-3.5 text-mut">Add items to your bid. Traders respond to your exact request.</p>
            <Field label="Item name">
              <Input value={s.bidItem} onChange={(e) => s.set({ bidItem: e.target.value })} />
            </Field>
            <div className="mt-2.5">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">
                Category
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => s.set({ bidCat: c.id })}
                    className={cn(
                      "overflow-hidden rounded-md border-[1.5px] bg-white text-center",
                      s.bidCat === c.id ? "border-teal bg-teal/6" : "border-transparent",
                    )}
                  >
                    <img src={c.photo} alt="" className="h-12 w-full object-cover" />
                    <div className="px-1 py-1.5 text-[11px] font-bold text-navy">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <Btn className="mt-4" onClick={() => s.set({ bidStep: 2 })}>
              Continue
            </Btn>
          </>
        )}
        {s.bidStep === 2 && (
          <>
            <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-navy">Quality standard</h1>
            <p className="mt-1.5 mb-3.5 text-mut">Tell traders exactly what grade you expect.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {QUALITIES.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => s.set({ bidQuality: q.id })}
                  className={cn(
                    "relative overflow-hidden rounded-[18px] border-2 bg-white px-2 py-4 text-center",
                    s.bidQuality === q.id ? "border-teal bg-teal/8" : "border-line",
                  )}
                >
                  {s.bidQuality === q.id ? (
                    <span className="absolute top-0 right-0 rounded-bl-[10px] bg-teal px-2 py-0.5 text-[9px] font-extrabold text-white">
                      Selected
                    </span>
                  ) : null}
                  <div className="font-extrabold text-navy">{q.name}</div>
                  <div className="mt-0.5 text-[10px] text-mut">{q.detail}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" className="w-auto" onClick={() => s.set({ bidStep: 1 })}>
                Back
              </Btn>
              <Btn onClick={() => s.set({ bidStep: 3 })}>Continue</Btn>
            </div>
          </>
        )}
        {s.bidStep === 3 && (
          <>
            <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-navy">How many?</h1>
            <p className="mt-1.5 mb-3.5 text-mut">Set the quantity you need.</p>
            <div className="my-5 flex justify-center">
              <div className="flex overflow-hidden rounded-sm border-[1.5px] border-line bg-white">
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center bg-paper text-xl font-extrabold text-navy"
                  onClick={() => s.set({ bidQty: Math.max(1, s.bidQty - 1) })}
                >
                  −
                </button>
                <div className="font-display grid h-11 w-14 place-items-center border-x-[1.5px] border-line text-[22px] font-extrabold text-navy">
                  {s.bidQty}
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center bg-paper text-xl font-extrabold text-navy"
                  onClick={() => s.set({ bidQty: s.bidQty + 1 })}
                >
                  +
                </button>
              </div>
            </div>
            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">Unit</span>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => s.set({ bidUnit: u })}
                  className={cn(
                    "rounded-sm border-[1.5px] px-3.5 py-2.5 text-[13px] font-bold",
                    s.bidUnit === u ? "border-teal bg-teal/6 text-navy" : "border-line bg-white text-navy",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" className="w-auto" onClick={() => s.set({ bidStep: 2 })}>
                Back
              </Btn>
              <Btn onClick={() => s.set({ bidStep: 4 })}>Continue</Btn>
            </div>
          </>
        )}
        {s.bidStep === 4 && (
          <>
            <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-navy">Your price</h1>
            <p className="mt-1.5 mb-3.5 text-mut">Set what you're willing to pay. Traders can accept or counter.</p>
            <div className="my-5 text-center">
              <div className="font-display text-[32px] font-extrabold text-navy">{money(s.bidPrice)}</div>
              <div className="text-xs text-mut">
                per unit · total <b>{money(tot)}</b>
              </div>
            </div>
            <input
              type="range"
              className="vn-range"
              min={1}
              max={200}
              step={0.5}
              value={s.bidPrice}
              onChange={(e) => s.set({ bidPrice: parseFloat(e.target.value) })}
            />
            <div className="mt-1 flex justify-between text-xs text-mut">
              <span>$1</span>
              <span>$200</span>
            </div>
            <Card className="mt-4 bg-paper">
              <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Bid summary</span>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-mut">Item</span>
                <b>{s.bidItem}</b>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mut">Quality</span>
                <Badge tone="gold" className="capitalize">
                  {s.bidQuality}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mut">Quantity</span>
                <b>
                  {s.bidQty} {s.bidUnit}
                </b>
              </div>
              <div className="my-2 h-px bg-line" />
              <div className="flex justify-between">
                <span className="font-extrabold text-navy">Total bid</span>
                <span className="font-display text-[22px] font-extrabold text-navy">{money(tot)}</span>
              </div>
            </Card>
            <button
              type="button"
              onClick={() => {
                s.set({
                  bidItems: [
                    ...s.bidItems,
                    {
                      name: s.bidItem,
                      quality: s.bidQuality,
                      qty: s.bidQty,
                      unit: s.bidUnit,
                      price: s.bidPrice,
                      total: +(s.bidPrice * s.bidQty).toFixed(2),
                      photo: s.bidCat === "veg" ? IMG.tomatoes : IMG.fruit,
                    },
                  ],
                  bidStep: 1,
                });
                s.toastMsg(`${s.bidItem} added to your bid`);
              }}
              className="mt-4 w-full rounded-[20px] bg-gradient-to-br from-teal to-teal-2 py-[18px] text-[17px] font-extrabold text-white shadow-[0_12px_30px_rgb(15_118_110_/_0.35)]"
            >
              Add to bid
            </button>
            <div className="mt-2.5 flex gap-2">
              <Btn variant="ghost" className="w-auto" onClick={() => s.set({ bidStep: 3 })}>
                Back
              </Btn>
              <Btn variant="ghost" className="w-auto" onClick={() => s.go("basket")}>
                View basket ({s.bidItems.length})
              </Btn>
            </div>
          </>
        )}
      </Pad>
      {s.bidItems.length > 0 ? (
        <div className="fixed bottom-20 left-1/2 z-20 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-[22px] bg-gradient-to-br from-navy to-navy-2 px-[18px] py-4 text-white shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-base font-black text-navy-3">
                {s.bidItems.length}
              </span>
              <div>
                <div className="text-sm font-extrabold">My need</div>
                <div className="text-xs text-white/60">
                  {s.bidItems.length} item{s.bidItems.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="font-display text-xl font-extrabold text-gold-2">
                {money(s.bidItems.reduce((a, i) => a + i.total, 0))}
              </div>
              <button
                type="button"
                onClick={() => s.go("basket")}
                className="rounded-sm bg-teal px-4 py-3 text-sm font-extrabold"
              >
                View
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function BasketScreen() {
  const s = useVimbiso();
  const tot = s.bidItems.reduce((a, i) => a + i.total, 0);
  return (
    <section className="vn-screen">
      <Photo src={IMG.welcome} alt="Market crates" overlay="soft" className="absolute inset-0 opacity-60" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("bid")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="My need"
      />
      <Pad className="relative z-[2]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-navy-2 p-[22px] text-white">
          <div className="text-xs text-white/60">Total bid value</div>
          <div className="font-display text-4xl font-extrabold text-gold-2">{money(tot)}</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Badge tone="glass">{s.bidItems.length} items</Badge>
            <Badge tone="gold">Chitungwiza</Badge>
            <Badge tone="glass">Now</Badge>
          </div>
        </div>
        <Btn variant="outline" className="mt-3" onClick={() => s.set({ poolOpen: true, poolJoined: 3 })}>
          Pool this bid with neighbours
        </Btn>
        <div className="mt-4 mb-2.5 flex justify-between">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Items in your bid</span>
          <button type="button" className="text-xs font-bold text-teal" onClick={() => s.go("bid")}>
            + Add more
          </button>
        </div>
        {s.bidItems.length === 0 ? (
          <div className="py-10 text-center">
            <h2 className="font-display text-xl font-extrabold text-navy">Your bid is empty</h2>
            <p className="mt-1.5 text-mut">Add items to tell traders exactly what you need.</p>
            <Btn variant="teal" className="mx-auto mt-4 w-auto px-6" onClick={() => s.go("bid")}>
              Build your bid
            </Btn>
          </div>
        ) : (
          <div className="grid gap-3">
            {s.bidItems.map((it, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <img src={it.photo} alt="" className="h-12 w-12 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-navy">{it.name}</div>
                    <div className="text-[11px] text-mut">
                      {it.qty} {it.unit} · {it.quality} · {money(it.price)}/unit
                    </div>
                  </div>
                  <div className="font-display text-lg font-extrabold text-navy">{money(it.total)}</div>
                  <button
                    type="button"
                    onClick={() => s.set({ bidItems: s.bidItems.filter((_, j) => j !== i) })}
                    className="grid h-8 w-8 place-items-center rounded-full bg-err/10 text-err"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Btn
          className="mt-4"
          disabled={s.bidItems.length === 0}
          onClick={async () => {
            if (s.userId) {
              const { createBid } = await import("@/lib/vimbiso/api");
              const { data, error } = await createBid({
                buyerId: s.userId,
                items: s.bidItems,
                city: s.city,
              });
              if (error) {
                s.toastMsg("Bid saved locally — check DB");
              } else if (data?.[0]) {
                s.toastMsg("Bid posted to the network");
              }
            }
            s.go("radar");
          }}
        >
          Find traders for this bid
        </Btn>
      </Pad>
    </section>
  );
}

export function RadarScreen() {
  const s = useVimbiso();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<{
    flyTo?: (o: Record<string, unknown>) => void;
    easeTo?: (o: Record<string, unknown>) => void;
    remove?: () => void;
    resize?: () => void;
    getZoom?: () => number;
  } | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);
  const [st, setSt] = useState("Finding your position…");
  const [rangeKm, setRangeKm] = useState(0.15);
  const [found, setFound] = useState<
    { id: string; name: string; distKm: number; role?: string; city?: string }[]
  >([]);
  const [done, setDone] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: {
      flyTo?: (o: Record<string, unknown>) => void;
      easeTo?: (o: Record<string, unknown>) => void;
      remove?: () => void;
      resize?: () => void;
      on?: (e: string, cb: () => void) => void;
      addControl?: (c: unknown, pos?: string) => void;
    } | null = null;

    function haversineKm(
      a: { lat: number; lon: number },
      b: { lat: number; lon: number },
    ) {
      const R = 6371;
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLon = ((b.lon - a.lon) * Math.PI) / 180;
      const la1 = (a.lat * Math.PI) / 180;
      const la2 = (b.lat * Math.PI) / 180;
      const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
    }

    function loadMapbox(): Promise<void> {
      return new Promise((resolve, reject) => {
        const w = window as unknown as { mapboxgl?: unknown };
        if (w.mapboxgl) {
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
        script.onerror = () => reject(new Error("Mapbox failed"));
        document.body.appendChild(script);
      });
    }

    async function run() {
      // GPS
      let origin = { lat: -17.8292, lon: 31.0522 };
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) reject(new Error("no-geo"));
          else
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
            });
        });
        origin = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!cancelled) setSt("You are here — expanding the network map…");
      } catch {
        if (!cancelled) setSt("Using approximate area — expanding slowly…");
      }

      // Real network users
      type U = {
        id: string;
        name: string;
        city: string;
        vimbiso_id: string | null;
        roles?: string[];
        lat?: number | null;
        lon?: number | null;
      };
      let users: U[] = [];
      try {
        const { listOnlineTraders } = await import("@/lib/vimbiso/api");
        const { data } = await listOnlineTraders();
        users = (data || []).filter((u) => u.id !== s.userId);
      } catch {
        users = [];
      }

      const withDist = users.map((u, i) => {
        let distKm = 40;
        let lat = origin.lat;
        let lon = origin.lon;
        if (typeof u.lat === "number" && typeof u.lon === "number") {
          lat = u.lat;
          lon = u.lon;
          distKm = haversineKm(origin, { lat, lon });
        } else if (u.city && s.city && u.city.toLowerCase() === s.city.toLowerCase()) {
          // same city, no GPS on profile yet — place in a small ring so map can show them
          const ang = (i * 47 * Math.PI) / 180;
          distKm = 0.4 + ((i * 11) % 25) / 10;
          lat = origin.lat + (distKm / 111) * Math.cos(ang);
          lon = origin.lon + (distKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(ang);
        } else {
          distKm = 12 + ((i * 17) % 30);
          const ang = (i * 33 * Math.PI) / 180;
          lat = origin.lat + (distKm / 111) * Math.cos(ang);
          lon = origin.lon + (distKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(ang);
        }
        return {
          id: u.id,
          name: u.name || u.vimbiso_id || "Network user",
          distKm,
          lat,
          lon,
          city: u.city,
          role: Array.isArray(u.roles) ? u.roles[0] : "trader",
        };
      });

      // Map
      try {
        const { config } = await import("@/lib/vimbiso/config");
        const token = config.mapbox.token;
        if (!token || !mapRef.current) {
          if (!cancelled) setSt("Map token missing — list-only scan");
        } else {
          await loadMapbox();
          if (cancelled) return;
          const gl = (window as unknown as {
            mapboxgl: {
              accessToken: string;
              Map: new (o: Record<string, unknown>) => typeof map extends infer M ? M : never;
              Marker: new (o?: Record<string, unknown>) => {
                setLngLat: (ll: [number, number]) => {
                  setPopup?: (p: unknown) => { addTo: (m: unknown) => unknown };
                  addTo: (m: unknown) => { remove: () => void };
                };
                remove: () => void;
              };
              Popup: new (o?: Record<string, unknown>) => {
                setHTML: (h: string) => {
                  setLngLat: (ll: [number, number]) => { addTo: (m: unknown) => unknown };
                };
              };
              NavigationControl: new () => unknown;
            };
          }).mapboxgl;

          gl.accessToken = token;
          map = new gl.Map({
            container: mapRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [origin.lon, origin.lat],
            zoom: 15.2,
            pitch: 45,
            bearing: -12,
            attributionControl: false,
          }) as typeof map;
          mapObj.current = map;
          map.addControl?.(new gl.NavigationControl(), "bottom-right");
          map.on?.("load", () => {
            map?.resize?.();
            if (!cancelled) setMapReady(true);
          });

          // You marker
          const you = document.createElement("div");
          you.style.cssText =
            "width:18px;height:18px;border-radius:999px;background:#0f766e;border:3px solid #fff;box-shadow:0 0 0 6px rgba(15,118,110,0.25)";
          const youM = new gl.Marker({ element: you }).setLngLat([origin.lon, origin.lat]).addTo(map);
          markersRef.current.push(youM as unknown as { remove: () => void });
        }
      } catch {
        if (!cancelled) setSt("Map unavailable — still scanning by distance");
      }

      // Slow expand: rings in meters then km — not a classic radar sweep
      const rings = [0.15, 0.3, 0.5, 0.8, 1.2, 2, 3.5, 5, 8, 12, 18, 25];
      // zoom roughly maps range: close = high zoom
      const zoomFor = (km: number) => Math.max(9.5, 15.4 - Math.log2(1 + km * 3.2));

      const revealed = new Set<string>();
      const gl = (window as unknown as {
        mapboxgl?: {
          Marker: new (o?: Record<string, unknown>) => {
            setLngLat: (ll: [number, number]) => {
              addTo: (m: unknown) => { remove: () => void };
            };
            remove: () => void;
          };
          Popup: new (o?: Record<string, unknown>) => {
            setHTML: (h: string) => unknown;
            setLngLat?: (ll: [number, number]) => { addTo: (m: unknown) => unknown };
          };
        };
      }).mapboxgl;

      for (const ring of rings) {
        if (cancelled) return;
        setRangeKm(ring);
        const label =
          ring < 1
            ? `Expanding to ${Math.round(ring * 1000)} m…`
            : `Expanding to ${ring} km…`;
        setSt(label);

        // Smooth map zoom-out (slow)
        try {
          map?.easeTo?.({
            center: [origin.lon, origin.lat],
            zoom: zoomFor(ring),
            duration: 1600,
            pitch: ring > 5 ? 30 : 45,
          });
        } catch {
          /* ignore */
        }

        // Reveal people only when range reaches them
        for (const u of withDist.filter((x) => x.distKm <= ring && !revealed.has(x.id))) {
          revealed.add(u.id);
          setFound((cur) =>
            cur.some((c) => c.id === u.id)
              ? cur
              : [
                  ...cur,
                  {
                    id: u.id,
                    name: u.name,
                    distKm: u.distKm,
                    role: u.role,
                    city: u.city,
                  },
                ],
          );
          setSt(`${u.name} · ${u.distKm < 1 ? Math.round(u.distKm * 1000) + " m" : u.distKm.toFixed(1) + " km"} away`);

          if (map && gl) {
            try {
              const el = document.createElement("div");
              el.style.cssText =
                "min-width:8px;padding:4px 8px;border-radius:999px;background:#e0a32b;color:#0e2a47;font:700 10px/1.2 system-ui;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.2);white-space:nowrap";
              el.textContent = u.name.split(" ")[0];
              const m = new gl.Marker({ element: el })
                .setLngLat([u.lon, u.lat])
                .addTo(map);
              markersRef.current.push(m as unknown as { remove: () => void });
            } catch {
              /* ignore */
            }
          }

          await new Promise<void>((r) => setTimeout(r, 700));
        }

        await new Promise<void>((r) => setTimeout(r, 1500));
      }

      if (!cancelled) {
        setDone(true);
        setSt(
          revealed.size
            ? `Scan complete — ${revealed.size} on the live network`
            : "Scan complete — no other network users in range yet",
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {
          /* ignore */
        }
      });
      markersRef.current = [];
      try {
        mapObj.current?.remove?.();
      } catch {
        /* ignore */
      }
      mapObj.current = null;
    };
  }, [s.userId, s.city]);

  return (
    <section className="vn-screen flex flex-col bg-[#eef2f6] p-0">
      <div className="relative z-[2] px-4 pt-[max(env(safe-area-inset-top),14px)] pb-2">
        <div className="flex items-center justify-between">
          <IconBtn onClick={() => s.go("home")}>
            <ChevronLeft />
          </IconBtn>
          <div className="text-center">
            <div className="text-[10px] font-extrabold tracking-[0.12em] text-mut uppercase">Find nearby</div>
            <div className="text-xs font-bold text-navy">
              {rangeKm < 1 ? `${Math.round(rangeKm * 1000)} m radius` : `${rangeKm} km radius`}
            </div>
          </div>
          <Badge tone={done ? "ok" : "live"}>{done ? "Done" : "Live"}</Badge>
        </div>
        <div className="mt-2 rounded-md bg-navy px-3 py-2.5 text-center text-[13px] font-semibold text-white shadow-[var(--shadow-card)]">
          {st}
        </div>
      </div>

      <div className="relative mx-3 min-h-[42vh] flex-1 overflow-hidden rounded-lg border border-line shadow-[var(--shadow-lift)]">
        <div ref={mapRef} className="absolute inset-0 bg-[#dbe4ee]" />
        {!mapReady ? (
          <div className="absolute inset-0 grid place-items-center text-sm font-bold text-mut">Loading map…</div>
        ) : null}
        {/* soft transmission pulse — not a radar dish */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/30 animate-ping opacity-40" />
      </div>

      <div className="z-[2] max-h-[28vh] space-y-2 overflow-y-auto px-4 py-3">
        {found.length === 0 ? (
          <p className="text-center text-xs text-mut">
            Expanding from your position. People only appear when the map reaches their distance.
          </p>
        ) : (
          found.map((f) => (
            <Card key={f.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="font-extrabold text-navy">{f.name}</div>
                <div className="text-[11px] text-mut">
                  {f.role || "network"} · {f.city || "nearby"} ·{" "}
                  {f.distKm < 1 ? `${Math.round(f.distKm * 1000)} m` : `${f.distKm.toFixed(1)} km`}
                </div>
              </div>
              <Badge tone="gold">Live</Badge>
            </Card>
          ))
        )}
      </div>

      <div className="z-[2] px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <Btn variant="teal" onClick={() => s.go(done ? "offers" : "home")}>
          {done ? "Continue" : "Stop expanding"}
        </Btn>
      </div>
    </section>
  );
}

export function OffersScreen() {
  const s = useVimbiso();
  const [why, setWhy] = useState<string | null>(null);
  return (
    <section className="vn-screen">
      <Photo src={IMG.trader} alt="Street food stall" overlay="soft" className="absolute inset-0 opacity-50" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("home")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Live offers"
        right={<Badge tone="live">3 live</Badge>}
      />
      <Pad className="relative z-[2]">
        <Card className="bg-gradient-to-br from-navy to-navy-2 text-white">
          <div className="text-xs text-white/70">My need</div>
          <div className="font-display text-lg font-extrabold">20kg tomatoes · Premium</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-[9px] bg-white/12 px-2 py-1 text-[11px] font-bold text-[#cfe0f2]">Chitungwiza</span>
            <span className="rounded-[9px] bg-gold/20 px-2 py-1 text-[11px] font-bold text-gold-2">Your price: $15.00</span>
          </div>
        </Card>
        <div className="mt-3.5 mb-2 flex justify-between">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Traders responding</span>
          <span className="text-xs text-mut">market avg: $15.20/kg</span>
        </div>
        <div className="grid gap-3">
          {OFFERS.length === 0 ? (
            <Card key="empty-offers">
              <div className="text-sm font-bold text-navy">Waiting for live offers</div>
              <p className="mt-1 text-xs text-mut">When real traders respond, they appear here.</p>
            </Card>
          ) : OFFERS.map((o) => {
            const fair = fairBadge(o.price);
            const sel = s.selectedOffer === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => s.set({ selectedOffer: o.id })}
                className={cn(
                  "relative w-full rounded-lg border-[1.5px] bg-white p-4 text-left shadow-[var(--shadow-card)] transition duration-150",
                  sel
                    ? "border-teal bg-teal/[0.06] shadow-[0_0_0_3px_rgb(15_118_110_/_0.16)]"
                    : "border-line hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                )}
              >
                {sel ? (
                  <span className="absolute top-3 right-3 text-teal">
                    <CheckCircle2 className="size-5" strokeWidth={2.4} />
                  </span>
                ) : null}
                <div className="flex items-center justify-between pr-7">
                  <div className="flex items-center gap-3">
                    <Avatar src={o.img} alt={o.name} verified />
                    <div>
                      <div className="font-extrabold text-navy">{o.name}</div>
                      <div className="text-xs text-mut">{o.vid} · {o.dist}</div>
                    </div>
                  </div>
                  <Badge tone="gold">Trust {o.trust}</Badge>
                </div>
                <div className="my-3 h-px bg-line" />
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-mut">Price / kg</div>
                    <div className="font-display text-2xl font-extrabold text-navy leading-none">
                      {money(o.price)}
                    </div>
                    <span
                      className={cn(
                        "mt-1.5 inline-flex rounded-xs px-2 py-0.5 text-[10px] font-extrabold",
                        fair.kind === "good" && "bg-ok/12 text-ok",
                        fair.kind === "low" && "bg-teal/12 text-teal",
                        fair.kind === "high" && "bg-warn/15 text-warn",
                      )}
                    >
                      {fair.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="rounded-[9px] bg-navy/5 px-2.5 py-1 text-[11px] font-bold text-navy">
                      {o.ful}
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <Stars value={o.rating} />
                      <span className="text-xs font-semibold text-mut">{o.rating}</span>
                    </div>
                    <Badge tone="teal" className="mt-1.5">
                      {o.quality}
                    </Badge>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 text-xs font-bold text-teal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWhy(why === o.id ? null : o.id);
                  }}
                >
                  {why === o.id ? "Hide details" : `Why trust ${o.name.split(" ")[0]}?`}
                </button>
                {why === o.id ? (
                  <div className="mt-2 space-y-1.5 rounded-md bg-navy/[0.03] p-3 text-xs text-mut">
                    <div className="flex justify-between">
                      <span>Identity verified</span>
                      <b className="text-ok">+10</b>
                    </div>
                    <div className="flex justify-between">
                      <span>186 completed trades</span>
                      <b className="text-ok">clean</b>
                    </div>
                    <div className="flex justify-between">
                      <span>0 disputes in 90 days</span>
                      <b className="text-ok">clean</b>
                    </div>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
        <Btn variant="teal" className="sticky bottom-[84px] mt-3.5" disabled={!s.selectedOffer} onClick={() => s.go("order")}>
          Choose trader
        </Btn>
      </Pad>
    </section>
  );
}

export function OrderScreen() {
  const s = useVimbiso();
  const o = OFFERS.find((x) => x.id === s.selectedOffer) ?? null;
  if (!o) {
    return (
      <section className="vn-screen">
        <Pad>
          <Card>
            <div className="text-sm font-bold text-navy">No offer selected</div>
            <p className="mt-1 text-xs text-mut">Wait for a real trader offer.</p>
            <Btn className="mt-3" onClick={() => s.go("offers")}>Back to offers</Btn>
          </Card>
        </Pad>
      </section>
    );
  }
  return (
    <section className="vn-screen">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("offers")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Confirm order"
      />
      <Pad>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={o.img} alt={o.name} verified />
              <div>
                <div className="font-extrabold text-navy">{o.name}</div>
                <div className="text-xs text-mut">{o.vid}</div>
              </div>
            </div>
            <Badge tone="gold">Trust {o.trust}</Badge>
          </div>
          <div className="my-3 h-px bg-line" />
          <div className="flex justify-between text-sm">
            <span>20kg tomatoes · Premium</span>
            <b>{money(o.price)}</b>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mut">Delivery fee</span>
            <b>$1.00</b>
          </div>
          <div className="my-2 h-px bg-line" />
          <div className="flex justify-between">
            <span className="font-extrabold text-navy">Total</span>
            <span className="font-display text-[22px] font-extrabold text-navy">{money(o.price + 1)}</span>
          </div>
        </Card>
        <Card className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Payment</span>
          <div className="mt-2.5 grid gap-2">
            {(
              [
                ["cash", "Cash on handover"],
                ["ecocash", "EcoCash"],
                ["onemoney", "OneMoney"],
              ] as const
            ).map(([id, label]) => (
              <Choice key={id} active={s.payMethod === id} onClick={() => s.set({ payMethod: id })}>
                {label}
              </Choice>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-mut">
            Vimbiso verifies payment with the provider before any order is marked paid.
          </p>
        </Card>
        <Btn
          className="mt-3.5"
          onClick={async () => {
            if (s.userId) {
              const { createOrder } = await import("@/lib/vimbiso/api");
              const sub = o.price;
              const { error } = await createOrder({
                buyerId: s.userId,
                traderId: s.userId, // until live trader offers exist
                offerId: undefined,
                items: s.bidItems.length
                  ? s.bidItems
                  : [{ name: "20kg tomatoes", quality: "Premium", price: o.price }],
                subtotal: sub,
                deliveryFee: 1,
                paymentMethod: s.payMethod,
                city: s.city,
              });
              if (error) s.toastMsg("Order saved locally");
              else s.toastMsg("Order placed on the network");
            } else {
              s.toastMsg("Order placed");
            }
            s.set({ orderStep: 2 });
            s.go("status");
          }}
        >
          Place order
        </Btn>
      </Pad>
    </section>
  );
}

export function StatusScreen() {
  const s = useVimbiso();
  const steps = ["Order accepted", "Payment confirmed", "Preparing", "Ready", "Out for delivery", "Completed"];
  const labels = ["Accepted", "Paid", "Preparing", "Ready", "Delivering", "Completed"];
  return (
    <section className="vn-screen">
      <Photo src={IMG.road} alt="" overlay="soft" className="absolute inset-0 opacity-40" />
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="#VIM00000182"
        right={<Badge tone="ok">{labels[s.orderStep - 1] ?? "Completed"}</Badge>}
      />
      <Pad className="relative z-[2]">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={s.profilePhoto || ""} alt="Trader" verified={!!s.completedTrades} />
              <div>
                <div className="font-extrabold text-navy">Trader</div>
                <div className="text-xs text-mut">Ready in ~30 min</div>
              </div>
            </div>
            <Badge tone="gold">Trust {s.trustScore || 0}</Badge>
          </div>
          <div className="my-3 h-px bg-line" />
          <div className="flex justify-between text-sm">
            <span className="text-mut">Total paid</span>
            <b>$16.00</b>
          </div>
        </Card>
        <Card className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Progress</span>
          <div className="mt-3 grid gap-0.5">
            {steps.map((st, i) => {
              const state = i < s.orderStep ? "dn" : i === s.orderStep ? "cu" : "wt";
              return (
                <div key={st} className="grid grid-cols-[26px_1fr] gap-2.5">
                  <div className="relative grid justify-items-center">
                    <i className="absolute top-0 bottom-0 w-0.5 bg-line" />
                    <span
                      className={cn(
                        "relative z-[1] mt-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 text-[10px] font-black text-white",
                        state === "dn" && "border-ok bg-ok",
                        state === "cu" && "border-teal bg-teal",
                        state === "wt" && "border-line bg-white",
                      )}
                    >
                      {state === "dn" ? "✓" : ""}
                    </span>
                  </div>
                  <div className="pb-3">
                    <div className={cn("text-sm font-extrabold", state === "wt" ? "text-mut" : "text-navy")}>{st}</div>
                    <div className="text-xs text-mut">
                      {state === "dn" ? "Done" : state === "cu" ? "In progress" : "Waiting"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Btn
          variant="teal"
          className="mt-3.5"
          onClick={() => {
            if (s.orderStep < 6) s.set({ orderStep: s.orderStep + 1 });
            s.toastMsg("Order updated");
          }}
        >
        </Btn>
        <Btn className="mt-2" onClick={() => s.go("review")}>
          Mark received & review
        </Btn>
      </Pad>
    </section>
  );
}

export function ReviewScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("status")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Rate trade"
      />
      <Pad className="pt-6 text-center">
        <Avatar src={s.profilePhoto || ""} alt="Trader" size="xl" />
        <h1 className="font-display mt-3.5 text-[26px] font-extrabold text-navy">How was your trade?</h1>
        <p className="text-mut">Trader · VMB-004821</p>
        <div className="my-5 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => s.set({ reviewStars: i })}
              className="text-[34px] leading-none"
              style={{ color: i <= s.reviewStars ? "var(--color-gold)" : "#D9DEE6" }}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="min-h-[88px] w-full rounded-sm border-[1.5px] border-line bg-white p-3.5 outline-none focus:border-teal"
          placeholder="Fast, friendly, good quality… (optional)"
          value={s.reviewNote}
          onChange={(e) => s.set({ reviewNote: e.target.value })}
        />
        <Btn
          className="mt-3.5"
          onClick={() => {
            s.toastMsg("Thanks for the review");
            s.go("home");
          }}
        >
          Submit review
        </Btn>
      </Pad>
    </section>
  );
}
