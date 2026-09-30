import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  ShoppingBag,
  Package,
  User,
  Zap,
  Inbox,
  Bike,
  ClipboardList,
  Plus,
  Map,
  Mic,
  Handshake,
  X,
} from "lucide-react";
import { PORTRAITS } from "@/lib/vimbiso/data";
import { HIDE_NAV, useVimbiso, type Screen } from "@/lib/vimbiso/store";
import { cn } from "@/lib/utils";
import { Btn } from "./primitives";
import {
  DelIdScreen,
  DelRegScreen,
  IdentityScreen,
  OnboardScreen,
  OtpScreen,
  SignInScreen,
  SignupScreen,
  SplashScreen,
  UssdScreen,
  WelcomeScreen,
} from "./screens-auth";
import {
  BasketScreen,
  BidScreen,
  HomeScreen,
  OffersScreen,
  OrderScreen,
  RadarScreen,
  ReviewScreen,
  StatusScreen,
} from "./screens-buyer";
import {
  AdminScreen,
  DelDashScreen,
  DelJobScreen,
  DelJobsScreen,
  DelRadarScreen,
  IncomingScreen,
  MakeOfferScreen,
  ProfileScreen,
  TradeScreen,
} from "./screens-work";

const SCREENS: Record<Screen, () => ReactNode> = {
  splash: () => <SplashScreen />,
  onboard: () => <OnboardScreen />,
  welcome: () => <WelcomeScreen />,
  ussd: () => <UssdScreen />,
  signin: () => <SignInScreen />,
  otp: () => <OtpScreen />,
  signup: () => <SignupScreen />,
  identity: () => <IdentityScreen />,
  delreg: () => <DelRegScreen />,
  delid: () => <DelIdScreen />,
  home: () => <HomeScreen />,
  bid: () => <BidScreen />,
  basket: () => <BasketScreen />,
  radar: () => <RadarScreen />,
  offers: () => <OffersScreen />,
  order: () => <OrderScreen />,
  status: () => <StatusScreen />,
  review: () => <ReviewScreen />,
  trade: () => <TradeScreen />,
  incoming: () => <IncomingScreen />,
  makeoffer: () => <MakeOfferScreen />,
  delDash: () => <DelDashScreen />,
  delRadar: () => <DelRadarScreen />,
  delJobs: () => <DelJobsScreen />,
  delJob: () => <DelJobScreen />,
  profile: () => <ProfileScreen />,
  admin: () => <AdminScreen />,
};

const NAV = {
  buyer: [
    ["home", "Home", Home],
    ["bid", "Bid", ShoppingBag],
    ["status", "Orders", Package],
    ["profile", "Profile", User],
  ],
  trader: [
    ["trade", "Trade", Zap],
    ["incoming", "Requests", Inbox],
    ["status", "Orders", Package],
    ["profile", "Profile", User],
  ],
  delivery: [
    ["delDash", "Drive", Bike],
    ["delJobs", "Jobs", ClipboardList],
    ["status", "History", Package],
    ["profile", "Profile", User],
  ],
} as const;

export function VimbisoApp() {
  const screen = useVimbiso((s) => s.screen);
  const role = useVimbiso((s) => s.role);
  const lite = useVimbiso((s) => s.lite);
  const toast = useVimbiso((s) => s.toast);
  const voiceOn = useVimbiso((s) => s.voiceOn);
  const poolOpen = useVimbiso((s) => s.poolOpen);
  const go = useVimbiso((s) => s.go);

  useEffect(() => {
    document.body.classList.toggle("lite", lite);
    return () => document.body.classList.remove("lite");
  }, [lite]);

  const Screen = SCREENS[screen];
  const hideNav = HIDE_NAV.includes(screen) || role === "admin";
  const nav = NAV[role === "trader" ? "trader" : role === "delivery" ? "delivery" : "buyer"];

  return (
    <div className="vn-root">
      <div className="vn-phone" id="app">
        {lite ? <div className="lite-pill">LITE MODE — data saver on</div> : null}
        <Screen />
        {!hideNav ? (
          <nav className="vn-nav">
            <div className="grid grid-cols-4 px-1.5 pt-1.5 pb-1">
              {nav.map(([id, label, Icon]) => {
                const active = screen === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id as Screen)}
                    className={cn(
                      "relative grid place-items-center gap-0.5 rounded-[14px] py-2.5 text-[10.5px] font-bold transition",
                      active ? "text-teal" : "text-mut hover:text-navy",
                    )}
                  >
                    {active ? (
                      <span className="absolute top-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-teal" />
                    ) : null}
                    <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 2} />
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
        {!hideNav ? <FabMenu role={role} /> : null}
        <div className={cn("vn-toast", toast && "on")}>{toast?.message}</div>
        {voiceOn ? <VoiceOverlay /> : null}
        {poolOpen ? <PoolSheet /> : null}
      </div>
    </div>
  );
}


function FabMenu({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const go = useVimbiso((s) => s.go);
  const set = useVimbiso((s) => s.set);

  const items =
    role === "trader"
      ? [
          { id: "incoming", label: "Buyer requests", sub: "Respond live", Icon: Inbox, run: () => go("incoming") },
          { id: "map", label: "Network map", sub: "Expand by distance", Icon: Map, run: () => go("radar") },
          { id: "offer", label: "Make offer", sub: "Quote a buyer", Icon: Handshake, run: () => go("makeoffer") },
          { id: "trade", label: "Go online", sub: "Trader desk", Icon: Zap, run: () => go("trade") },
        ]
      : role === "delivery"
        ? [
            { id: "jobs", label: "Open jobs", sub: "Deliveries near you", Icon: ClipboardList, run: () => go("delJobs") },
            { id: "map", label: "Network map", sub: "Expand by distance", Icon: Map, run: () => go("radar") },
            { id: "dash", label: "Driver desk", sub: "Go online", Icon: Bike, run: () => go("delDash") },
            { id: "hist", label: "History", sub: "Past runs", Icon: Package, run: () => go("status") },
          ]
        : [
            { id: "bid", label: "Build a bid", sub: "Say what you need", Icon: ShoppingBag, run: () => go("bid") },
            { id: "map", label: "Network map", sub: "Find people nearby", Icon: Map, run: () => go("radar") },
            { id: "voice", label: "Voice order", sub: "Speak your need", Icon: Mic, run: () => set({ voiceOn: true }) },
            { id: "offer", label: "Live offers", sub: "Traders responding", Icon: Handshake, run: () => go("offers") },
          ];

  return (
    <div className="pointer-events-none absolute right-3 bottom-[78px] z-[40] flex flex-col items-end gap-2">
      {open ? (
        <div className="pointer-events-auto mb-1 w-[220px] overflow-hidden rounded-lg border border-line bg-white shadow-[var(--shadow-lift)]">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className="flex w-full items-center gap-3 border-b border-line px-3 py-3 text-left last:border-b-0 active:bg-navy/5"
              onClick={() => {
                setOpen(false);
                it.run();
              }}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-teal/12 text-teal">
                <it.Icon className="size-4" strokeWidth={2.4} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-extrabold text-navy">{it.label}</span>
                <span className="block text-[11px] text-mut">{it.sub}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        aria-label={open ? "Close actions" : "Open actions"}
        className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-teal text-white shadow-[0_10px_28px_rgba(15,118,110,0.45)] transition active:scale-95"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" strokeWidth={2.5} /> : <Plus className="size-7" strokeWidth={2.5} />}
      </button>
    </div>
  );
}

function VoiceOverlay() {
  const s = useVimbiso();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { canListen, listenOnce, speak } = await import("@/lib/vimbiso/voice");
        if (!canListen()) {
          if (!cancelled) {
            s.toastMsg("Mic not available — type what you need");
            s.set({ voiceOn: false });
          }
          return;
        }
        const text = await listenOnce("en-US");
        if (cancelled) return;
        if (text) {
          s.set({ voiceOn: false, search: text, bidItem: text });
          s.toastMsg("Heard: " + text);
          speak("You need " + text);
          s.go("bid");
        } else {
          s.set({ voiceOn: false });
        }
      } catch (e) {
        if (!cancelled) {
          s.toastMsg(e instanceof Error ? e.message : "Voice failed");
          s.set({ voiceOn: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [s]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-navy-3/92 px-6 text-center text-white backdrop-blur-sm">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-teal">
        <Mic className="size-7 text-white" />
      </div>
      <h2 className="font-display mt-3.5 text-xl font-extrabold">Listening…</h2>
      <p className="mt-1 text-xs text-white/70">Say what you need — we only use what you say</p>
      <Btn variant="ghost" className="mt-6 text-white" onClick={() => s.set({ voiceOn: false })}>
        Cancel
      </Btn>
    </div>
  );
}

function PoolSheet() {
  const s = useVimbiso();
  const pct = Math.min(100, 25 + (s.poolJoined - 3) * 18);
  const price = (15 - (s.poolJoined - 3) * 0.8).toFixed(2);
  const faces = [PORTRAITS.rudo, PORTRAITS.farai, PORTRAITS.chipo, PORTRAITS.john, PORTRAITS.mary, PORTRAITS.tinashe, PORTRAITS.tendai];

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-navy-3/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) s.set({ poolOpen: false });
      }}
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] bg-white px-5 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-navy">Pool this bid</h2>
          <button type="button" className="text-xl" onClick={() => s.set({ poolOpen: false })}>
            ×
          </button>
        </div>
        <p className="mt-1.5 text-sm text-mut">
          Invite neighbours to buy together. Bigger order = lower price. This is how mukando already works — now on Vimbiso.
        </p>
        <div
          className="relative mx-auto mt-4 grid h-[120px] w-[120px] place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--color-teal) ${pct}%, rgb(14 42 71 / 0.08) 0)` }}
        >
          <div className="absolute inset-2.5 rounded-full bg-white" />
          <div className="relative font-display text-[26px] font-extrabold text-navy">{pct}%</div>
        </div>
        <div className="my-3 flex justify-center">
          {faces.slice(0, s.poolJoined).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="-ml-2.5 h-[38px] w-[38px] rounded-full border-2 border-white object-cover first:ml-0"
            />
          ))}
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mut">You</span>
            <b>20kg @ $15.00</b>
          </div>
          <div className="flex justify-between">
            <span className="text-mut">Neighbours joined</span>
            <b>{s.poolJoined - 1}</b>
          </div>
          <div className="h-px bg-line" />
          <div className="flex justify-between">
            <span className="font-extrabold text-navy">New price / kg</span>
            <b className="font-display text-xl text-ok">${price}</b>
          </div>
        </div>
        <Btn
          variant="teal"
          className="mt-4"
          onClick={() => {
            if (s.poolJoined < 7) {
              s.set({ poolJoined: s.poolJoined + 1 });
              s.toastMsg("Another neighbour joined");
            } else s.toastMsg("Pool is full — great bulk price");
          }}
        >
          Invite more neighbours
        </Btn>
        <Btn
          className="mt-2"
          onClick={() => {
            s.set({ poolOpen: false });
            s.go("radar");
          }}
        >
          Find traders at pooled price
        </Btn>
      </div>
    </div>
  );
}
