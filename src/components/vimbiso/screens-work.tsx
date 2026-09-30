import { useLiveBids } from "@/lib/vimbiso/use-live-bids";
import { useEffect, useState } from "react";
import { ChevronLeft, User, Camera, Bike } from "lucide-react";
import { IMG, JOBS, PORTRAITS } from "@/lib/vimbiso/data";
import { computeTrust, trustLabel } from "@/lib/vimbiso/trust";
import { useVimbiso } from "@/lib/vimbiso/store";
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
  TopBar,
  Wordmark,
} from "./primitives";
import { cn } from "@/lib/utils";

export function TradeScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <Photo src={IMG.trader} alt="Busy street stall" overlay="header" className="mid" />
      <div className="relative z-[2] -mt-[220px]">
        <div className="flex h-14 items-center justify-between px-4 pt-[max(env(safe-area-inset-top),8px)]">
          <Wordmark dark />
          <IconBtn light onClick={() => s.go("profile")}>
            <User className="size-[18px]" />
          </IconBtn>
        </div>
        <div className="px-[18px] pt-2 pb-4">
          <p className="text-[13px] font-semibold text-white/80">Trader mode</p>
          <h1 className="font-display text-[26px] font-extrabold text-white">Ready to trade?</h1>
        </div>
      </div>
      <Pad className="-mt-2">
        <button
          type="button"
          onClick={() => {
            s.set({ online: !s.online });
            s.toastMsg(s.online ? "You are offline" : "You are now online");
          }}
          className={cn(
            "relative w-full overflow-hidden rounded-[26px] px-[18px] py-[26px] text-center text-white shadow-[var(--shadow-lift)]",
            s.online ? "bg-gradient-to-br from-teal to-teal-3" : "bg-gradient-to-br from-navy-2 to-navy",
          )}
        >
          <div className="relative mx-auto mb-3.5 grid h-[84px] w-[84px] place-items-center rounded-full bg-white/10">
            <b className={cn("block h-[34px] w-[34px] rounded-full", s.online ? "bg-white shadow-[0_0_24px_white]" : "bg-[#7c8aa0]")} />
          </div>
          <div className="font-display text-[26px] font-extrabold">{s.online ? "ONLINE" : "GO ONLINE"}</div>
          <div className="mt-1 text-[13px] text-white/80">
            {s.online ? "You're available for new requests" : "Tap to start receiving buyer requests"}
          </div>
        </button>
        <div className="mt-3.5 grid grid-cols-2 gap-3">
          {[
            [s.completedTrades ? String(s.trustScore || 0) : "—", s.completedTrades ? "Trust" : "New on Vimbiso"],
            [s.rating ? `${s.rating.toFixed(1)} rating` : "No ratings yet", "From your trades"],
            [String(s.completedTrades || 0), "Completed trades"],
            [s.online ? "Live" : "0", "Requests"],
          ].map(([v, k]) => (
            <Card key={k}>
              <div className="font-display text-[26px] leading-none font-extrabold text-navy">{v}</div>
              <div className="mt-1 text-[11px] font-bold text-mut">{k}</div>
            </Card>
          ))}
        </div>
        <Card className="mt-3.5 border-[1.5px] border-teal/30 bg-gradient-to-br from-teal/6 to-white" onClick={() => s.go("incoming")}>
          <div className="flex items-center justify-between">
            <div>
              <Badge tone="live">network</Badge>
              <div className="mt-1.5 font-extrabold text-navy">Open buyer requests</div>
              <div className="text-xs text-mut">Tap to see live bids from the network — no demo requests</div>
            </div>
            <span className="rounded-sm bg-teal px-3.5 py-2 text-[13px] font-extrabold text-white">View</span>
          </div>
        </Card>
      </Pad>
    </section>
  );
}

export function IncomingScreen() {
  const s = useVimbiso();
  const [bids, setBids] = useState<
    { id: string; city: string | null; items: unknown; created_at: string }[]
  >([]);

  useEffect(() => {
    import("@/lib/vimbiso/api").then(({ listOpenBids }) => {
      listOpenBids(s.city || undefined).then(({ data }) => {
        if (data?.length) setBids(data);
      });
    });
  }, [s.city]);

  const first = bids[0];
  const items = first?.items;
  const label =
    Array.isArray(items) && items[0] && typeof items[0] === "object" && items[0] !== null && "name" in items[0]
      ? String((items[0] as { name: string }).name)
      : "20kg tomatoes";

  return (
    <section className="vn-screen">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("trade")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Buyer request"
        right={<Badge tone="live">{bids.length ? `${bids.length} open` : "live"}</Badge>}
      />
      <Pad>
        <Card className="border-[1.5px] border-teal/30 text-center">
          <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-teal shadow-[0_0_18px_rgb(11_211_194_/_0.6)]" />
          <div className="font-display mt-2 text-lg font-extrabold text-teal">Matched to you in real time</div>
          <div className="text-xs text-mut">
            {bids.length ? `${bids.length} open bid(s) on the network` : "You're online and within range"}
          </div>
        </Card>
        <Card className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Buyer needs</span>
          <div className="font-display mt-1 text-[22px] font-extrabold text-navy">{label}</div>
          <div className="mt-1.5 flex gap-1.5">
            <Badge tone="gold">Premium quality</Badge>
            <Badge tone="teal">Buyer bids $15.00</Badge>
          </div>
          <div className="my-3 h-px bg-line" />
          {[
            ["Location", first?.city || s.city || "Chitungwiza"],
            ["When", "Now"],
            ["Distance", "2.1 km"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-mut">{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </Card>
        <Btn variant="teal" className="mt-3.5" onClick={() => s.go("makeoffer")}>
          Make offer
        </Btn>
        <Btn variant="ghost" className="mt-2" onClick={() => s.go("trade")}>
          Not interested
        </Btn>
      </Pad>
    </section>
  );
}

export function MakeOfferScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("incoming")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Make offer"
      />
      <Pad>
        <Card>
          <div className="text-xs text-mut">Responding to</div>
          <div className="text-lg font-extrabold text-navy">20kg tomatoes · Premium · Chitungwiza</div>
          <div className="text-xs text-mut">Buyer's bid: $15.00</div>
        </Card>
        <div className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Respond to the bid</span>
          <div className="mt-2 flex gap-2">
            <Choice
              className="flex-1 justify-center"
              active={s.counterMode === "accept"}
              onClick={() => s.set({ counterMode: "accept" })}
            >
              Accept $15.00
            </Choice>
            <Choice
              className="flex-1 justify-center"
              active={s.counterMode === "counter"}
              onClick={() => s.set({ counterMode: "counter" })}
            >
              Counter
            </Choice>
          </div>
          {s.counterMode === "counter" ? (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-mut">Your counter price</span>
                <b className="font-display text-2xl text-navy">${s.counterPrice.toFixed(2)}</b>
              </div>
              <input
                type="range"
                className="vn-range mt-2"
                min={15}
                max={20}
                step={0.5}
                value={s.counterPrice}
                onChange={(e) => s.set({ counterPrice: parseFloat(e.target.value) })}
              />
              <p className="mt-1.5 text-xs text-mut">Buyer can accept your counter or walk away.</p>
            </div>
          ) : null}
        </div>
        <div className="mt-3">
          <Field label="Quantity available">
            <Input defaultValue="20kg" />
          </Field>
        </div>
        <div className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Fulfilment</span>
          <div className="mt-2 grid gap-2">
            <Choice active={s.offerFulfill === "delivery"} onClick={() => s.set({ offerFulfill: "delivery" })}>
              Delivery available
            </Choice>
            <Choice active={s.offerFulfill === "collection"} onClick={() => s.set({ offerFulfill: "collection" })}>
              Collection only
            </Choice>
          </div>
        </div>
        <Btn
          variant="teal"
          className="mt-3.5"
          onClick={async () => {
            const price = s.counterMode === "accept" ? 15 : s.counterPrice;
            if (s.userId) {
              const { createOffer } = await import("@/lib/vimbiso/api");
              const { error } = await createOffer({
                traderId: s.userId,
                price,
                qty: "20kg",
                quality: s.offerQuality || "premium",
                fulfillment: s.offerFulfill,
              });
              if (error) s.toastMsg("Offer saved locally");
              else s.toastMsg("Offer sent to the network");
            } else {
              s.toastMsg("Offer sent to buyer");
            }
            s.go("trade");
          }}
        >
          Send offer
        </Btn>
      </Pad>
    </section>
  );
}

export function DelDashScreen() {
  const s = useVimbiso();
  const steps = ["Accepted", "At pickup", "Picked up", "In transit", "Delivered"];
  return (
    <section className="vn-screen">
      <Photo src={IMG.delivery} alt="Motorcycle courier on the road" overlay="header" className="mid" />
      <div className="relative z-[2] -mt-[220px]">
        <div className="flex h-14 items-center justify-between px-4 pt-[max(env(safe-area-inset-top),8px)]">
          <Wordmark dark />
          <IconBtn light onClick={() => s.go("profile")}>
            <User className="size-[18px]" />
          </IconBtn>
        </div>
        <div className="px-[18px] pt-2 pb-4">
          <p className="text-[13px] font-semibold text-white/80">Delivery mode</p>
          <h1 className="font-display text-[26px] font-extrabold text-white">Ready to ride?</h1>
        </div>
      </div>
      <Pad className="-mt-2">
        <button
          type="button"
          onClick={() => {
            s.set({ delOnline: !s.delOnline });
            s.toastMsg(s.delOnline ? "You are offline" : "You are now available");
          }}
          className={cn(
            "w-full rounded-[26px] px-[18px] py-[26px] text-center text-white shadow-[var(--shadow-lift)]",
            s.delOnline ? "bg-gradient-to-br from-teal to-teal-3" : "bg-gradient-to-br from-navy-2 to-navy",
          )}
        >
          <div className="mx-auto mb-3 grid h-[84px] w-[84px] place-items-center rounded-full bg-white/10">
            <Bike className="size-8" />
          </div>
          <div className="font-display text-[26px] font-extrabold">{s.delOnline ? "AVAILABLE" : "GO AVAILABLE"}</div>
          <div className="mt-1 text-[13px] text-white/80">
            {s.delOnline ? "You're receiving delivery jobs" : "Tap to start receiving jobs"}
          </div>
        </button>
        <div className="mt-3.5 grid grid-cols-2 gap-3">
          {[
            ["91", "Delivery Trust"],
            ["4.9", "Rating · 84 deliveries"],
            ["247", "Completed jobs"],
            [s.delOnline ? "4" : "0", "Jobs nearby"],
          ].map(([v, k]) => (
            <Card key={k}>
              <div className="font-display text-[26px] leading-none font-extrabold text-navy">{v}</div>
              <div className="mt-1 text-[11px] font-bold text-mut">{k}</div>
            </Card>
          ))}
        </div>
        <Card className="mt-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Your vehicle</span>
              <div className="mt-1 font-extrabold text-navy">
                {s.make} · {s.vehicleColor}
              </div>
              <div className="text-xs text-mut">
                {s.plate} · {s.insurance} insured
              </div>
            </div>
            <Badge tone="ok">Verified</Badge>
          </div>
        </Card>
        <Btn className="mt-3.5" onClick={() => s.go("delRadar")}>
          Find delivery jobs nearby
        </Btn>
        {s.delStep > 0 ? (
          <Card className="mt-3 border-[1.5px] border-gold/30 bg-gradient-to-br from-gold/6 to-white">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="warn">active</Badge>
                <div className="mt-1.5 font-extrabold text-navy">20kg tomatoes → 47 Chiremba Ave</div>
                <div className="text-xs text-mut">Pickup: Mbare Musika · Drop: Avondale</div>
              </div>
              <div className="text-right">
                <div className="font-display text-[22px] font-extrabold text-ok">$3.50</div>
                <div className="text-xs text-mut">4.2 km</div>
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              {steps.map((st, i) => {
                const state = i < s.delStep ? "dn" : i === s.delStep ? "cu" : "wt";
                return (
                  <div key={st} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "grid h-4 w-4 place-items-center rounded-full text-[9px] font-black text-white",
                        state === "dn" && "bg-ok",
                        state === "cu" && "bg-teal",
                        state === "wt" && "bg-line",
                      )}
                    >
                      {state === "dn" ? "✓" : ""}
                    </span>
                    <span className={state === "wt" ? "text-mut" : "font-bold text-navy"}>{st}</span>
                  </div>
                );
              })}
            </div>
            {s.jobPhotos.map((p, i) => (
              <div key={i} className="mt-2 flex items-center gap-2 rounded-sm bg-paper p-2.5">
                <div className="relative grid h-[52px] w-[52px] place-items-center overflow-hidden rounded-[10px] bg-navy-2">
                  <img src={IMG.tomatoes} alt="" className="h-full w-full object-cover opacity-80" />
                  <span className="absolute right-1 bottom-1 rounded bg-black/60 px-1 text-[7px] text-white">{p.time}</span>
                </div>
                <div>
                  <div className="text-[13px] font-extrabold text-navy">
                    {p.type === "pickup" ? "Pickup" : "Drop-off"} photo captured
                  </div>
                  <div className="text-xs text-mut">GPS -17.8292, 31.0522 · timestamped</div>
                </div>
              </div>
            ))}
            <Btn
              variant="teal"
              className="mt-3"
              onClick={() => {
                if (s.delStep < 5) s.set({ delStep: s.delStep + 1 });
                if (s.delStep >= 4) s.toastMsg("Delivery completed · $3.50 earned");
              }}
            >
              Advance delivery
            </Btn>
          </Card>
        ) : null}
      </Pad>
    </section>
  );
}

export function DelRadarScreen() {
  const s = useVimbiso();
  const [st, setSt] = useState("Searching nearby deliveries…");
  const [km, setKm] = useState(0.5);
  const [found, setFound] = useState<{ n: string; a: number; r: number; lk: boolean }[]>([]);

  useEffect(() => {
    const seq: [number, string][] = [
      [0.5, "Searching nearby…"],
      [1, "1 km radius…"],
      [2, "2 km…"],
      [3, "3 km…"],
      [5, "5 km…"],
      [8, "8 km — wide scan…"],
    ];
    const jobs = [
      { a: 40, r: 0.55, n: "$3.50" },
      { a: 160, r: 0.65, n: "$5.00" },
      { a: 280, r: 0.45, n: "$2.50" },
      { a: 200, r: 0.78, n: "$4.00" },
    ];
    const timers: number[] = [];
    seq.forEach(([k, label], i) => timers.push(window.setTimeout(() => { setKm(k); setSt(label); }, i * 550)));
    jobs.forEach((j, i) => {
      timers.push(
        window.setTimeout(() => {
          setFound((cur) => [...cur, { ...j, lk: false }]);
          window.setTimeout(() => setFound((cur) => cur.map((x) => (x.n === j.n ? { ...x, lk: true } : x))), 420);
        }, 1200 + i * 800),
      );
    });
    timers.push(window.setTimeout(() => s.go("delJobs"), 1200 + jobs.length * 800 + 1000));
    return () => timers.forEach(clearTimeout);
  }, [s]);

  return (
    <section className="vn-screen p-0">
      <div className="vn-radar">
        <div className="vn-radar-map">
          <img src={IMG.road} alt="Road network while scanning for jobs" />
        </div>
        <div className="vn-radar-grid" />
        <div className="absolute top-[max(env(safe-area-inset-top),18px)] right-0 left-0 z-[6] px-[18px] text-center">
          <div className="text-xs font-semibold text-white/70">VMB-DEL-003217 · scanning for jobs</div>
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
          <div className="absolute top-1/2 left-1/2 z-[3] text-[9px] font-bold text-teal-2" style={{ transform: `translate(-50%, -50%) scale(${0.6 + km / 12})` }}>
            {km} km
          </div>
          <div className="vn-center" />
          {found.map((f) => {
            const x = 50 + Math.cos((f.a * Math.PI) / 180) * f.r * 46;
            const y = 50 + Math.sin((f.a * Math.PI) / 180) * f.r * 46;
            return (
              <div key={f.n} className={cn("vn-blip in", f.lk && "lk")} style={{ left: `${x}%`, top: `${y}%` }}>
                <span>{f.n}</span>
              </div>
            );
          })}
        </div>
        <div className="absolute right-0 bottom-8 left-0 z-[6] text-center">
          <div className="font-display text-[30px] font-extrabold text-gold-2">{found.filter((f) => f.lk).length} jobs</div>
          <div className="text-xs text-white/65">looking for deliveries near you…</div>
          <button type="button" onClick={() => s.go("delJobs")} className="mt-3.5 text-sm font-bold text-white/70">
            View jobs
          </button>
        </div>
      </div>
    </section>
  );
}

export function DelJobsScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("delDash")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Jobs nearby"
        right={<Badge tone="live">4 live</Badge>}
      />
      <Pad>
        <div className="grid gap-3">
          {JOBS.length === 0 ? (
            <div className="rounded-md bg-white p-4 text-sm text-mut">No delivery jobs yet.</div>
          ) : JOBS.map((j) => (
            <Card key={j.id} onClick={() => s.go("delJob")}>
              <div className="flex items-start justify-between">
                <div>
                  <Badge tone="live">live</Badge>
                  <div className="mt-1.5 text-[15px] font-extrabold text-navy">{j.item}</div>
                </div>
                <div className="font-display text-[22px] font-extrabold text-ok">${j.pay.toFixed(2)}</div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-teal" />
                <i className="h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-teal)_0_6px,transparent_6px_12px)]" />
                <i className="h-2.5 w-2.5 rounded-full bg-gold" />
              </div>
              <div className="mt-1 flex justify-between text-xs text-mut">
                <span>
                  {j.from} → {j.to}
                </span>
                <span>{j.dist}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="gold">Buyer {j.buyerTrust}</Badge>
                <Badge tone="gold">Trader {j.traderTrust}</Badge>
                <Badge>{j.eta}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Pad>
    </section>
  );
}

export function DelJobScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <Photo src={IMG.delivery} alt="" overlay="soft" className="absolute inset-0 opacity-40" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("delJobs")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Delivery job"
        right={<Badge tone="ok">$3.50</Badge>}
      />
      <Pad className="relative z-[2]">
        <Card>
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Route</span>
          <div className="mt-2.5 flex items-start gap-2">
            <i className="mt-1.5 h-2.5 w-2.5 rounded-full bg-teal" />
            <div>
              <div className="text-sm font-extrabold text-navy">Mbare Musika</div>
              <div className="text-xs text-mut">Pickup · 09:30</div>
            </div>
          </div>
          <div className="ml-1 h-6 border-l-2 border-dashed border-teal" />
          <div className="flex items-start gap-2">
            <i className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
            <div>
              <div className="text-sm font-extrabold text-navy">47 Chiremba Ave, Avondale</div>
              <div className="text-xs text-mut">Drop · by 10:15</div>
            </div>
          </div>
          <div className="my-3 h-px bg-line" />
          {[
            ["Item", "20kg tomatoes (Premium)"],
            ["Distance", "4.2 km"],
            ["Payout", "$3.50"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-mut">{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </Card>
        <Card className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">
            Meet at a safe point (optional)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Shell station Avondale", "Mbare gate 4", "Verified police point"].map((p) => (
              <Choice
                key={p}
                className="w-auto"
                active={s.safePoint === p}
                onClick={() => s.set({ safePoint: p })}
              >
                {p}
              </Choice>
            ))}
          </div>
          <p className="mt-2 text-xs text-mut">Public, monitored handover spots reduce disputes.</p>
        </Card>
        <Card className="mt-3">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Photo proof</span>
          <p className="mt-1.5 text-xs text-mut">
            Snap the item at pickup and drop-off. Timestamped, GPS-stamped.
          </p>
          <Btn
            variant="outline"
            className="mt-2.5"
            onClick={() => {
              const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              s.set({ jobPhotos: [{ type: "pickup", time }, ...s.jobPhotos] });
              s.toastMsg("Photo proof saved");
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Camera className="size-4" /> Capture pickup photo
            </span>
          </Btn>
          {s.jobPhotos.map((p, i) => (
            <div key={i} className="mt-2 flex items-center gap-2 rounded-sm bg-paper p-2.5">
              <img src={IMG.tomatoes} alt="" className="h-[52px] w-[52px] rounded-[10px] object-cover" />
              <div>
                <div className="text-[13px] font-extrabold text-navy">Pickup photo captured</div>
                <div className="text-xs text-mut">{p.time} · GPS stamped</div>
              </div>
            </div>
          ))}
        </Card>
        <Btn
          variant="teal"
          className="mt-3.5"
          onClick={() => {
            s.set({ delStep: 1 });
            s.toastMsg("Job accepted");
            s.go("delDash");
          }}
        >
          Accept this job
        </Btn>
        <Btn variant="ghost" className="mt-2" onClick={() => s.go("delJobs")}>
          Skip
        </Btn>
      </Pad>
    </section>
  );
}

export function ProfileScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <Photo src={IMG.profile} alt="Preparing food in a working kitchen" overlay="header" className="hero" />
      <div className="relative z-[2] -mt-12 text-center px-4">
        <TopBar
          ghost
          left={
            <IconBtn light onClick={() => s.goHome()}>
              <ChevronLeft />
            </IconBtn>
          }
        />
        <img
          src={s.profilePhoto || ""}
          alt={s.name}
          className="mx-auto h-[84px] w-[84px] rounded-3xl border-4 border-white object-cover"
        />
        <h1 className="font-display mt-2.5 text-[26px] font-extrabold text-navy">{s.name}</h1>
        <p className="text-mut">
          {s.city} · Buyer & Trader
        </p>
        <div className="mt-2 flex justify-center gap-1.5">
          <Badge tone="teal">Verified</Badge>
          <Badge tone="gold">Trust {s.trustScore || 0}</Badge>
          <Badge>{s.completedTrades >= 100 ? "100-trade badge" : `${s.completedTrades} trades`}</Badge>
        </div>
        <div className="vn-idcard mt-4 text-left">
          <div className="text-[11px] font-extrabold tracking-[0.14em] text-gold-2">VIMBISO ID</div>
          <div className="font-mono text-[28px] font-extrabold">{s.vimbisoId || "Pending ID"}</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="font-extrabold">{s.completedTrades} transactions</div>
              <div className="text-xs text-white/70">{s.rating ? s.rating.toFixed(1) : "—"} avg rating</div>
            </div>
            <img src="/images/qr-id.png" alt="ID QR" className="h-16 w-16 rounded-xs bg-white p-1" />
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-3 text-left">
          {[
            [s.completedTrades ? String(s.trustScore || 0) : "—", s.completedTrades ? "Trust" : "New on Vimbiso"],
            [s.rating ? s.rating.toFixed(1) : "—", "Rating"],
            [String(s.completedTrades || 0), "Completed"],
            [s.userStatus === "approved" ? "Verified" : "Pending", "Status"],
          ].map(([v, k]) => (
            <Card key={k}>
              <div className="font-display text-[26px] leading-none font-extrabold text-navy">{v}</div>
              <div className="mt-1 text-[11px] font-bold text-mut">{k}</div>
            </Card>
          ))}
        </div>
        <label className="mt-3.5 flex cursor-pointer items-center justify-center rounded-sm border-[1.5px] border-line bg-white px-4 py-3 text-sm font-bold text-navy">
          Change profile photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 1_500_000) {
                s.toastMsg("Photo too large — use under 1.5MB");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                const data = String(reader.result || "");
                s.set({ profilePhoto: data });
                s.toastMsg("Profile photo updated");
              };
              reader.readAsDataURL(f);
            }}
          />
        </label>
        <Btn
          variant="teal"
          className="mt-3.5"
          onClick={async () => {
            const { enablePushNotifications } = await import("@/lib/vimbiso/push");
            const r = await enablePushNotifications(s.userId);
            if (r.ok) s.toastMsg("Notifications enabled for new bids and offers");
            else s.toastMsg(r.error || "Could not enable notifications");
          }}
        >
          Enable notifications
        </Btn>
        <Btn variant="outline" className="mt-2" onClick={() => s.go("welcome")}>
          Sign out
        </Btn>
      </div>
    </section>
  );
}

export function AdminScreen() {
  const s = useVimbiso();
  const [pending, setPending] = useState<
    { id: string; type: string; target_id: string; user_id: string | null; status: string; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    import("@/lib/vimbiso/api").then(({ listPendingApprovals }) => {
      listPendingApprovals().then(({ approvals, error }) => {
        if (!error) setPending(approvals);
        setLoading(false);
      });
    });
  }, []);

  async function decide(id: string, targetId: string, type: string, decision: "approved" | "rejected") {
    const { decideApproval } = await import("@/lib/vimbiso/api");
    const { error } = await decideApproval(id, targetId, decision, type);
    if (error) {
      setMsg(error);
      return;
    }
    setPending((p) => p.filter((a) => a.id !== id));
    setMsg(decision === "approved" ? "Approved" : "Rejected");
    s.toastMsg(decision === "approved" ? "User approved" : "User rejected");
  }

  return (
    <section className="vn-screen">
      <TopBar
        left={<Wordmark />}
        right={
          <IconBtn onClick={() => s.go("welcome")}>
            ×
          </IconBtn>
        }
      />
      <Pad>
        <h1 className="font-display text-[28px] font-extrabold text-navy">Operations</h1>
        <p className="mt-1 text-sm text-mut">Approve users and delivery riders before they can trade.</p>

        <Card className="mt-3.5">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">
            Pending approvals ({pending.length})
          </span>
          {loading ? (
            <p className="mt-3 text-sm text-mut">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="mt-3 text-sm text-mut">No pending approvals. New signups will appear here.</p>
          ) : (
            <div className="mt-2.5 grid gap-3">
              {pending.map((a) => (
                <div key={a.id} className="rounded-md border border-line bg-white p-3">
                  <div className="text-xs font-bold capitalize text-navy">{a.type.replace(/_/g, " ")}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-mut">{a.target_id.slice(0, 8)}…</div>
                  <div className="mt-2 flex gap-2">
                    <Btn
                      variant="teal"
                      className="py-2 text-sm"
                      onClick={() => decide(a.id, a.target_id, a.type, "approved")}
                    >
                      Approve
                    </Btn>
                    <Btn
                      variant="outline"
                      className="py-2 text-sm"
                      onClick={() => decide(a.id, a.target_id, a.type, "rejected")}
                    >
                      Reject
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
          {msg ? <p className="mt-2 text-xs font-semibold text-teal">{msg}</p> : null}
        </Card>

        <Card className="mt-3.5">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-mut uppercase">Services</span>
          <div className="mt-2.5 grid gap-2">
            {[
              ["Database · Supabase", "live", "ok"],
              ["Weather · OpenWeatherMap", "live", "ok"],
              ["Mapbox heat map", "ready", "teal"],
              ["Africa's Talking SMS", "ready", "teal"],
            ].map(([label, b, tone]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-mut">{label}</span>
                <Badge tone={tone as "teal" | "ok"}>{b}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </Pad>
    </section>
  );
}

