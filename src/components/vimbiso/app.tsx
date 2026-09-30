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
import {
  AiAssistScreen,
  MessagesScreen,
  ReceiptScreen,
} from "./screens-chat";
import {
  AgentKitScreen,
  NetworkExtrasScreen,
  PricePulseScreen,
  SafeMeetScreen,
  TrustScreen,
} from "./screens-innovate";
import { VimbyCallScreen } from "./screens-vimby-call";
import { SettingsScreen } from "./screens-settings";

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
  messages: () => <MessagesScreen />,
  ai: () => <AiAssistScreen />,
  receipt: () => <ReceiptScreen />,
  pricePulse: () => <PricePulseScreen />,
  safeMeet: () => <SafeMeetScreen />,
  trust: () => <TrustScreen />,
  agentKit: () => <AgentKitScreen />,
  networkMore: () => <NetworkExtrasScreen />,
  settings: () => <SettingsScreen />,
  vimbyCall: () => <VimbyCallScreen />,
};

const NAV = {
  buyer: [
    ["home", "Home", Home],
    ["bid", "My need", ShoppingBag],
    ["messages", "Chat", Inbox],
    ["profile", "Me", User],
  ],
  trader: [
    ["trade", "Trade", Zap],
    ["incoming", "Requests", Handshake],
    ["messages", "Chat", Inbox],
    ["profile", "Me", User],
  ],
  delivery: [
    ["delDash", "Drive", Bike],
    ["delJobs", "Jobs", ClipboardList],
    ["status", "History", Package],
    ["profile", "Me", User],
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
  const hideNav =
    HIDE_NAV.includes(screen) || screen === "vimbyCall" || screen === "settings" ||
    role === "admin" ||
    screen === "ai" ||
    screen === "messages" ||
    screen === "receipt" ||
    screen === "pricePulse" ||
    screen === "safeMeet" ||
    screen === "trust" ||
    screen === "agentKit" ||
    screen === "networkMore";
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
          { id: "ai", label: "Vimby", sub: "Always available", Icon: Mic, run: () => go("ai") },
          { id: "incoming", label: "Buyer requests", sub: "Respond live", Icon: Inbox, run: () => go("incoming") },
          { id: "msg", label: "Chat", sub: "Customers", Icon: Handshake, run: () => go("messages") },
          { id: "offer", label: "Make offer", sub: "Quote a buyer", Icon: Zap, run: () => go("makeoffer") },
        ]
      : role === "delivery"
        ? [
            { id: "jobs", label: "Open jobs", sub: "Deliveries near you", Icon: ClipboardList, run: () => go("delJobs") },
            { id: "map", label: "Find nearby", sub: "Expand by distance", Icon: Map, run: () => go("radar") },
            { id: "dash", label: "Driver desk", sub: "Go online", Icon: Bike, run: () => go("delDash") },
            { id: "hist", label: "History", sub: "Past runs", Icon: Package, run: () => go("status") },
          ]
        : [
            { id: "ai", label: "Vimby", sub: "Always available", Icon: Mic, run: () => go("ai") },
            { id: "bid", label: "My need", sub: "Say what you need", Icon: ShoppingBag, run: () => go("bid") },
            { id: "map", label: "Find nearby", sub: "Find people nearby", Icon: Map, run: () => go("radar") },
            { id: "msg", label: "Chat", sub: "Friends & customers", Icon: Inbox, run: () => go("messages") },
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
  const [invited, setInvited] = useState(0);
  const myQty = s.bidItems.reduce((a, i) => a + i.qty, 0) || 20;
  const myPrice = s.bidItems[0]?.price ?? 15;
  // Real pool: only you until real neighbours join via invite (Supabase later)
  const neighbours = invited; // no fake people
  const totalKg = myQty + neighbours * 5;
  const discount = neighbours === 0 ? 0 : Math.min(0.25, neighbours * 0.03);
  const newPrice = +(myPrice * (1 - discount)).toFixed(2);
  const pct = neighbours === 0 ? 0 : Math.min(99, 40 + neighbours * 10);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-3/50 px-3 pb-3 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) s.set({ poolOpen: false });
      }}
    >
      <div className="w-full max-w-[400px] rounded-t-[22px] bg-white p-5 shadow-[var(--shadow-lift)]">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy">Pool this bid</h2>
            <p className="mt-1 text-xs text-mut">
              Invite real neighbours to buy together. Bigger order = better price — mukando on Vimbiso.
            </p>
          </div>
          <button type="button" className="text-xl text-mut" onClick={() => s.set({ poolOpen: false })}>
            ×
          </button>
        </div>

        <div className="mx-auto my-5 grid h-28 w-28 place-items-center">
          <div
            className="relative grid h-full w-full place-items-center rounded-full"
            style={{
              background: `conic-gradient(#0f766e ${pct}%, #e8eef5 0)`,
            }}
          >
            <div className="absolute inset-[10px] grid place-items-center rounded-full bg-white">
              <span className="font-display text-2xl font-extrabold text-navy">{pct}%</span>
            </div>
          </div>
        </div>

        {neighbours === 0 ? (
          <p className="mb-3 text-center text-xs text-mut">
            No neighbours in this pool yet. Share your invite — only real people who join appear here.
          </p>
        ) : (
          <p className="mb-3 text-center text-xs font-bold text-teal">{neighbours} real neighbour(s) joined</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mut">You</span>
            <span className="font-bold text-navy">
              {myQty}kg @ ${myPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-mut">Neighbours joined</span>
            <span className="font-bold text-navy">{neighbours}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2">
            <span className="font-bold text-navy">Pooled price / kg</span>
            <span className="font-extrabold text-ok">${newPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Btn
            variant="teal"
            onClick={() => {
              // Placeholder invite count until SMS/share + Supabase pool members
              const link = `https://vimbiso.network/pool?u=${encodeURIComponent(s.vimbisoId || s.userId || "guest")}`;
              if (navigator.share) {
                void navigator.share({ title: "Join my Vimbiso pool", text: "Buy together on Vimbiso", url: link }).catch(() => {});
              }
              s.toastMsg("Invite ready — only real joins count");
              setInvited((n) => n); // do not invent neighbours
            }}
          >
            Share invite to neighbours
          </Btn>
          <Btn
            variant="navy"
            onClick={() => {
              s.set({ poolOpen: false });
              s.go("radar");
            }}
          >
            Find traders {neighbours ? "at pooled price" : "for this bid"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
