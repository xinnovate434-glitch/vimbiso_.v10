/** Voice — listen and speak. Never invents transcripts. */

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
  try {
    return typeof window.speechSynthesis !== "undefined" && window.speechSynthesis !== null;
  } catch {
    return false;
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
  abort: () => void;
};

export function listenOnce(lang = "en-US", timeoutMs = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      reject(new Error("Mic not available in this WebView — type instead."));
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
      finish(() => reject(new Error("No speech heard — tap the mic and try again")));
    }, timeoutMs);

    rec.onresult = (ev) => {
      let text = "";
      try {
        const n = ev.results?.length || 0;
        for (let i = 0; i < n; i++) {
          text += ev.results[i]?.[0]?.transcript || "";
        }
      } catch {
        text = ev.results?.[0]?.[0]?.transcript || "";
      }
      text = text.trim();
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
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Speak and resolve when utterance ends (for live turn-taking with Vimby). */
export function speakAsync(text: string, lang = "en-US"): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak() || !text) {
      resolve();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 1.02;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
