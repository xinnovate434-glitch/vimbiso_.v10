import { useEffect, useMemo, useState } from "react";
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
    const city = s.city || "Harare";
    fetchWeather(city).then(setWeather);
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
          <p className="text-[13px] font-semibold text-white/80">{t.hello}</p>
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
                    s.toastMsg("Voice not supported on this device — type your need instead");
                    return;
                  }
                  s.toastMsg("Listening…");
                  const text = await listenOnce("en-US");
                  if (text) {
                    s.set({ search: text, bidItem: text });
                    s.toastMsg(`Heard: ${text}`);
                    speak(`You need ${text}`);
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
            [s.rating ? s.rating.toFixed(1) : "—", t.rating],
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
  const [st, setSt] = useState("Waking the network…");
  const [km, setKm] = useState(0.5);
  const [found, setFound] = useState<{ n: string; a: number; r: number; lk: boolean }[]>([]);

  useEffect(() => {
    const seq: [number, string][] = [
      [0.5, "Waking the network…"],
      [1, "Scanning 1 km…"],
      [2, "Expanding to 2 km…"],
      [3, "Checking 3 km traders…"],
      [5, "Widening to 5 km…"],
      [8, "8 km ring…"],
      [12, "12 km — final sweep…"],
    ];
    const fnd = [
      { a: 35, r: 0.62, n: "…" },
      { a: 150, r: 0.5, n: "…" },
      { a: 265, r: 0.74, n: "Mary" },
    ];
    const timers: number[] = [];
    seq.forEach(([k, label], i) => {
      timers.push(window.setTimeout(() => { setKm(k); setSt(label); }, i * 620));
    });
    fnd.forEach((f, i) => {
      timers.push(
        window.setTimeout(() => {
          setFound((cur) => [...cur, { ...f, lk: false }]);
          window.setTimeout(() => {
            setFound((cur) => cur.map((x) => (x.n === f.n ? { ...x, lk: true } : x)));
          }, 420);
        }, 1400 + i * 900),
      );
    });
    timers.push(window.setTimeout(() => s.go("offers"), 1400 + fnd.length * 900 + 1100));
    return () => timers.forEach(clearTimeout);
  }, [s]);

  return (
    <section className="vn-screen p-0">
      <div className="vn-radar">
        <div className="vn-radar-map">
          <img src={IMG.radar} alt="City at dusk while the network scans" />
        </div>
        <div className="vn-radar-grid" />
        <div className="absolute top-[max(env(safe-area-inset-top),18px)] right-0 left-0 z-[6] px-[18px] text-center">
          <div className="text-xs font-semibold text-white/70">Chitungwiza · scanning outward</div>
          <div className="font-display mt-1 text-[22px] font-extrabold text-white">{st}</div>
        </div>
        <div className="vn-dish">
          <div className="vn-ring" />
          <div className="vn-ring r2" />
          <div className="vn-ring r3" />
          <div className="vn-ring r4" />
          <div className="vn-pulse" />
          <div className="vn-pulse p2" />
          <div className="vn-pulse p3" />
          <div className="vn-cross absolute inset-0" />
          <div className="vn-sweep" />
          <div
            className="absolute top-1/2 left-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-teal-2"
            style={{ transform: `translate(-50%, -50%) scale(${0.6 + km / 16})` }}
          >
            {km} km
          </div>
          <div className="vn-center" />
          {found.map((f) => {
            const x = 50 + Math.cos((f.a * Math.PI) / 180) * f.r * 46;
            const y = 50 + Math.sin((f.a * Math.PI) / 180) * f.r * 46;
            return (
              <div
                key={f.n}
                className={cn("vn-blip in", f.lk && "lk")}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span>{f.n} · locked</span>
              </div>
            );
          })}
        </div>
        <div className="absolute right-0 bottom-8 left-0 z-[6] px-6 text-center">
          <div className="font-display text-[30px] font-extrabold text-gold-2">
            {found.filter((f) => f.lk).length} traders
          </div>
          <div className="mt-0.5 text-xs text-white/65">looking for people who have what you need…</div>
          <button
            type="button"
            onClick={() => s.go("offers")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Skip to offers →
          </button>
        </div>
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
              <p className="mt-1 text-xs text-mut">When traders respond to your bid, they appear here in real time.</p>
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
                      <span>{s.completedTrades || 0} completed trades</span>
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
      <section className="vn-screen"><Pad><Card><div className="text-sm font-bold text-navy">No offer selected</div><p className="mt-1 text-xs text-mut">Wait for a real trader offer on your bid.</p><Btn className="mt-3" onClick={() => s.go("offers")}>Back to offers</Btn></Card></Pad></section>
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
              <Avatar src={s.profilePhoto || PORTRAITS.john} alt="Trader" verified />
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
        <Avatar src={s.profilePhoto || PORTRAITS.john} alt="Trader" size="xl" />
        <h1 className="font-display mt-3.5 text-[26px] font-extrabold text-navy">How was your trade?</h1>
        <p className="text-mut">Trader · {s.vimbisoId || "Network"}</p>
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
