import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, MapPin, Shield, Store, Truck, Activity } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { computeTrust, trustLabel } from "@/lib/vimbiso/trust";
import { meetPointsForCity } from "@/lib/vimbiso/meet-points";
import { setPresence, presenceBadge } from "@/lib/vimbiso/presence";
import { Badge, Btn, Card, IconBtn, Pad, TopBar } from "./primitives";

/** 3 — Price pulse from real completed orders (empty if none) */
export function PricePulseScreen() {
  const s = useVimbiso();
  const [rows, setRows] = useState<
    { item: string; city: string; avg: number; n: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { listOrdersForUser } = await import("@/lib/vimbiso/api");
        if (!s.userId) {
          if (!cancelled) {
            setRows([]);
            setLoading(false);
          }
          return;
        }
        const { data } = await listOrdersForUser(s.userId, "buyer");
        const map = new Map<string, { sum: number; n: number; city: string }>();
        for (const o of data || []) {
          const items = Array.isArray(o.items) ? o.items : [];
          for (const it of items as { name?: string; price?: number; total?: number; qty?: number }[]) {
            const name = (it.name || "goods").toLowerCase();
            const price =
              typeof it.price === "number"
                ? it.price
                : it.qty && it.total
                  ? it.total / it.qty
                  : 0;
            if (!price) continue;
            const key = `${name}|${o.city || s.city}`;
            const cur = map.get(key) || { sum: 0, n: 0, city: o.city || s.city };
            cur.sum += price;
            cur.n += 1;
            map.set(key, cur);
          }
        }
        const list = [...map.entries()].map(([k, v]) => ({
          item: k.split("|")[0],
          city: v.city,
          avg: Math.round((v.sum / v.n) * 100) / 100,
          n: v.n,
        }));
        if (!cancelled) setRows(list);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [s.userId, s.city]);

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Price pulse"
        right={<Badge tone="live">Your trades</Badge>}
      />
      <Pad>
        <p className="mb-3 text-xs text-mut">
          Average unit prices from <b>your completed Vimbiso trades only</b> — not demo data.
        </p>
        {loading ? (
          <Card>Loading…</Card>
        ) : rows.length === 0 ? (
          <Card>
            <div className="flex items-center gap-2 font-bold text-navy">
              <Activity className="size-4 text-teal" /> No pulse yet
            </div>
            <p className="mt-1 text-xs text-mut">
              Complete real trades and a suburb/item band will appear here.
            </p>
            <Btn className="mt-3" variant="teal" onClick={() => s.go("bid")}>
              Build a bid
            </Btn>
          </Card>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card key={r.item + r.city} className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold capitalize text-navy">{r.item}</div>
                  <div className="text-[11px] text-mut">
                    {r.city} · {r.n} trade{r.n === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="font-display text-lg font-extrabold text-teal">${r.avg}</div>
              </Card>
            ))}
          </div>
        )}
      </Pad>
    </section>
  );
}

/** 4 — Safe meet points + I'm here */
export function SafeMeetScreen() {
  const s = useVimbiso();
  const points = useMemo(() => meetPointsForCity(s.city), [s.city]);
  const [hereId, setHereId] = useState<string | null>(null);

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Safe meet"
      />
      <Pad>
        <p className="mb-3 text-xs text-mut">
          Public places to collect. Both sides can tap <b>I&apos;m here</b> so the meet is clear.
        </p>
        <div className="space-y-2">
          {points.map((p) => (
            <Card key={p.id}>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/12 text-teal">
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-navy">{p.name}</div>
                  <div className="text-[11px] text-mut">
                    {p.area} · {p.city} · {p.note}
                  </div>
                  <button
                    type="button"
                    className="mt-2 rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white"
                    onClick={() => {
                      setHereId(p.id);
                      s.set({ safePoint: p.name });
                      s.toastMsg(`You're at ${p.name}`);
                    }}
                  >
                    {hereId === p.id ? "✓ I'm here" : "I'm here"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Btn className="mt-4" variant="teal" onClick={() => s.go("messages")}>
          Open chat to share meet point
        </Btn>
      </Pad>
    </section>
  );
}

/** 2 — Trust from real trades only */
export function TrustScreen() {
  const s = useVimbiso();
  const t = computeTrust({
    completedTrades: s.completedTrades,
    rating: s.rating,
    trustScore: s.trustScore,
  });

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("profile")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Trust"
      />
      <Pad>
        <Card className="text-center">
          <Shield className="mx-auto size-8 text-teal" />
          <div className="mt-2 font-display text-4xl font-extrabold text-navy">
            {t.completedTrades === 0 ? "—" : t.trustScore}
          </div>
          <div className="text-sm font-bold text-teal">{trustLabel(t)}</div>
          <p className="mt-2 text-xs text-mut">
            {t.source === "none"
              ? "No completed trades yet. Trust stays empty until real deals finish on Vimbiso."
              : `From ${t.completedTrades} completed trade(s) · rating ${t.rating || "—"}`}
          </p>
        </Card>
        <p className="mt-3 text-center text-[11px] text-mut">
          No demo scores. QR / Vimbiso ID shows the same real numbers.
        </p>
      </Pad>
    </section>
  );
}

/** 7 — Agent / access-point kit (no-phone traders) */
export function AgentKitScreen() {
  const s = useVimbiso();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState<string | null>(null);

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Access point"
      />
      <Pad>
        <div className="mb-3 flex items-center gap-2">
          <Store className="size-5 text-teal" />
          <span className="text-sm font-bold text-navy">Register a no-phone trader</span>
        </div>
        <p className="mb-3 text-xs text-mut">
          Physical access: name + phone of helper + Vimbiso ID / QR for RFID-style cards (~$1–2).
          Same network identity as the app.
        </p>
        <label className="text-[11px] font-bold text-mut">Trader name</label>
        <input
          className="mb-2 mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name on the card"
        />
        <label className="text-[11px] font-bold text-mut">Contact phone (agent or family)</label>
        <input
          className="mb-3 mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07…"
        />
        <Btn
          variant="teal"
          disabled={!name.trim()}
          onClick={() => {
            const id = `VMB-AP-${Date.now().toString().slice(-6)}`;
            setDone(id);
            s.toastMsg("Access point ID created — print QR offline");
          }}
        >
          Create access ID
        </Btn>
        {done ? (
          <Card className="mt-3">
            <div className="text-xs text-mut">Access Vimbiso ID</div>
            <div className="font-display text-xl font-extrabold text-navy">{done}</div>
            <div className="mt-1 text-xs text-mut">
              {name} · {phone || "no phone"} · pending admin approval like app users
            </div>
            <Btn className="mt-2" variant="navy" onClick={() => s.go("ussd")}>
              USSD / SMS path
            </Btn>
          </Card>
        ) : null}
      </Pad>
    </section>
  );
}

/** 10 — Quiet presence toggle + 13 delivery leg entry */
export function NetworkExtrasScreen() {
  const s = useVimbiso();
  const [quietOn, setQuietOn] = useState(true);

  useEffect(() => {
    if (s.userId && quietOn) {
      setPresence({
        userId: s.userId,
        name: s.name || "User",
        role: s.role,
        city: s.city,
        quiet: true,
      });
    }
  }, [s.userId, s.name, s.role, s.city, quietOn]);

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Network"
      />
      <Pad className="space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-extrabold text-navy">Quiet online</div>
              <p className="text-xs text-mut">
                Show as {presenceBadge(quietOn)} without spam popups. Others see you on the map when in range.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuietOn((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${quietOn ? "bg-teal text-white" : "bg-line text-mut"}`}
            >
              {quietOn ? "On" : "Off"}
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <Truck className="size-6 text-teal" />
            <div>
              <div className="font-extrabold text-navy">Delivery third leg</div>
              <p className="text-xs text-mut">
                After buyer ↔ trader match, open jobs for verified drivers nearby — optional.
              </p>
              <Btn className="mt-2" variant="navy" onClick={() => s.go("delJobs")}>
                Delivery jobs
              </Btn>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Btn variant="outline" onClick={() => s.go("pricePulse")}>
            Price pulse
          </Btn>
          <Btn variant="outline" onClick={() => s.go("safeMeet")}>
            Safe meet
          </Btn>
          <Btn variant="outline" onClick={() => s.go("trust")}>
            Trust
          </Btn>
          <Btn variant="outline" onClick={() => s.go("agentKit")}>
            Access point
          </Btn>
        </div>

        <Btn variant="teal" onClick={() => s.go("ai")}>
          Vimby deal desk
        </Btn>
      </Pad>
    </section>
  );
}
