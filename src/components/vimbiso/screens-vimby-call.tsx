import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, Keyboard } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { speak, stopSpeaking, canSpeak, canListen, listenOnce } from "@/lib/vimbiso/voice";
import { assistReply } from "@/lib/vimbiso/ai";
import { parseDeal } from "@/lib/vimbiso/deal-desk";

function firstName(name: string) {
  const n = (name || "").trim().split(/\s+/)[0];
  return n || "there";
}

function welcomeLine(name: string, role: string) {
  const who = firstName(name);
  if (role === "trader") {
    return `Hello ${who}. Welcome to Vimbiso Network. I'm Vimby. What are we selling today?`;
  }
  if (role === "delivery") {
    return `Hello ${who}. Welcome to Vimbiso Network. I'm Vimby. What are we delivering today?`;
  }
  return `Hello ${who}. Welcome to Vimbiso Network. I'm Vimby. What are we buying today?`;
}

function routeFromSpeech(text: string, role: string): "bid" | "radar" | "messages" | "incoming" | "delJobs" | "home" | null {
  const t = text.toLowerCase();
  if (/message|chat|talk to|call/.test(t)) return "messages";
  if (/map|nearby|find|where|radar|near me/.test(t)) return "radar";
  if (/deliver|job|ride/.test(t)) return role === "delivery" ? "delJobs" : "radar";
  if (/sell|offer|request/.test(t) && role === "trader") return "incoming";
  if (/buy|need|order|tomato|maize|onion|want/.test(t)) return "bid";
  if (parseDeal(text)) return "bid";
  return null;
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VimbyCallScreen() {
  const s = useVimbiso();
  const [caption, setCaption] = useState("Connecting…");
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [showType, setShowType] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const line = welcomeLine(s.name, s.role);
    setCaption(line);
    try {
      localStorage.setItem("vimbiso_first_ai", "1");
    } catch {
      /* ignore */
    }
    s.set({ firstAiDone: true });
    window.setTimeout(() => {
      if (!muted) speak(line, s.lang === "sn" ? "sn-ZW" : "en-US");
    }, 450);
    // After greeting, listen once if possible
    window.setTimeout(() => {
      void listenTurn();
    }, 4200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function listenTurn() {
    if (muted || busy) return;
    if (!canListen()) {
      setShowType(true);
      setCaption("Tap the keypad and type what you need — then I will take you there.");
      return;
    }
    setListening(true);
    setCaption("I'm listening…");
    try {
      const heard = await listenOnce(s.lang === "sn" ? "sn-ZW" : "en-US", 12000);
      setListening(false);
      if (heard) await handleUser(heard);
    } catch {
      setListening(false);
      setShowType(true);
      setCaption("I didn't catch that. Type below, or hang up to go to Home.");
    }
  }

  async function handleUser(text: string) {
    setBusy(true);
    setCaption(text);
    const dest = routeFromSpeech(text, s.role);
    let reply = "";
    try {
      reply = await assistReply(text);
    } catch {
      reply = dest
        ? `Sure ${firstName(s.name)}. I'll take you there now.`
        : `Sure ${firstName(s.name)}. Tell me if you want to buy, sell, deliver, or open chat.`;
    }
    setCaption(reply);
    if (!muted) speak(reply, s.lang === "sn" ? "sn-ZW" : "en-US");

    window.setTimeout(() => {
      if (dest) s.go(dest);
      else setBusy(false);
    }, dest ? 2200 : 400);
    if (!dest) setBusy(false);
  }

  function hangUp() {
    stopSpeaking();
    s.goHome();
  }

  return (
    <section className="vn-screen flex flex-col bg-[#eef3fb] px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)]">
      <div className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden rounded-[36px] bg-gradient-to-b from-[#7ec8ff] via-[#3b9dff] to-[#1b4fd8] text-white shadow-[0_24px_60px_rgba(27,79,216,0.35)]">
        <div className="pt-8 text-center">
          <div className="text-[15px] font-semibold text-white/90">Vimby</div>
          <div className="mt-1 text-xs text-white/70">{fmtTime(elapsed)}</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
          <p className="min-h-[4.5rem] text-[22px] font-semibold leading-snug tracking-tight drop-shadow">
            “{caption}”
          </p>
          <div className="relative mt-10 h-28 w-28">
            <div className="absolute inset-0 animate-ping rounded-full bg-white/25" />
            <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#b9e4ff,transparent_55%),radial-gradient(circle_at_70%_70%,#4f7cff,transparent_50%)] shadow-[0_0_40px_rgba(255,255,255,0.45)]" />
            <div className="absolute inset-8 rounded-full bg-white/80 blur-[1px]" />
          </div>
          <p className="mt-8 text-[11px] font-medium text-white/75">
            {listening ? "Listening" : busy ? "Thinking" : canSpeak() ? "Voice on" : "Voice not on this device"}
          </p>
        </div>
      </div>

      {showType ? (
        <form
          className="mx-auto mt-3 flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) void handleUser(typed.trim());
            setTyped("");
          }}
        >
          <input
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-navy outline-none"
            placeholder="Type what you need…"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-navy px-4 text-sm font-bold text-white"
          >
            Go
          </button>
        </form>
      ) : null}

      <div className="mx-auto mt-5 flex w-full max-w-md items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => {
            setMuted((m) => {
              const next = !m;
              if (next) stopSpeaking();
              return next;
            });
          }}
          className="grid h-14 w-14 place-items-center rounded-full bg-white text-navy shadow-[0_8px_24px_rgba(15,30,60,0.12)]"
          aria-label="Mute"
        >
          {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>
        <button
          type="button"
          onClick={hangUp}
          className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#ff3b30] text-white shadow-[0_12px_28px_rgba(255,59,48,0.4)]"
          aria-label="End"
        >
          <Phone className="size-8 rotate-[135deg]" />
        </button>
        <button
          type="button"
          onClick={() => setShowType((v) => !v)}
          className="grid h-14 w-14 place-items-center rounded-full bg-white text-navy shadow-[0_8px_24px_rgba(15,30,60,0.12)]"
          aria-label="Type"
        >
          <Keyboard className="size-6" />
        </button>
      </div>
    </section>
  );
}
