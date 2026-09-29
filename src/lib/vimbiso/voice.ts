/** Web Speech API helpers for ordering (works in Chrome; limited in some WebViews). */

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
      .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function listenOnce(lang = "en-ZW"): Promise<string> {
  return new Promise((resolve, reject) => {
    const W = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      reject(new Error("Voice input not supported on this device browser"));
      return;
    }
    const rec = new Ctor();
    rec.lang = lang || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results?.[0]?.[0]?.transcript || "";
      resolve(text.trim());
    };
    rec.onerror = (ev: Event & { error?: string }) => {
      reject(new Error(ev.error || "Voice error"));
    };
    rec.start();
  });
}

export function speak(text: string, lang = "en-US") {
  if (!canSpeak()) return;
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
