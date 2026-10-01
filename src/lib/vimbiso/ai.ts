import { config } from "./config";
import { parseDeal } from "./deal-desk";

export function aiConfigured() {
  return Boolean(config.gemini.apiKey && String(config.gemini.apiKey).length > 10);
}

const SYSTEM_SHONA = `Iwe ndiwe Vimby, mubatsiri weVimbiso Network (kutengeserana kuZimbabwe).
TAURA MUCHISHONA chete (Shona only). Usashandise Chirungu kunze kwekuti mushandisi atanga neChirungu — asi prefer Shona.
Batsira zvese zvine chekuita nebhizinesi paVimbiso:
- kutenga, kutengesa, bids, offers, delivery, map/nearby, chat, orders, profile, trust, EcoCash/cash on collect, pooling
- kuti munhu aise order, aone orders, ashandure profile, awane vari pedyo
Usabvise zita remunhu kana mitengo isiri yechokwadi. Kana usina data ye live, udza mushandisi kuti aise bid kana avhure map.
Mhinduro pfupi: mitsara 1–3. Iva interactive — bvunza mubvunzo umwe unotevera kana zvakakodzera.
Kana vakati "buy" / "tenga" / "order" — vatungamirire kuMy need kana explain matanho.
Kana "nearby" / "pedyo" — vatungamirire kuFind nearby.
Kana "orders" / "maorder" — ku status/orders.
Kana "profile" / "picha" — ku profile.
Uri mubatsiri webhizinesi pa app iyi, kwete homework kana politics.`;

/** Local Shona-first helper when Gemini is offline */
export function localAssist(userMessage: string, role?: string, name?: string): string {
  const who = (name || "").trim().split(/\s+/)[0] || "shamwari";
  const t = (userMessage || "").trim().toLowerCase();
  const draft = parseDeal(userMessage || "");

  if (!t || /hello|hi|hey|mhoroi|sawubona|mangwanani|manheru/.test(t)) {
    if (role === "trader")
      return `Mhoroi ${who}. Ndiri Vimby paVimbiso Network. Muri kutengesa chii nhasi? Taura chigadzirwa nemutengo.`;
    if (role === "delivery")
      return `Mhoroi ${who}. Ndiri Vimby. Muri kuda mabasa ekutakura ari pedyo here?`;
    return `Mhoroi ${who}. Ndiri Vimby paVimbiso Network. Muri kuda kutenga chii nhasi? Taura chinhu nehuwandu.`;
  }

  if (/help|batsira|how (do|to)|sei|ndingaitasei|place order|order|isa order/.test(t)) {
    return `Ndinokubatsira paVimbiso. Kutenga: taura chinhu nehuwandu, wobva waisa bid paMy need. Kutengesa: tarisa zvikumbiro zvevatengi. Vari pedyo: vhura Find nearby. Maorder: vhura Status. Profile: vhura Me. Chii chaunoda kuita izvozvi?`;
  }

  if (/profile|picha|picture|photo|account|id/.test(t)) {
    return `Ndichikuvhura profile yako. Ikoko unogona kuchinja picha, kuona Vimbiso ID, neSettings.`;
  }

  if (/order|maorder|status|progress/.test(t)) {
    return `Ndichikuvhura maorder / status. Kana usina trade ichiri kufamba, icharatidza empty — zvinobva pazvisungo zvechokwadi.`;
  }

  if (/chat|message|taura|sms/.test(t)) {
    return `Ndichikuvhura Chat. Unotaura nevanhu vaunowana match navo pa network.`;
  }

  if (/map|nearby|pedyo|find|where|radar|ndiani/.test(t)) {
    return `Ndichikuvhura Find nearby. Mepu inokura kubva pane uri. Vanhu vechokwadi chete ndivo vanoonekwa.`;
  }

  if (/sell|tengesa|offer|request|zvikumbiro/.test(t) && role === "trader") {
    return `Ndichikuvhura zvikumbiro zvevatengi. Pindura zvinodiwa zviri live.`;
  }

  if (/deliver|kutakura|job|ride/.test(t)) {
    return role === "delivery"
      ? `Ndichikuvhura mabasa ekutakura ari pedyo.`
      : `Delivery inowanikwa mushure mekunge wawana trader. Ndichikuvhura mepu.`;
  }

  if (draft) {
    const price = draft.maxPrice != null ? ` mutengo usapfuure ${draft.maxPrice}` : "";
    const city = draft.city ? ` ku${draft.city}` : "";
    return `Ndanzwisisa ${who}: ${draft.qty} ${draft.unit} ye${draft.item}${price}${city}. Ndichikuvhura My need kuti uise bid pa network.`;
  }

  if (/buy|tenga|need|want|order|tomato|madomasi|maize|hupfu|onion|hanyanisi|banana/.test(t)) {
    return `Taura huwandu nemutengo wako, semuenzaniso: madomasi 20kg mutengo 15. Ndichizokuvhura My need.`;
  }

  if (/home|enda kumba|stop|exit|close|hang/.test(t)) {
    return `Ndichikudzosa kuhome yeVimbiso.`;
  }

  return `Ndiri Vimby paVimbiso chete. Taura zvaunoda kutenga kana kutengesa, kana ti: map, chat, orders, profile, help.`;
}

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-flash-latest"];

export async function assistReply(
  userMessage: string,
  context?:
    | string
    | {
        role?: string;
        city?: string;
        name?: string;
        onlineTraders?: number;
        sampleNames?: string[];
      },
  meta?: { role?: string; name?: string },
): Promise<string> {
  let role = meta?.role;
  let name = meta?.name;
  let contextLine = "";
  if (typeof context === "string") {
    contextLine = context;
  } else if (context && typeof context === "object") {
    role = context.role || role;
    name = context.name || name;
    contextLine = [
      context.city ? `City: ${context.city}` : "",
      context.onlineTraders != null ? `Online traders count: ${context.onlineTraders}` : "",
      context.sampleNames?.length ? `Names on network (real only): ${context.sampleNames.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(". ");
  }

  const key = config.gemini.apiKey;
  const fallback = () => localAssist(userMessage, role, name);

  if (!key || String(key).length < 10) return fallback();

  const bodyBase = {
    systemInstruction: { parts: [{ text: SYSTEM_SHONA }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              (contextLine ? `Mamiriro eapp: ${contextLine}\n` : "") +
              (name ? `Zita: ${name}. ` : "") +
              (role ? `Basa: ${role}. ` : "") +
              `Mushandisi ati: ${userMessage || "avhura Vimby"}`,
          },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 220, temperature: 0.45 },
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
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
      if (text) return text;
    } catch {
      /* next */
    }
  }
  return fallback();
}

export function welcomeScript(name?: string, role?: string): string[] {
  return [localAssist("mhoroi", role, name)];
}

/** App navigation from speech/text */
export function routeFromSpeech(
  text: string,
  role: string,
): "bid" | "radar" | "messages" | "incoming" | "delJobs" | "profile" | "status" | "settings" | "home" | null {
  const t = text.toLowerCase();
  if (/home|enda kumba|stop|exit|close|hang up/.test(t)) return "home";
  if (/profile|picha|picture|photo|me screen|account/.test(t)) return "profile";
  if (/setting/.test(t)) return "settings";
  if (/order|maorder|status|progress/.test(t)) return "status";
  if (/message|chat|taura ne/.test(t)) return "messages";
  if (/map|nearby|pedyo|find|where|radar|ndiani/.test(t)) return "radar";
  if (/deliver|kutakura|job|ride/.test(t)) return role === "delivery" ? "delJobs" : "radar";
  if (/sell|tengesa|offer|request|zvikumbiro/.test(t) && role === "trader") return "incoming";
  if (/buy|tenga|need|want|order|bid|my need|tomato|madomasi|maize|onion|banana/.test(t)) return "bid";
  if (parseDeal(text)) return "bid";
  return null;
}
