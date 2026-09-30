import { config } from "./config";

export function aiConfigured() {
  return Boolean(config.gemini.apiKey);
}

const SYSTEM = `You are Vimby, the voice and chat assistant inside the Vimbiso Network app (Zimbabwe informal trade). Speak as Vimby — friendly, short, professional.

STRICT RULES:
- ONLY answer questions about Vimbiso Network: buying, selling, bids, offers, traders, buyers, delivery, prices in USD/ZWL context, EcoCash/cash on collect, pooling (mukando), network map, trust/Vimbiso ID, USSD lite, and how to use THIS app.
- If the user asks about politics, homework, general knowledge, other apps, or anything off-topic, reply in one short line: "I only help with Vimbiso Network trading. Tell me what you need to buy or sell."
- Never invent fake traders, names, or live prices. If no live data is provided in the context, say so and guide them to post a bid or open Network map / Messages.
- Be interactive: ask one clear next question (qty, city, quality, delivery vs collect).
- 1–3 short sentences max. Simple English (or match user if they write Shona/Ndebele briefly).
- When they name a product (e.g. bananas), help them build a bid: item, quantity, unit, and next step in the app.`;

export type NetworkContext = {
  role?: string;
  city?: string;
  name?: string;
  onlineTraders?: number;
  sampleNames?: string[];
};

/** Vimbiso business-only Gemini reply */
export async function assistReply(
  userMessage: string,
  ctx: NetworkContext = {},
): Promise<string> {
  const key = config.gemini.apiKey;
  const contextLine = [
    ctx.role ? `User role: ${ctx.role}` : "",
    ctx.city ? `City: ${ctx.city}` : "",
    ctx.name ? `Name: ${ctx.name}` : "",
    typeof ctx.onlineTraders === "number"
      ? `Approved network users visible now: ${ctx.onlineTraders}`
      : "",
    ctx.sampleNames?.length
      ? `Some network display names (not demo): ${ctx.sampleNames.slice(0, 8).join(", ")}`
      : "No other network users in context yet.",
  ]
    .filter(Boolean)
    .join(". ");

  if (!key) {
    const m = (userMessage || "").toLowerCase();
    if (!m || /hello|hi|hey|how are/.test(m)) {
      return "Welcome to Vimbiso Network. Tell me what you want to buy or sell — I'll help you use this app only.";
    }
    if (/banana|tomato|meal|maize|onion|potato|need|want|buy|sell/.test(m)) {
      return `Got it: "${userMessage}". Open Build a bid, set quantity and your price, then Find traders on the network map. I only assist with Vimbiso trading.`;
    }
    return "I only help with Vimbiso Network (buy, sell, bids, map, messages). What do you need on the network?";
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    (contextLine ? `App context: ${contextLine}\n\n` : "") +
                    `User message: ${userMessage || "opened assistant"}`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 180, temperature: 0.4 },
        }),
      },
    );
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text;
    if (data.error?.message) {
      return "AI is briefly unavailable. Use Build a bid or Network map — still inside Vimbiso only.";
    }
  } catch {
    /* fall through */
  }
  return "Could not reach Gemini. Type your product on Home and Build a bid on Vimbiso Network.";
}

/** First-open welcome lines (typed on screen) */
export function welcomeScript(name?: string, role?: string): string[] {
  const who = name ? `, ${name}` : "";
  const roleHint =
    role === "trader"
      ? "As a trader you can answer buyer requests and post offers on the live network."
      : role === "delivery"
        ? "As delivery you can take jobs between buyers and traders."
        : "You can say what you need, pool with neighbours, and meet traders on the network map.";
  return [
    `Hello${who}. I'm Vimby — welcome to Vimbiso Network.`,
    "Vimbiso Network is a live trading network for buyers, traders, and delivery.",
    roleHint,
    "Talk or type anytime. What do you need today?",
  ];
}
