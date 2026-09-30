/**
 * Vimby deal desk — parse a trading sentence into a structured bid draft.
 * Never invents network people; only fills what the user said.
 */

export type DealDraft = {
  item: string;
  qty: number;
  unit: string;
  maxPrice: number | null;
  city: string | null;
  fulfill: "collection" | "delivery" | null;
  raw: string;
  confidence: "high" | "low";
};

const UNITS = ["kg", "kgs", "crate", "crates", "bag", "bags", "bunch", "bunches", "dozen", "box", "boxes", "litre", "litres", "l"];
const PRODUCTS =
  /banana|bananas|tomato|tomatoes|onion|onions|potato|potatoes|cabbage|cabbages|carrot|carrots|mealie|maize|meal|rice|beans|pepper|peppers|avocado|avocados|orange|oranges|apple|apples|spinach|rape|covo|butternut|cucumber|garlic|ginger|eggs?/i;

export function parseDeal(text: string, defaultCity?: string): DealDraft | null {
  const raw = (text || "").trim();
  if (!raw) return null;
  if (!PRODUCTS.test(raw) && !/\d+\s*(kg|bag|crate)/i.test(raw)) {
    // still allow generic "I need X"
    const need = raw.match(/(?:need|want|buy|looking for|order)\s+(.+)/i);
    if (!need) return null;
  }

  let item = "goods";
  const prod = raw.match(PRODUCTS);
  if (prod) item = prod[0].toLowerCase();
  else {
    const after = raw.match(/(?:need|want|buy|looking for|order)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i);
    if (after) item = after[1].trim().split(/[.,!]/)[0].trim();
  }

  let qty = 1;
  let unit = "kg";
  const q1 = raw.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|crate|crates|bag|bags|bunch|bunches|dozen|box|boxes|l|litre|litres)\b/i);
  if (q1) {
    qty = parseFloat(q1[1]);
    unit = q1[2].toLowerCase().replace(/s$/, "").replace("kgs", "kg");
    if (unit === "litre") unit = "l";
  } else {
    const q2 = raw.match(/\b(\d+(?:\.\d+)?)\b/);
    if (q2) qty = parseFloat(q2[1]);
  }

  let maxPrice: number | null = null;
  const p1 = raw.match(/(?:max|under|upto|up to|at|@|price)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  const p2 = raw.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (p1) maxPrice = parseFloat(p1[1]);
  else if (p2) maxPrice = parseFloat(p2[1]);

  let fulfill: DealDraft["fulfill"] = null;
  if (/collect|collection|pickup|pick up|come fetch/i.test(raw)) fulfill = "collection";
  if (/deliver|delivery|bring|drop/i.test(raw)) fulfill = "delivery";

  let city: string | null = defaultCity || null;
  const cities = ["Harare", "Chitungwiza", "Gweru", "Bulawayo", "Mutare", "Kwekwe", "Masvingo", "Chegutu", "Kadoma", "Norton"];
  for (const c of cities) {
    if (new RegExp(c, "i").test(raw)) {
      city = c;
      break;
    }
  }

  const confidence: DealDraft["confidence"] =
    prod || q1 ? "high" : "low";

  return { item, qty, unit, maxPrice, city, fulfill, raw, confidence };
}

export function draftToBidItem(d: DealDraft): {
  name: string;
  quality: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  photo: string;
} {
  const price = d.maxPrice ?? 0;
  return {
    name: d.item.charAt(0).toUpperCase() + d.item.slice(1),
    quality: "standard",
    qty: d.qty,
    unit: d.unit,
    price,
    total: price * d.qty,
    photo: "",
  };
}
