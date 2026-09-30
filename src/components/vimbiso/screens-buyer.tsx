import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  Mic,
  Search,
  Repeat,
  Users,
  Smartphone,
  BatteryLow,
  User,
  ShoppingBag,
  Package,
  CheckCircle2,
  CloudSun,
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
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const s = useVimbiso();
  const t = DICT[s.lang];
  const ticker = useMemo(() => [...TICKER, ...TICKER], []);
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [heat, setHeat] = useState<{ id: string; name: string; intensity: number; traders: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { getPhoneLocation } = await import("@/lib/vimbiso/geo");
      const pos = await getPhoneLocation();
      if (pos) {
        const { fetchWeatherByCoords } = await import("@/lib/vimbiso/weather");
        const w = await fetchWeatherByCoords(pos.lat, pos.lon);
        if (w) { setWeather(w); return; }
      }
      if (s.city) fetchWeather(s.city).then(setWeather);
    })();
    import("@/lib/vimbiso/heatmap").then(({ buildHeatCells }) => {
      buildHeatCells().then(setHeat).catch(() => {});
    });
  }, [s.city]);

  return (
    <section className="vn-screen">
      <Photo src={IMG.home} alt="Leafy greens stacked at a produce market" overlay="header" className="hero" />
      <div className="relative z-[2] -mt-[280px]">
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),10px)] h-14">
          <div className="flex items-center gap-2.5">
            <Wordmark dark />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-teal-2">
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
            <IconBtn light onClick={() => { s.toggleLite(); s.toastMsg(s.lite ? "Lite mode off" : "Lite mode on — saving data"); }}>
              <BatteryLow className="size-[18px]" />
            </IconBtn>
            <IconBtn light onClick={() => s.go("profile")}>
              <User className="size-[18px]" />
            </IconBtn>
          </div>
        </div>
        <div className="px-[18px] pt-4 pb-5">
          <p className="text-[13px] font-semibold text-white/80">{s.name ? `Hi, ${s.name}` : t.hello}</p>
          <h1 className="font-display mt-1 text-[28px] font-extrabold text-white">{t.need}</h1>
          <div className="mt-4 flex items-center gap-2.5 rounded-[18px] bg-white py-1.5 pr-1.5 pl-4 shadow-[var(--shadow-lift)]">
            <Search className="size-5 shrink-0 text-mut" />
            <input
              value={s.search}
              onChange={(e) => s.set({ search: e.target.value })}
              placeholder="Tomatoes, charger, plumber…"
              className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                s.set({ voiceOn: true });
                try {
                  const { canListen, listenOnce, speak } = await import("@/lib/vimbiso/voice");
                  if (!canListen()) {
                    s.toastMsg("Voice not supported — type your need instead");
                    return;
                  }
                  s.toastMsg("Listening… speak now");
                  const text = await listenOnce("en-US");
                  if (text) {
                    s.set({ search: text, bidItem: text });
                    s.toastMsg("Heard: " + text);
                    speak("You need " + text);
                  }
                } catch (e) {
                  s.toastMsg(e instanceof Error ? e.message : "Voice failed");
                } finally {
                  s.set({ voiceOn: false });
                }
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-2 text-white shadow-[0_6px_16px_rgb(15_118_110_/_0.35)]"
              aria-label="Search by voice"
            >
              <Mic className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => s.go("bid")}
              className="rounded-[13px] bg-teal px-4 py-3 text-sm font-extrabold text-white"
            >
              {t.buildbid}
            </button>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                s.set({
                  bidItems: [
                    {
                      name: "Tomatoes",
                      quality: "Premium",
                      qty: 20,
                      unit: "kg",
                      price: 15,
                      total: 300,
                      photo: IMG.tomatoes,
                    },
                  ],
                });
                s.toastMsg("Loaded your last order");
                s.go("basket");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-[var(--shadow-card)]"
            >
              <Repeat className="size-3.5" /> Reorder: 20kg tomatoes
            </button>
            <button
              type="button"
              onClick={() => s.go("bid")}
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-[var(--shadow-card)]"
            >
              <Users className="size-3.5" /> Pool a group buy
            </button>
            <button
              type="button"
              onClick={() => s.go("ussd")}
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-[var(--shadow-card)]"
            >
              <Smartphone className="size-3.5" /> USSD mode
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-24">
        <div className="flex overflow-hidden rounded-md bg-navy text-white shadow-[var(--shadow-card)]">
          {[
            ["—", t.online],
            ["—", t.matched],
            [s.rating ? String(s.rating) : "—", t.rating],
          ].map(([v, k], i) => (
            <div key={k} className="relative flex-1 px-1.5 py-3 text-center">
              {i > 0 ? <i className="absolute top-[18%] left-0 h-[64%] w-px bg-white/16" /> : null}
              <div className="font-display text-[17px] font-extrabold text-gold-2">{v}</div>
              <div className="mt-0.5 text-[10px] font-semibold text-white/70">{k}</div>
            </div>
          ))}
        </div>

        {/* Live weather */}
        {weather ? (
          <Card className="mt-3.5 flex items-center gap-3 bg-gradient-to-r from-navy/5 to-teal/5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">
              <CloudSun className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-extrabold text-navy">
                  {weather.temp}°C
                </span>
                <span className="text-xs font-semibold text-mut capitalize">
                  {weather.description} · {weather.city}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-mut">
                {weatherAdvice(weather, s.role === "trader" ? "trader" : s.role === "delivery" ? "delivery" : "buyer")}
              </p>
            </div>
          </Card>
        ) : null}

        {/* Pending approval banner */}
        {s.userStatus === "pending" && s.userId ? (
          <div className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-xs font-semibold text-gold-d">
            Your account is waiting for admin approval. You can browse, but trading unlocks after approval.
          </div>
        ) : null}

        {/* Demand heat map (cells) */}
        {heat.length > 0 ? (
          <Card className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">
                Demand heat map
              </span>
              <button type="button" onClick={() => s.go("radar")} className="text-xs font-bold text-teal">
                Open radar
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              {heat.slice(0, 9).map((c) => (
                <div
                  key={c.id}
                  className="rounded-md px-2 py-2 text-center"
                  style={{
                    background: `rgba(15, 118, 110, ${0.12 + c.intensity * 0.55})`,
                  }}
                >
                  <div className="text-[10px] font-bold leading-tight text-navy">{c.name}</div>
                  <div className="text-[9px] text-mut">{c.traders} traders</div>
                </div>
              ))}
            </div>
            <div className="mt-3 overflow-hidden rounded-lg">
              <MapHeat height={220} />
            </div>
          </Card>
        ) : null}

        {/* Quick actions */}
        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => s.go("bid")}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal/12 text-teal">
              <ShoppingBag className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-extrabold text-navy">New bid</span>
          </button>
          <button
            type="button"
            onClick={() => s.go("radar")}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-navy/8 text-navy">
              <Search className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-extrabold text-navy">Scan radar</span>
          </button>
          <button
            type="button"
            onClick={() => s.go("status")}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold-d">
              <Package className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-extrabold text-navy">My orders</span>
          </button>
        </div>

        <div className="vn-ticker mt-3">
          <div className="vn-ticker-track">
            {ticker.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy">
                <i className="h-1.5 w-1.5 rounded-full bg-teal-2" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">{t.categories}</span>
            <button type="button" onClick={() => s.go("bid")} className="text-xs font-bold text-teal">
              {t.buildbid2}
            </button>
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  s.set({ bidCat: c.id, bidStep: 1 });
                  s.go("bid");
                }}
                className="overflow-hidden rounded-md bg-white text-center shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <img src={c.photo} alt="" className="h-14 w-full object-cover" />
                <div className="px-1 py-2 text-[11px] font-bold leading-tight text-navy">{c.name}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4.5">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">{t.toptraders}</span>
          <div className="mt-2.5 grid gap-3">
            {NEAR.length === 0 ? (
              <Card key="empty-near">
                <div className="text-sm font-bold text-navy">No traders on the network yet</div>
                <p className="mt-1 text-xs text-mut">Post a bid — real traders respond. No demo profiles.</p>
                <button type="button" className="mt-3 text-xs font-bold text-teal" onClick={() => s.go("bid")}>Build a bid</button>
              </Card>
            ) : NEAR.map((n) => (
              <Card key={n.name} onClick={() => s.go("bid")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={n.img} alt={n.name} verified />
                    <div>
                      <div className="font-extrabold text-navy">{n.name}</div>
                      <div className="text-xs text-mut">
                        {n.stock} · {n.dist}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge tone="gold">Trust {n.trust}</Badge>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <Stars value={n.rating} />
                      <span className="text-xs text-mut">{n.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
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
                <div className="text-sm font-extrabold">Your bid</div>
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
        title="Your bid"
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
        <Btn variant="outline" className="mt-3" onClick={() => s.set({ poolOpen: true })}>
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
    setView?: (c: [number, number], z: number) => void;
    remove?: () => void;
    fitBounds?: (b: unknown) => void;
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
    const timers: number[] = [];

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

    function loadLeaflet(): Promise<{
      map: (el: HTMLElement, o: Record<string, unknown>) => {
        setView: (c: [number, number], z: number) => unknown;
        remove: () => void;
        addLayer: (l: unknown) => void;
      };
      tileLayer: (url: string, o: Record<string, unknown>) => unknown;
      marker: (c: [number, number], o?: Record<string, unknown>) => {
        addTo: (m: unknown) => { remove: () => void; bindPopup: (h: string) => unknown };
        remove: () => void;
      };
      divIcon: (o: Record<string, unknown>) => unknown;
    }> {
      return new Promise((resolve, reject) => {
        const w = window as unknown as { L?: unknown };
        if (w.L) {
          resolve(w.L as never);
          return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve((window as unknown as { L: never }).L);
        script.onerror = () => reject(new Error("map load failed"));
        document.body.appendChild(script);
      });
    }

    async function run() {
      // GPS first (fast timeout)
      let origin = { lat: -17.8292, lon: 31.0522 };
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) reject(new Error("no-geo"));
          else
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 60_000,
            });
        });
        origin = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!cancelled) setSt("You are here — expanding…");
      } catch {
        if (!cancelled) setSt("Using area centre — expanding…");
      }

      // Start map ASAP (Leaflet + OpenStreetMap — no token, loads fast)
      let L: Awaited<ReturnType<typeof loadLeaflet>> | null = null;
      let map: {
        setView: (c: [number, number], z: number) => unknown;
        remove: () => void;
        addLayer: (l: unknown) => void;
      } | null = null;
      try {
        L = await loadLeaflet();
        if (cancelled || !mapRef.current) return;
        map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
        map.setView([origin.lat, origin.lon], 15);
        map.addLayer(
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          }),
        );
        mapObj.current = map;
        if (!cancelled) setMapReady(true);

        const youIcon = L.divIcon({
          className: "",
          html: '<div style="width:16px;height:16px;border-radius:99px;background:#0f766e;border:3px solid #fff;box-shadow:0 0 0 5px rgba(15,118,110,.25)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const youM = L.marker([origin.lat, origin.lon], { icon: youIcon }).addTo(map);
        markersRef.current.push(youM as unknown as { remove: () => void });
      } catch {
        if (!cancelled) {
          setMapReady(true);
          setSt("Map offline — still scanning by distance");
        }
      }

      // Real network users only
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
          const ang = (i * 47 * Math.PI) / 180;
          distKm = 0.4 + ((i * 11) % 25) / 10;
          lat = origin.lat + (distKm / 111) * Math.cos(ang);
          lon =
            origin.lon +
            (distKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(ang);
        } else {
          distKm = 12 + ((i * 17) % 30);
          const ang = (i * 33 * Math.PI) / 180;
          lat = origin.lat + (distKm / 111) * Math.cos(ang);
          lon =
            origin.lon +
            (distKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(ang);
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

      const rings = [0.15, 0.3, 0.5, 0.8, 1.2, 2, 3.5, 5, 8, 12, 18, 25];
      const zoomFor = (km: number) => Math.max(10, 15.5 - Math.log2(1 + km * 3));
      const revealed = new Set<string>();

      for (const ring of rings) {
        if (cancelled) return;
        setRangeKm(ring);
        setSt(ring < 1 ? `Expanding to ${Math.round(ring * 1000)} m…` : `Expanding to ${ring} km…`);
        try {
          map?.setView([origin.lat, origin.lon], zoomFor(ring));
        } catch {
          /* ignore */
        }

        for (const u of withDist.filter((x) => x.distKm <= ring && !revealed.has(x.id))) {
          revealed.add(u.id);
          setFound((cur) =>
            cur.some((c) => c.id === u.id)
              ? cur
              : [...cur, { id: u.id, name: u.name, distKm: u.distKm, role: u.role, city: u.city }],
          );
          setSt(
            `${u.name} · ${u.distKm < 1 ? Math.round(u.distKm * 1000) + " m" : u.distKm.toFixed(1) + " km"}`,
          );
          if (map && L) {
            try {
              const icon = L.divIcon({
                className: "",
                html: `<div style="padding:3px 8px;border-radius:99px;background:#e0a32b;color:#0e2a47;font:700 10px system-ui;border:2px solid #fff;white-space:nowrap">${u.name.split(" ")[0]}</div>`,
                iconSize: [60, 24],
                iconAnchor: [30, 12],
              });
              const m = L.marker([u.lat, u.lon], { icon }).addTo(map);
              markersRef.current.push(m as unknown as { remove: () => void });
            } catch {
              /* ignore */
            }
          }
          await new Promise<void>((r) => {
            timers.push(window.setTimeout(() => r(), 500));
          });
        }

        await new Promise<void>((r) => {
          timers.push(window.setTimeout(() => r(), 900));
        });
      }

      if (!cancelled) {
        setDone(true);
        setSt(
          revealed.size
            ? `Done — ${revealed.size} on the live network`
            : "Done — no other network users in range yet",
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
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
            <div className="text-[10px] font-extrabold tracking-[0.12em] text-mut uppercase">
              Network map
            </div>
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
        <div ref={mapRef} className="absolute inset-0 z-0 bg-[#dbe4ee]" />
        {!mapReady ? (
          <div className="absolute inset-0 z-[1] grid place-items-center text-sm font-bold text-mut">
            Starting map…
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.08),transparent_55%)]" />
      </div>

      <div className="z-[2] max-h-[28vh] space-y-2 overflow-y-auto px-4 py-3">
        {found.length === 0 ? (
          <p className="text-center text-xs text-mut">
            Expanding from your GPS. Real network users only appear when the range reaches them.
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
          <div className="text-xs text-white/70">Your bid</div>
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
            s.go("receipt");
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
              <Avatar src={PORTRAITS.john} alt="Trader" verified />
              <div>
                <div className="font-extrabold text-navy">Trader</div>
                <div className="text-xs text-mut">Ready in ~30 min</div>
              </div>
            </div>
            <Badge tone="gold">Trust 94</Badge>
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
        <Avatar src={PORTRAITS.john} alt="Trader" size="xl" />
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
