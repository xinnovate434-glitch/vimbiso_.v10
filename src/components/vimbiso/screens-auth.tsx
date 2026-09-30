import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Bike,
  Store,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { DICT, IMG, ONBOARD } from "@/lib/vimbiso/data";
import { useVimbiso, type Role } from "@/lib/vimbiso/store";
import { cn } from "@/lib/utils";
import {
  Badge,
  Btn,
  Card,
  Choice,
  Field,
  IconBtn,
  Input,
  Pad,
  Photo,
  Steps,
  TopBar,
  Wordmark,
} from "./primitives";

function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1100);
      const cur = to * (1 - Math.pow(1 - p, 3));
      setN(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <>
      {(decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()) + suffix}
    </>
  );
}

export function SplashScreen() {
  const go = useVimbiso((s) => s.go);
  const [status, setStatus] = useState("Connecting to the network…");

  useEffect(() => {
    const msgs = [
      "Connecting to the network…",
      "Loading your city…",
      "Waking nearby traders…",
      "Ready.",
    ];
    const t = window.setInterval(() => {
      setStatus((cur) => {
        const i = msgs.indexOf(cur);
        return msgs[Math.min(i + 1, msgs.length - 1)] ?? cur;
      });
    }, 1600);
    const done = window.setTimeout(() => go("onboard"), 6500);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [go]);

  return (
    <section className="vn-screen bg-navy-3 text-white">
      <Photo src={IMG.splash} alt="Fresh produce at an open market stall" overlay="navy" kenBurns className="absolute inset-0" />
      <div className="relative z-[2] flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <Wordmark dark large />
        <div className="mx-auto mt-5 h-0.5 w-[120px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="mt-4 text-[15px] font-semibold text-white/90">Trade in real time.</p>
        <div className="mt-7 flex gap-8">
          {[
            [12480, "trades"],
            [1240, "traders"],
            [98, "completion", "%"],
          ].map(([n, k, suf]) => (
            <div key={String(k)} className="grid gap-0.5">
              <span className="font-display text-xl font-extrabold text-gold-2">
                <CountUp to={n as number} suffix={(suf as string) || ""} />
              </span>
              <span className="text-[10px] tracking-[0.08em] text-white/60 uppercase">{k as string}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 h-[3px] w-40 overflow-hidden rounded-full bg-white/15">
          <i className="block h-full w-full origin-left animate-[vn-fill_6.5s_cubic-bezier(.4,0,.2,1)_both] rounded-full bg-gradient-to-r from-teal-3 to-gold-2" />
        </div>
        <p className="mt-3 text-[11px] tracking-wide text-white/50">{status}</p>
        <button
          type="button"
          onClick={() => go("onboard")}
          className="mt-6 rounded-sm bg-white/12 px-5 py-2.5 text-sm font-extrabold text-white/90 backdrop-blur-sm hover:bg-white/20"
        >
          Skip intro
        </button>
      </div>
      <style>{`@keyframes vn-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}

export function OnboardScreen() {
  const { onboardStep, set, go } = useVimbiso();
  const step = ONBOARD[onboardStep] ?? ONBOARD[0];
  const last = onboardStep === ONBOARD.length - 1;

  return (
    <section className="vn-screen">
      <Photo src={step.photo} alt="" overlay="header" kenBurns className="hero" />
      <div className="relative z-[2] -mt-16">
        <TopBar
          ghost
          left={
            <button type="button" className="text-sm font-bold text-white/80" onClick={() => go("welcome")}>
              Skip
            </button>
          }
        />
      </div>
      <Pad className="pt-2">
        <Steps total={4} current={onboardStep + 1} />
        <Card className="p-7 text-center">
          <h1 className="font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em] text-navy">
            {step.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-mut">{step.body}</p>
        </Card>
        <Btn
          className="mt-4"
          onClick={() => {
            if (last) go("signup");
            else set({ onboardStep: onboardStep + 1 });
          }}
        >
          {last ? "Create account" : "Next"}
        </Btn>
      </Pad>
    </section>
  );
}

export function WelcomeScreen() {
  const { lang, setLang, go } = useVimbiso();
  const t = DICT[lang];

  return (
    <section className="vn-screen bg-navy-3 text-white">
      <Photo
        src={IMG.welcome}
        alt="Crates of citrus and produce at a wholesale market"
        overlay="teal"
        kenBurns
        className="absolute inset-0"
      />
      <div className="relative z-[2] flex min-h-[100dvh] flex-col justify-end px-[18px] pt-6 pb-8">
        <div className="flex items-center justify-between">
          <Wordmark dark />
          <div className="inline-flex overflow-hidden rounded-[10px] border border-white/25 bg-white/10">
            {(["en", "sn"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={
                  lang === l
                    ? "bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-navy"
                    : "px-2.5 py-1.5 text-[11px] font-extrabold text-white/80"
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <h1 className="font-display mt-5 text-[32px] leading-tight font-extrabold tracking-[-0.03em] text-white">
          {t.headline}
        </h1>
        <p className="mt-2.5 max-w-[300px] text-[15px] leading-relaxed text-white/88">{t.sub}</p>
        <div className="mt-5 flex overflow-hidden rounded-md bg-navy text-white shadow-[var(--shadow-card)]">
          {[
            [12480, t.trades],
            [98, t.completion, "%"],
            [1240, t.verified],
          ].map(([n, k, suf], i) => (
            <div key={i} className="relative flex-1 px-1.5 py-3 text-center">
              {i > 0 ? <i className="absolute top-[18%] left-0 h-[64%] w-px bg-white/16" /> : null}
              <div className="font-display text-[17px] font-extrabold text-gold-2">
                <CountUp to={n as number} suffix={(suf as string) || ""} />
              </div>
              <div className="mt-0.5 text-[10px] font-semibold text-white/70">{k as string}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2">
          <Btn variant="gold" onClick={() => go("signup")}>
            {t.getstarted}
          </Btn>
          <Btn variant="white" onClick={() => go("signin")}>
            {t.signin}
          </Btn>
          <button
            type="button"
            onClick={() => go("ussd")}
            className="py-2 text-[13px] font-bold text-white/70"
          >
            {t.ussd}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-white/60">
          Free to join · Phone sign-in · Buyer · Trader · Delivery
        </p>
      </div>
    </section>
  );
}

export function SignInScreen() {
  const { phone, set, go, toastMsg } = useVimbiso();
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    const cleaned = phone.trim();
    if (cleaned.length < 9) {
      toastMsg("Enter a valid phone number");
      return;
    }
    setBusy(true);
    try {
      const { generateOtpCode, storeOtp, findUserByPhone, sendOtpViaSms } = await import(
        "@/lib/vimbiso/api"
      );
      const code = generateOtpCode();
      const { error } = await storeOtp(cleaned, code);
      if (error) {
        toastMsg("Could not send code — check database");
        setBusy(false);
        return;
      }
      const sms = await sendOtpViaSms(cleaned, code);
      if (sms.ok) {
        toastMsg("Code sent by SMS");
      } else {
        // Fallback: show code if SMS fails (sandbox / no credit)
        toastMsg(`Code: ${code}${sms.error ? ` (${sms.error.slice(0, 30)})` : ""}`);
      }
      const { user } = await findUserByPhone(cleaned);
      if (user) {
        set({
          userId: user.id,
          trustScore: user.trust_score ?? 0,
          rating: user.rating ?? 0,
          completedTrades: user.completed_trades ?? 0,
          vimbisoId: user.vimbiso_id ?? null,
          userStatus: user.status ?? "pending",
          name: user.name || s.name,
          city: user.city || s.city,
          phone: cleaned,
        });
      } else {
        set({ phone: cleaned });
      }
      go("otp");
    } catch {
      toastMsg("Network error");
    }
    setBusy(false);
  }

  return (
    <section className="vn-screen">
      <Photo src={IMG.signin} alt="City street with buses and pedestrians" overlay="navy" className="absolute inset-0" />
      <div className="relative z-[2]">
        <TopBar
          ghost
          left={
            <IconBtn light onClick={() => go("welcome")}>
              <ChevronLeft />
            </IconBtn>
          }
        />
        <Pad className="pt-8">
          <Card className="border border-white/20 bg-white/12 p-[22px] text-white shadow-none backdrop-blur-md">
            <Wordmark dark className="wm sm" />
            <h2 className="font-display mt-3.5 text-xl font-extrabold text-white">Welcome back.</h2>
            <p className="mt-1 text-xs text-white/75">Sign in with your Zimbabwe phone number.</p>
            <div className="mt-4">
              <Field label="Phone number">
                <Input
                  value={phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+263 7X XXX XXXX"
                />
              </Field>
            </div>
            <Btn variant="gold" className="mt-3.5" disabled={busy} onClick={sendCode}>
              {busy ? "Sending…" : "Send code"}
            </Btn>
            <p className="mt-3 text-center text-xs text-white/70">
              No account?{" "}
              <button type="button" className="font-bold text-gold-2" onClick={() => go("signup")}>
                Create one
              </button>
            </p>
          </Card>
        </Pad>
      </div>
    </section>
  );
}

export function OtpScreen() {
  const s = useVimbiso();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function verify() {
    if (code.trim().length < 4) {
      s.toastMsg("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    try {
      const { verifyOtp, findUserByPhone } = await import("@/lib/vimbiso/api");
      const { ok, error } = await verifyOtp(s.phone, code.trim());
      if (!ok) {
        s.toastMsg(error || "Invalid code");
        setBusy(false);
        return;
      }
      const { user } = await findUserByPhone(s.phone);
      if (user) {
        s.set({
          userId: user.id,
          trustScore: user.trust_score ?? 0,
          rating: user.rating ?? 0,
          completedTrades: user.completed_trades ?? 0,
          vimbisoId: user.vimbiso_id ?? null,
          userStatus: user.status ?? "pending",
          name: user.name || s.name,
          city: user.city || s.city,
        });
        if (user.status === "approved") {
          s.enterApp((user.roles?.[0] as Role) || s.regRole || "buyer");
        } else if (s.regRole === "delivery") {
          s.go("delreg");
        } else {
          s.go("identity");
        }
      } else {
        // New number — continue signup
        s.go("signup");
      }
    } catch {
      s.toastMsg("Network error");
    }
    setBusy(false);
  }

  return (
    <section className="vn-screen">
      <Photo src={IMG.signin} alt="" overlay="soft" className="absolute inset-0 opacity-70" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("signin")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Verify"
      />
      <Pad className="pt-8">
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-navy">Enter your code.</h1>
        <p className="mt-1.5 text-mut">
          We sent a 6-digit code to <b className="text-ink">{s.phone || "your phone"}</b>.
        </p>
        <div className="my-7">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            inputMode="numeric"
            className="text-center text-xl font-extrabold tracking-[0.3em]"
          />
        </div>
        <Btn disabled={busy} onClick={verify}>
          {busy ? "Checking…" : "Verify & continue"}
        </Btn>
        <p className="mt-3.5 text-center text-xs text-mut">
          Didn't get it?{" "}
          <button
            type="button"
            className="font-bold text-teal"
            onClick={async () => {
              const { generateOtpCode, storeOtp, sendOtpViaSms } = await import("@/lib/vimbiso/api");
              const c = generateOtpCode();
              await storeOtp(s.phone, c);
              const sms = await sendOtpViaSms(s.phone, c);
              s.toastMsg(sms.ok ? "Code resent by SMS" : `Code: ${c}`);
            }}
          >
            Resend
          </button>
        </p>
      </Pad>
    </section>
  );
}

export function SignupScreen() {
  const s = useVimbiso();
  const roles: { id: Role; label: string; icon: typeof ShoppingBag }[] = [
    { id: "buyer", label: "Buy things", icon: ShoppingBag },
    { id: "trader", label: "Sell things", icon: Store },
    { id: "both", label: "Buy and sell", icon: RefreshCw },
    { id: "delivery", label: "Deliver things", icon: Bike },
  ];

  return (
    <section className="vn-screen">
      <Photo src={IMG.onboard} alt="Grocery aisles of fresh food" overlay="soft" className="absolute inset-0" />
      <TopBar
        left={
          <IconBtn onClick={() => s.go("welcome")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Create account"
      />
      <Pad className="relative z-[2] pt-3">
        <Steps total={3} current={s.suStep} />
        {s.suStep === 1 && (
          <>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-navy">
              Start with your phone.
            </h1>
            <p className="mt-1.5 mb-4 text-mut">We'll text you a code. No password to remember.</p>
            <Field label="Phone number">
              <Input value={s.phone} onChange={(e) => s.set({ phone: e.target.value })} />
            </Field>
            <Btn
              className="mt-3.5"
              onClick={async () => {
                if (s.phone.trim().length < 9) {
                  s.toastMsg("Enter a valid phone number");
                  return;
                }
                const { generateOtpCode, storeOtp, sendOtpViaSms } = await import("@/lib/vimbiso/api");
                const c = generateOtpCode();
                const { error } = await storeOtp(s.phone.trim(), c);
                if (error) {
                  s.toastMsg("Could not send code");
                  return;
                }
                const sms = await sendOtpViaSms(s.phone.trim(), c);
                s.toastMsg(sms.ok ? "Code sent by SMS" : `Code: ${c}`);
                s.set({ suStep: 2 });
              }}
            >
              Send code
            </Btn>
          </>
        )}
        {s.suStep === 2 && (
          <>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-navy">Enter code.</h1>
            <p className="mt-1.5 mb-4 text-mut">Sent to {s.phone}</p>
            <Input
              placeholder="6-digit code"
              inputMode="numeric"
              className="text-center text-xl font-extrabold tracking-[0.3em]"
              onChange={(e) => s.set({ search: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
            <Btn
              className="mt-4"
              onClick={async () => {
                const code = s.search;
                if (!code || code.length < 4) {
                  s.toastMsg("Enter the code");
                  return;
                }
                const { verifyOtp } = await import("@/lib/vimbiso/api");
                const { ok, error } = await verifyOtp(s.phone.trim(), code);
                if (!ok) {
                  s.toastMsg(error || "Invalid code");
                  return;
                }
                s.set({ suStep: 3, search: "" });
              }}
            >
              Verify
            </Btn>
          </>
        )}
        {s.suStep === 3 && (
          <>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-navy">Who are you?</h1>
            <p className="mt-1.5 mb-4 text-mut">This builds your Vimbiso identity.</p>
            <Field label="Full name">
              <Input value={s.name} onChange={(e) => s.set({ name: e.target.value })} />
            </Field>
            <div className="mt-2.5">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">
                I want to
              </span>
              <div className="grid gap-2">
                {roles.map((r) => (
                  <Choice
                    key={r.id}
                    active={s.regRole === r.id}
                    onClick={() => s.set({ regRole: r.id })}
                  >
                    <span className="inline-flex items-center gap-2">
                      <r.icon className="size-4" />
                      {r.label}
                    </span>
                  </Choice>
                ))}
              </div>
            </div>
            <div className="mt-2.5">
              <Field label="City">
                <select
                  className="w-full rounded-sm border-[1.5px] border-line bg-white px-3.5 py-3.5 text-[15px] outline-none focus:border-teal"
                  value={s.city}
                  onChange={(e) => s.set({ city: e.target.value })}
                >
                  {["Chitungwiza", "Harare", "Bulawayo", "Mutare"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Btn
              variant="gold"
              className="mt-4"
              onClick={async () => {
                if (!s.name.trim() || !s.phone.trim()) {
                  s.toastMsg("Name and phone required");
                  return;
                }
                const roles =
                  s.regRole === "both"
                    ? ["buyer", "trader"]
                    : [s.regRole === "admin" ? "buyer" : s.regRole];
                const { registerUser } = await import("@/lib/vimbiso/api");
                const { user, error } = await registerUser({
                  phone: s.phone.trim(),
                  name: s.name.trim(),
                  city: s.city || "Harare",
                  roles,
                });
                if (error || !user) {
                  s.toastMsg(error || "Could not create account");
                  return;
                }
                s.set({
                  userId: user.id,
          trustScore: user.trust_score ?? 0,
          rating: user.rating ?? 0,
          completedTrades: user.completed_trades ?? 0,
          vimbisoId: user.vimbiso_id ?? null,
          userStatus: user.status ?? "pending",
          name: user.name || s.name,
          city: user.city || s.city,
                });
                s.toastMsg("Account created — waiting for admin approval");
                if (s.regRole === "delivery") s.go("delreg");
                else s.go("identity");
              }}
            >
              Create my Vimbiso ID
            </Btn>
          </>
        )}
      </Pad>
    </section>
  );
}

export function IdentityScreen() {
  const { name, city, enterApp, regRole, vimbisoId, userStatus } = useVimbiso();
  const pending = userStatus === "pending";
  return (
    <section className="vn-screen bg-navy-3 text-white">
      <Photo src={IMG.identity} alt="Handshake after a trade" overlay="navy" kenBurns className="absolute inset-0" />
      <Pad className="relative z-[2] pt-10 text-center">
        <p className="text-[11px] font-extrabold tracking-[0.08em] text-gold-2 uppercase">
          {pending ? "Identity submitted — awaiting approval" : "Your Vimbiso Identity is ready"}
        </p>
        <h1 className="font-display mt-2 text-[28px] font-extrabold text-white">
          {pending ? "Almost on the network." : "You're on the network."}
        </h1>
        <div className="vn-idcard mt-4 text-left">
          <div className="text-[11px] font-extrabold tracking-[0.14em] text-gold-2">VIMBISO ID</div>
          <div className="mt-1 mb-3 font-mono text-[28px] font-extrabold tracking-wide">
            {vimbisoId || "VMB-······"}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[17px] font-extrabold">{name || "—"}</div>
              <div className="text-xs text-white/70">{city || "Zimbabwe"}, Zimbabwe</div>
            </div>
            <Badge tone="glass">{pending ? "Pending" : "Verified"}</Badge>
          </div>
        </div>
        <div className="mx-auto mt-4 w-max rounded-[18px] bg-white p-3.5 shadow-[var(--shadow-card)]">
          <img src="/images/qr-id.png" alt="Vimbiso identity QR code" width={150} height={150} className="block rounded-xs" />
        </div>
        <p className="mt-2.5 text-xs text-white/70">
          {pending
            ? "An admin must approve your account before full trading."
            : "Scan to verify · resolves to vimbiso.co/id"}
        </p>
        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
          <Badge tone="gold">{pending ? "Awaiting approval" : "NFC card ready"}</Badge>
          <Badge tone="teal">QR identity</Badge>
        </div>
        <Btn variant="gold" className="mt-5" onClick={() => enterApp(regRole)}>
          {pending ? "Continue (limited access)" : "Enter Vimbiso"}
        </Btn>
      </Pad>
    </section>
  );
}

export function DelRegScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen">
      <Photo src={IMG.delivery} alt="Motorcycle on the open road" overlay="header" className="mid" />
      <TopBar
        ghost
        left={
          <IconBtn light onClick={() => s.go("signup")}>
            <ChevronLeft />
          </IconBtn>
        }
        title={<span className="text-white">Register vehicle</span>}
      />
      <Pad className="-mt-8">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-navy">
          Set up your delivery profile.
        </h1>
        <p className="mt-1.5 mb-4 text-mut">
          Register your vehicle so buyers and traders can trust your deliveries.
        </p>
        <div className="vn-idcard">
          <div className="text-[10px] font-extrabold tracking-[0.14em] text-gold-2 uppercase">
            Vimbiso Delivery ID
          </div>
          <div className="mt-1 font-mono text-[22px] font-extrabold">VMB-DEL-003217</div>
          <div className="mt-2 flex justify-between text-xs text-white/80">
            <span>Driver</span>
            <b className="text-white">{s.name}</b>
          </div>
          <div className="flex justify-between text-xs text-white/80">
            <span>Vehicle</span>
            <b className="text-white">
              {s.make} · {s.vehicle}
            </b>
          </div>
          <div className="flex justify-between text-xs text-white/80">
            <span>Colour</span>
            <b className="text-white">{s.vehicleColor}</b>
          </div>
          <div className="mt-1.5 inline-block rounded-xs bg-white/12 px-3 py-1 font-mono text-xl font-extrabold tracking-widest">
            {s.plate.toUpperCase()}
          </div>
        </div>
        <div className="mt-4">
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">
            Vehicle type
          </span>
          <div className="grid grid-cols-4 gap-2.5">
            {["Motorcycle", "Car", "Van", "Bicycle"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => s.set({ vehicle: v })}
                className={
                  s.vehicle === v
                    ? "rounded-[18px] border-2 border-teal bg-teal/6 px-2 py-4 text-center text-[11px] font-bold text-navy"
                    : "rounded-[18px] border-2 border-line bg-white px-2 py-4 text-center text-[11px] font-bold text-navy"
                }
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2.5">
          <Field label="Make & model">
            <Input value={s.make} onChange={(e) => s.set({ make: e.target.value })} />
          </Field>
          <Field label="Plate number">
            <Input
              value={s.plate}
              onChange={(e) => s.set({ plate: e.target.value })}
              className="font-extrabold tracking-wider uppercase"
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">
              Colour
            </span>
            <div className="flex gap-2">
              {[
                ["#DC2626", "Red"],
                ["#1D4ED8", "Blue"],
                ["#16A34A", "Green"],
                ["#F59E0B", "Yellow"],
                ["#17202A", "Black"],
                ["#FFFFFF", "White"],
                ["#6B7280", "Grey"],
              ].map(([hex, n]) => (
                <button
                  key={n}
                  type="button"
                  aria-label={n}
                  onClick={() => s.set({ vehicleColor: n })}
                  style={{ background: hex }}
                  className={cn(
                    "h-[34px] w-[34px] rounded-full border-2 shadow-sm",
                    s.vehicleColor === n ? "border-teal ring-2 ring-teal/30" : "border-line",
                  )}
                />
              ))}
            </div>
          </div>
          <Field label="Insurance provider">
            <Input value={s.insurance} onChange={(e) => s.set({ insurance: e.target.value })} />
          </Field>
          <Field label="Policy number">
            <Input value={s.policy} onChange={(e) => s.set({ policy: e.target.value })} />
          </Field>
        </div>
        <Btn variant="gold" className="mt-4" onClick={() => s.go("delid")}>
          Get my Delivery ID
        </Btn>
      </Pad>
    </section>
  );
}

export function DelIdScreen() {
  const s = useVimbiso();
  return (
    <section className="vn-screen bg-navy-3">
      <Photo src={IMG.road} alt="Open road for deliveries" overlay="navy" kenBurns className="absolute inset-0" />
      <Pad className="relative z-[2] pt-10 text-center">
        <p className="text-[11px] font-extrabold tracking-[0.08em] text-gold-2 uppercase">
          Your Delivery Identity is ready
        </p>
        <h1 className="font-display mt-2 text-[28px] font-extrabold text-white">You're on the road.</h1>
        <div className="vn-idcard mt-4 text-left">
          <div className="text-[11px] font-extrabold tracking-[0.14em] text-gold-2">VIMBISO DELIVERY ID</div>
          <div className="mt-1 mb-3 font-mono text-[26px] font-extrabold">VMB-DEL-003217</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[17px] font-extrabold text-white">{s.name}</div>
              <div className="text-xs text-white/70">
                {s.make} · {s.plate}
              </div>
            </div>
            <Badge tone="glass">Insured</Badge>
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-white/70">Insurance</span>
            <b className="text-white">
              {s.insurance} · {s.policy}
            </b>
          </div>
        </div>
        <div className="mx-auto mt-4 w-max rounded-[18px] bg-white p-3.5 shadow-[var(--shadow-card)]">
          <img src="/images/qr-del.png" alt="Delivery identity QR" width={150} height={150} />
        </div>
        <p className="mt-2.5 text-xs text-white/70">Scan at pickup · verifies driver + vehicle</p>
        <Btn variant="gold" className="mt-5" onClick={() => s.enterApp("delivery")}>
          Start finding jobs
        </Btn>
      </Pad>
    </section>
  );
}

export function UssdScreen() {
  const s = useVimbiso();
  const key = s.ussdStack[s.ussdStack.length - 1] ?? "main";
  const text = {
    main: "Welcome to Vimbiso\n\n1. Buy something\n2. I'm a trader\n3. My orders\n4. My Vimbiso ID\n5. Transaction history\n6. Delivery jobs\n0. Exit",
    buy: "What do you need?\nEnter text or:\n1. Tomatoes\n2. Maize meal\n3. Charger",
    buyres: "Searching...\n\n20kg tomatoes\n3 traders online near you\n\n1. See prices\n2. Place order\n0. Back",
    id: "Your Vimbiso ID:\nVMB-004821\nStatus: Verified\nTrust: 94\n\n0. Back",
    hist: "Recent trades:\n1. 20kg tomatoes  $15  done\n2. Charger  $4  done\n\n0. Back",
    del: "Delivery jobs near you:\n1. 20kg tomatoes  $3.50\n2. Maize 50kg  $2.50\n\n1. Accept  0. Back",
  }[key] ?? "";

  const map: Record<string, Record<string, string>> = {
    main: { "1": "buy", "2": "main", "4": "id", "5": "hist", "6": "del" },
    buy: { "1": "buyres", "2": "buyres", "3": "buyres" },
    buyres: { "1": "buyres", "2": "hist" },
    del: { "1": "hist" },
  };

  function press(k: string) {
    if (k === "0" || k === "#") {
      if (s.ussdStack.length > 1) s.set({ ussdStack: s.ussdStack.slice(0, -1) });
      else {
        s.toastMsg("USSD session ended");
        s.go("welcome");
      }
      return;
    }
    const next = (map[key] ?? {})[k];
    if (next) s.set({ ussdStack: [...s.ussdStack, next] });
    else s.toastMsg("Option " + k);
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <section className="vn-screen p-0">
      <div className="ussd-wrap">
        <div className="flex justify-between px-[18px] pt-2 text-[11px] text-[#6fbf6f]">
          <span>Vimbiso</span>
          <span>2G</span>
          <span>84%</span>
        </div>
        <div className="ussd-screen">{text}</div>
        <div className="grid grid-cols-3 gap-2 px-[18px] pt-3.5 pb-6">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="rounded-[10px] border border-[#2a3a2a] bg-[#1c2c1c] py-3.5 font-bold text-[#9fef9f] active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="px-[18px] pb-4">
          <button
            type="button"
            onClick={() => {
              if (s.ussdStack.length > 1) s.set({ ussdStack: s.ussdStack.slice(0, -1) });
              else s.go("welcome");
            }}
            className="w-full rounded-[10px] bg-[#243824] py-3.5 font-bold text-[#9fef9f]"
          >
            Back / Exit
          </button>
        </div>
      </div>
    </section>
  );
}

