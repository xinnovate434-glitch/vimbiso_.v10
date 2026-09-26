import { useEffect, type ReactNode } from "react";
import {
  Home,
  ShoppingBag,
  Package,
  User,
  Zap,
  Inbox,
  Bike,
  ClipboardList,
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
        <div className={cn("vn-toast", toast && "on")}>{toast?.message}</div>
        {voiceOn ? <VoiceOverlay /> : null}
        {poolOpen ? <PoolSheet /> : null}
      </div>
    </div>
  );
}

function VoiceOverlay() {
  const s = useVimbiso();
  useEffect(() => {
    const phrases = ["20kg tomatoes", "maize meal 10kg", "phone charger", "plumber near me"];
    let i = 0;
    const t = window.setInterval(() => {
      const el = document.getElementById("voiceTxt");
      if (el) el.textContent = phrases[i % phrases.length] + "…";
      i += 1;
    }, 450);
    const done = window.setTimeout(() => {
      s.set({ voiceOn: false, search: "20kg tomatoes" });
      s.toastMsg("Heard: 20kg tomatoes");
    }, 2200);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [s]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-navy-3/92 px-6 text-center text-white backdrop-blur-sm">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-teal">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </div>
      <h2 className="font-display mt-3.5 text-xl font-extrabold">Listening…</h2>
      <p className="mt-1 text-xs text-white/70">Say what you need in English, Shona or Ndebele</p>
      <div className="mt-6 flex h-[60px] items-end gap-1.5">
        {Array.from({ length: 7 }, (_, i) => (
          <i
            key={i}
            className="w-1.5 rounded-full bg-teal-3"
            style={{
              animation: "vn-wv 1s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
              height: 12,
            }}
          />
        ))}
      </div>
      <p id="voiceTxt" className="font-display mt-4 text-[22px] font-extrabold text-teal-3">
        …
      </p>
      <style>{`@keyframes vn-wv{0%,100%{height:12px}50%{height:54px}}`}</style>
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
