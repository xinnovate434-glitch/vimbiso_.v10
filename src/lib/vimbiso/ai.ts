import { config } from "./config";
import { parseDeal } from "./deal-desk";

export function aiConfigured() {
  return Boolean(config.gemini.apiKey && String(config.gemini.apiKey).length > 10);
}

const SYSTEM = `You are Vimby, voice assistant inside Vimbiso Network (Zimbabwe informal trade).
ONLY help with this app: buy, sell, bids, offers, delivery, map, chat, meet points, trust, EcoCash/cash on collect.
Never invent fake traders or prices. 1–3 short spoken sentences. Simple English.
Ask one clear next question when needed.`;

/** Local brain when Gemini key is missing or API fails — still useful for low-literacy / blind users. */
export function localAssist(userMessage: string, role?: string, name?: string): string {
  const who = (name || "").trim().split(/\s+/)[0] || "friend";
  const t = (userMessage || "").trim().toLowerCase();
  const draft = parseDeal(userMessage || "");

  if (!t || /hello|hi|hey|mhoroi|sawubona/.test(t)) {
    if (role === "trader") return `Hello ${who}. I'm Vimby. What are we selling today? Say the product and price.`;
    if (role === "delivery") return `Hello ${who}. I'm Vimby. Say open jobs if you want delivery work near you.`;
    return `Hello ${who}. I'm Vimby on Vimbiso Network. What are we buying today? Say the item and quantity.`;
  }

  if (/help|what can you|how (do|to)|blind|can't see|cannot see/.test(t)) {
    return `I am Vimby. Speak or type what you need. Say buy tomatoes, find nearby, open chat, or hang up for the home screen. I only help inside Vimbiso Network.`;
  }

  if (/chat|message|sms/.test(t)) {
    return `Opening chat. You can message people you match with on the network.`;
  }
  if (/map|nearby|near me|find|where|radar/.test(t)) {
    return `Opening Find nearby. The map expands from your position. Only real network users appear.`;
  }
  if (/sell|offer|request/.test(t) && role === "trader") {
    return `Opening buyer requests. Answer live needs on the network.`;
  }
  if (/deliver|job|ride/.test(t)) {
    return role === "delivery"
      ? `Opening delivery jobs near you.`
      : `You can ask for delivery after you match a trader. Opening the map.`;
  }

  if (draft) {
    const price = draft.maxPrice != null ? ` max ${draft.maxPrice} dollars` : "";
    const city = draft.city ? ` in ${draft.city}` : "";
    return `Got it ${who}: ${draft.qty} ${draft.unit} of ${draft.item}${price}${city}. I will open My need so you can post this on the live network.`;
  }

  if (/buy|need|want|order|tomato|maize|onion|banana|meal/.test(t)) {
    return `Tell me the quantity and your max price, for example twenty kg tomatoes max fifteen. Then I open My need for you.`;
  }

  return `I'm with you on Vimbiso only. Say what to buy or sell, or say map, chat, or help.`;
}

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-flash-latest",
];

export async function assistReply(
  userMessage: string,
  contextLine?: string,
  meta?: { role?: string; name?: string },
): Promise<string> {
  const key = config.gemini.apiKey;
  const fallback = () => localAssist(userMessage, meta?.role, meta?.name);

  if (!key || String(key).length < 10) {
    return fallback();
  }

  const bodyBase = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              (contextLine ? `App context: ${contextLine}\n` : "") +
              (meta?.name ? `User name: ${meta.name}. ` : "") +
              (meta?.role ? `Role: ${meta.role}. ` : "") +
              `User said: ${userMessage || "opened Vimby"}`,
          },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 160, temperature: 0.35 },
  };

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyBase),
        },
      );
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
      if (text) return text;
    } catch {
      /* try next model */
    }
  }

  return fallback();
}

export function welcomeScript(name?: string, role?: string): string[] {
  return [localAssist("hello", role, name)];
}
