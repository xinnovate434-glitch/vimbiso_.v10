/** Voice order — only returns what the speech engine transcribed (never invents text). */

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string }; isFinal?: boolean } } }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function listenOnce(lang = "en-US"): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      reject(new Error("This phone WebView cannot use the mic for voice. Type your order instead."));
      return;
    }

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
      finish(() => reject(new Error("No speech heard — try again or type your need")));
    }, 8000);

    rec.onresult = (ev) => {
      const text = (ev.results?.[0]?.[0]?.transcript || "").trim();
      window.clearTimeout(timer);
      if (!text) {
        finish(() => reject(new Error("Could not understand — try again")));
        return;
      }
      finish(() => resolve(text));
    };
    rec.onerror = (ev) => {
      window.clearTimeout(timer);
      const code = ev.error || "error";
      const msg =
        code === "not-allowed"
          ? "Mic permission denied — allow microphone for Vimbiso"
          : code === "no-speech"
            ? "No speech heard — try again"
            : `Voice error: ${code}`;
      finish(() => reject(new Error(msg)));
    };
    rec.onend = () => {
      window.clearTimeout(timer);
      if (!settled) finish(() => reject(new Error("Listening ended — try again")));
    };

    try {
      rec.start();
    } catch {
      window.clearTimeout(timer);
      reject(new Error("Could not start microphone"));
    }
  });
}

export function speak(text: string, lang = "en-US") {
  if (!canSpeak() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
