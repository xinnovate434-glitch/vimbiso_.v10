/**
 * Vimby voice: ElevenLabs (quality) → system TTS → audio fallback.
 */

import { config, elevenConfigured } from "./config";

let unlocked = false;
let currentAudio: HTMLAudioElement | null = null;

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function canSpeak(): boolean {
  if (typeof window === "undefined") return false;
  if (elevenConfigured()) return true;
  try {
    return typeof window.speechSynthesis !== "undefined";
  } catch {
    return false;
  }
}

export function unlockAudio() {
  unlocked = true;
  try {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
  try {
    const a = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
    );
    a.volume = 0.01;
    void a.play().then(() => a.pause()).catch(() => {});
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
    results: { [i: number]: { [j: number]: { transcript: string }; isFinal?: boolean }; length: number };
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
    const timer = window.setTimeout(() => {
      finish(() => reject(new Error("Handina kunzwa — nyora pasi")));
    }, timeoutMs);
    rec.onresult = (ev) => {
      let text = "";
      try {
        const n = ev.results?.length || 0;
        for (let i = 0; i < n; i++) text += ev.results[i]?.[0]?.transcript || "";
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
      finish(() => reject(new Error("Mic yakatadza — nyora pasi")));
    };
    rec.onend = () => {
      window.clearTimeout(timer);
      if (!settled) finish(() => reject(new Error("Listening yakapera")));
    };
    try {
      rec.start();
    } catch {
      window.clearTimeout(timer);
      reject(new Error("Mic yatadza kutanga"));
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

async function speakElevenLabs(text: string): Promise<boolean> {
  const key = config.elevenlabs.apiKey;
  const voiceId = config.elevenlabs.voiceId || "21m00Tcm4TlvDq8ikWAM";
  if (!key || !text) return false;
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": key,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    stopAudio();
    const a = new Audio(url);
    currentAudio = a;
    await a.play();
    a.onended = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    };
    return true;
  } catch {
    return false;
  }
}

function speakNative(text: string, lang: string): boolean {
  try {
    if (!window.speechSynthesis) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "en-US";
    u.rate = 0.95;
    try {
      const voices = synth.getVoices() || [];
      const prefer =
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())) ||
        voices.find((v) => /en/i.test(v.lang || "")) ||
        voices[0];
      if (prefer) u.voice = prefer;
    } catch {
      /* ignore */
    }
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

function speakAudioFallback(text: string, lang: string) {
  stopAudio();
  const tl = lang.toLowerCase().startsWith("sn") ? "en" : lang.slice(0, 2) || "en";
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 180);
  if (!clean) return;
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" +
    encodeURIComponent(tl) +
    "&q=" +
    encodeURIComponent(clean);
  try {
    const a = new Audio(url);
    currentAudio = a;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Speak: ElevenLabs first, then device TTS, then fallback */
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
    const ok11 = await speakElevenLabs(text);
    if (ok11) return;
    const ok = speakNative(text, lang);
    if (!ok) speakAudioFallback(text, lang);
    else {
      window.setTimeout(() => {
        try {
          if (!window.speechSynthesis?.speaking) speakAudioFallback(text, lang);
        } catch {
          speakAudioFallback(text, lang);
        }
      }, 700);
    }
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
  const ok11 = await speakElevenLabs(text);
  if (ok11) {
    await new Promise((r) => setTimeout(r, Math.min(12000, 600 + text.length * 50)));
    return;
  }
  speakNative(text, lang);
  await new Promise((r) => setTimeout(r, Math.min(8000, 400 + text.length * 45)));
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  stopAudio();
}
