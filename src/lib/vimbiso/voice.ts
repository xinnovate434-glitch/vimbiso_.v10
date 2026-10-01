/**
 * Vimby voice out:
 * 1) ElevenLabs via native CapacitorHttp (avoids WebView CORS)
 * 2) Device speechSynthesis
 * 3) Short audio URL fallback
 */

import { config, elevenConfigured } from "./config";

let unlocked = false;
let currentAudio: HTMLAudioElement | null = null;
let lastError = "";

export function getLastVoiceError() {
  return lastError;
}

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function canSpeak(): boolean {
  return true; // we always attempt at least one path
}

/** Must run on a user tap once */
export function unlockAudio() {
  unlocked = true;
  try {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(".");
      u.volume = 0.01;
      window.speechSynthesis.speak(u);
      window.setTimeout(() => {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }, 30);
    }
  } catch {
    /* ignore */
  }
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    void ctx.resume();
  } catch {
    /* ignore */
  }
}

type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: {
    results: { [i: number]: { [j: number]: { transcript: string } }; length: number };
  }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function listenOnce(lang = "en-US", timeoutMs = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      reject(new Error("Mic haipo — nyora pasi."));
      return;
    }
    unlockAudio();
    const rec = new Ctor();
    rec.lang = lang || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      fn();
    };
    const timer = window.setTimeout(() => finish(() => reject(new Error("Handina kunzwa"))), timeoutMs);
    rec.onresult = (ev) => {
      let text = "";
      try {
        for (let i = 0; i < (ev.results?.length || 0); i++) text += ev.results[i]?.[0]?.transcript || "";
      } catch {
        /* ignore */
      }
      text = text.trim();
      window.clearTimeout(timer);
      if (!text) finish(() => reject(new Error("Handina kunzwisisa")));
      else finish(() => resolve(text));
    };
    rec.onerror = () => {
      window.clearTimeout(timer);
      finish(() => reject(new Error("Mic yakatadza")));
    };
    rec.onend = () => {
      window.clearTimeout(timer);
      if (!settled) finish(() => reject(new Error("Listening yakapera")));
    };
    try {
      rec.start();
    } catch {
      window.clearTimeout(timer);
      reject(new Error("Mic yatadza"));
    }
  });
}

function stopAudio() {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
  } catch {
    /* ignore */
  }
}

async function playBlob(buf: ArrayBuffer, mime = "audio/mpeg") {
  stopAudio();
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = new Audio(url);
  a.setAttribute("playsinline", "true");
  currentAudio = a;
  await a.play();
  a.onended = () => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  };
}

/** Capacitor native HTTP bypasses CORS for ElevenLabs */
async function elevenLabsNative(text: string): Promise<boolean> {
  const key = config.elevenlabs?.apiKey;
  const voiceId = config.elevenlabs?.voiceId || "21m00Tcm4TlvDq8ikWAM";
  if (!key || !text) return false;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const body = JSON.stringify({
    text: text.slice(0, 2500),
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.45, similarity_boost: 0.75 },
  });

  // Try CapacitorHttp (native, no CORS)
  try {
    const Cap = (window as unknown as { Capacitor?: { Plugins?: { CapacitorHttp?: {
      request: (opts: Record<string, unknown>) => Promise<{ status: number; data: string; headers?: Record<string, string> }>;
    } } } }).Capacitor;
    const Http = Cap?.Plugins?.CapacitorHttp;
    if (Http?.request) {
      const res = await Http.request({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "xi-api-key": key,
        },
        data: body,
        responseType: "arraybuffer",
      });
      if (res.status >= 200 && res.status < 300 && res.data) {
        // Capacitor may return base64 string for binary
        let buf: ArrayBuffer;
        if (typeof res.data === "string") {
          const binary = atob(res.data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          buf = bytes.buffer;
        } else {
          buf = res.data as unknown as ArrayBuffer;
        }
        await playBlob(buf);
        lastError = "";
        return true;
      }
      lastError = `ElevenLabs HTTP ${res.status}`;
    }
  } catch (e) {
    lastError = e instanceof Error ? e.message : "CapacitorHttp fail";
  }

  // Browser fetch (works on some WebViews / desktop)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": key,
      },
      body,
    });
    if (!res.ok) {
      lastError = `ElevenLabs ${res.status}`;
      return false;
    }
    const buf = await res.arrayBuffer();
    await playBlob(buf);
    lastError = "";
    return true;
  } catch (e) {
    lastError = e instanceof Error ? e.message : "fetch CORS/network";
    return false;
  }
}

function speakNative(text: string, lang: string): boolean {
  try {
    if (!window.speechSynthesis) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang.startsWith("sn") ? "en-US" : lang || "en-US";
    u.rate = 0.92;
    u.volume = 1;
    const voices = synth.getVoices() || [];
    const prefer =
      voices.find((v) => /en-US|en_GB|en-/i.test(v.lang || "")) || voices[0];
    if (prefer) u.voice = prefer;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

function speakAudioFallback(text: string) {
  stopAudio();
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!clean) return;
  // Split into short chunks for reliability
  const chunk = clean;
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
    encodeURIComponent(chunk);
  try {
    const a = new Audio(url);
    a.setAttribute("playsinline", "true");
    a.volume = 1;
    currentAudio = a;
    void a.play().catch((err) => {
      lastError = String(err);
    });
  } catch (e) {
    lastError = e instanceof Error ? e.message : "audio fail";
  }
}

export function speak(text: string, lang = "en-US") {
  if (!text) return;
  unlockAudio();
  stopAudio();
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  void (async () => {
    if (elevenConfigured()) {
      const ok = await elevenLabsNative(text);
      if (ok) return;
    }
    const ok = speakNative(text, lang);
    if (!ok) {
      speakAudioFallback(text);
      return;
    }
    // Android often reports speak() but is silent
    window.setTimeout(() => {
      try {
        if (!window.speechSynthesis?.speaking) speakAudioFallback(text);
      } catch {
        speakAudioFallback(text);
      }
    }, 500);
  })();
}

export async function speakAsync(text: string, lang = "en-US"): Promise<void> {
  if (!text) return;
  unlockAudio();
  stopAudio();
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  if (elevenConfigured()) {
    const ok = await elevenLabsNative(text);
    if (ok) {
      await new Promise((r) => setTimeout(r, Math.min(14000, 800 + text.length * 55)));
      return;
    }
  }
  speakNative(text, lang);
  speakAudioFallback(text); // dual path so something is heard
  await new Promise((r) => setTimeout(r, Math.min(9000, 500 + text.length * 50)));
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  stopAudio();
}
