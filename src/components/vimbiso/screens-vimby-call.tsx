import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, Keyboard } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { speak, stopSpeaking, canSpeak, canListen, listenOnce } from "@/lib/vimbiso/voice";
import { assistReply, localAssist } from "@/lib/vimbiso/ai";
import { parseDeal } from "@/lib/vimbiso/deal-desk";

function firstName(name: string) {
  const n = (name || "").trim().split(/\s+/)[0];
  return n || "friend";
}

function routeFromSpeech(text: string, role: string): "bid" | "radar" | "messages" | "incoming" | "delJobs" | "home" | null {
  const t = text.toLowerCase();
  if (/message|chat|talk to (a )?trader|sms/.test(t)) return "messages";
  if (/map|nearby|find|where|radar|near me/.test(t)) return "radar";
  if (/deliver|job|ride/.test(t)) return role === "delivery" ? "delJobs" : "radar";
  if (/sell|offer|request/.test(t) && role === "trader") return "incoming";
  if (/buy|need|order|tomato|maize|onion|want|banana|meal/.test(t)) return "bid";
  if (parseDeal(text)) return "bid";
  if (/home|hang up|stop|exit|close/.test(t)) return "home";
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
  const [showType, setShowType] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const started = useRef(false);

  function speakOut(text: string) {
    if (muted || !text) return;
    try {
      speak(text, s.lang === "sn" ? "sn-ZW" : "en-US");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const t = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setVoiceOk(canSpeak());
    // some Android WebViews populate voices late
    const id = window.setTimeout(() => setVoiceOk(canSpeak()), 800);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const line = localAssist("hello", s.role, s.name);
    setCaption(line);
    try {
      localStorage.setItem("vimbiso_first_ai", "1");
    } catch {
      /* ignore */
    }
    s.set({ firstAiDone: true });
    window.setTimeout(() => speakOut(line), 500);
    // auto-listen once after greeting
    window.setTimeout(() => {
      void listenTurn();
    }, 4500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function listenTurn() {
    if (muted || busy) return;
    if (!canListen()) {
      setShowType(true);
      const tip = "Mic not ready. Type below what you need, then press Go.";
      setCaption(tip);
      speakOut(tip);
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
      const tip = "I did not hear you. Type below, or say buy, map, or chat after tapping the mic.";
      setCaption(tip);
      speakOut(tip);
    }
  }

  async function handleUser(text: string) {
    setBusy(true);
    setCaption(text);
    stopSpeaking();

    // Instant local reply so blind / offline users never wait on Gemini
    const local = localAssist(text, s.role, s.name);
    setCaption(local);
    speakOut(local);

    const dest = routeFromSpeech(text, s.role);

    // Try Gemini in background to refine caption (optional)
    try {
      const reply = await assistReply(text, undefined, { role: s.role, name: s.name });
      if (reply && reply !== local) {
        setCaption(reply);
        speakOut(reply);
      }
    } catch {
      /* local already spoken */
    }

    if (dest) {
      window.setTimeout(() => {
        if (dest === "home") s.goHome();
        else s.go(dest);
      }, 2400);
    } else {
      setBusy(false);
      window.setTimeout(() => void listenTurn(), 2800);
    }
  }

  function hangUp() {
    stopSpeaking();
    s.goHome();
  }

  return (
    <section
      className="vn-screen flex flex-col bg-[#eef3fb] px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)]"
      aria-label="Vimby voice assistant"
    >
      <div className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden rounded-[36px] bg-gradient-to-b from-[#7ec8ff] via-[#3b9dff] to-[#1b4fd8] text-white shadow-[0_24px_60px_rgba(27,79,216,0.35)]">
        <div className="pt-8 text-center">
          <div className="text-[15px] font-semibold text-white/90">Vimby</div>
          <div className="mt-1 text-xs text-white/70">{fmtTime(elapsed)}</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
          <p
            className="min-h-[4.5rem] text-[20px] font-semibold leading-snug tracking-tight drop-shadow"
            aria-live="assertive"
            aria-atomic="true"
          >
            “{caption}”
          </p>
          <div className="relative mt-10 h-28 w-28" aria-hidden>
            <div className="absolute inset-0 animate-ping rounded-full bg-white/25" />
            <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#b9e4ff,transparent_55%),radial-gradient(circle_at_70%_70%,#4f7cff,transparent_50%)] shadow-[0_0_40px_rgba(255,255,255,0.45)]" />
            <div className="absolute inset-8 rounded-full bg-white/80 blur-[1px]" />
          </div>
          <p className="mt-8 text-[11px] font-medium text-white/75">
            {listening
              ? "Listening — speak now"
              : busy
                ? "Working…"
                : voiceOk
                  ? "Voice on — speak or type"
                  : "Type below if this phone has no speech"}
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
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-base text-navy outline-none"
            placeholder="Example: 20kg tomatoes max 15"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="Type what you need for Vimby"
          />
          <button type="submit" className="h-12 rounded-full bg-navy px-5 text-sm font-bold text-white">
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
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>
        <button
          type="button"
          onClick={hangUp}
          className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#ff3b30] text-white shadow-[0_12px_28px_rgba(255,59,48,0.4)]"
          aria-label="End call and go home"
        >
          <Phone className="size-8 rotate-[135deg]" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowType(true);
            void listenTurn();
          }}
          className="grid h-14 w-14 place-items-center rounded-full bg-white text-navy shadow-[0_8px_24px_rgba(15,30,60,0.12)]"
          aria-label="Type or listen again"
        >
          <Keyboard className="size-6" />
        </button>
      </div>
    </section>
  );
}
