export const IMG = {
  splash: "/images/bg-splash.jpg",
  welcome: "/images/bg-welcome.jpg",
  onboard: "/images/bg-onboard.jpg",
  signin: "/images/bg-signin.jpg",
  identity: "/images/bg-identity.jpg",
  home: "/images/bg-home.jpg",
  trader: "/images/bg-trader.jpg",
  delivery: "/images/bg-delivery.jpg",
  radar: "/images/bg-radar.jpg",
  profile: "/images/bg-profile.jpg",
  spices: "/images/bg-spices.jpg",
  road: "/images/bg-road.jpg",
  tomatoes: "/images/item-tomatoes.jpg",
  maize: "/images/item-maize.jpg",
  peppers: "/images/item-peppers.jpg",
  fruit: "/images/item-fruit.jpg",
  qrId: "/images/qr-id.png",
  qrDel: "/images/qr-del.png",
} as const;

export const PORTRAITS = {
  john: "/images/p-john.jpg",
  chipo: "/images/p-chipo.jpg",
  mary: "/images/p-mary.jpg",
  tendai: "/images/p-tendai.jpg",
  tinashe: "/images/p-tinashe.jpg",
  rudo: "/images/p-rudo.jpg",
  farai: "/images/p-farai.jpg",
} as const;

export const CATS = [
  { id: "food", name: "Food", photo: "/images/cat-food.jpg" },
  { id: "veg", name: "Veg", photo: "/images/cat-veg.jpg" },
  { id: "electronics", name: "Electronics", photo: "/images/cat-electronics.jpg" },
  { id: "clothing", name: "Clothing", photo: "/images/cat-clothing.jpg" },
  { id: "hardware", name: "Hardware", photo: "/images/cat-hardware.jpg" },
  { id: "services", name: "Services", photo: "/images/cat-services.jpg" },
  { id: "household", name: "Household", photo: "/images/cat-household.jpg" },
  { id: "other", name: "Other", photo: "/images/cat-other.jpg" },
] as const;

export const QUALITIES = [
  { id: "premium", name: "Premium", detail: "Top grade, fresh today" },
  { id: "standard", name: "Standard", detail: "Good everyday quality" },
  { id: "budget", name: "Budget", detail: "Value pick" },
] as const;

export const UNITS = ["kg", "pieces", "litres", "bags", "units"] as const;

export const VEHICLES = [
  { id: "Motorcycle", name: "Motorcycle" },
  { id: "Car", name: "Car" },
  { id: "Van", name: "Van" },
  { id: "Bicycle", name: "Bicycle" },
] as const;

export const COLORS = [
  { id: "Red", hex: "#DC2626" },
  { id: "Blue", hex: "#1D4ED8" },
  { id: "Green", hex: "#16A34A" },
  { id: "Yellow", hex: "#F59E0B" },
  { id: "Black", hex: "#17202A" },
  { id: "White", hex: "#FFFFFF" },
  { id: "Grey", hex: "#6B7280" },
] as const;

export const MARKET = { tomatoes: 15.2 };

export type Offer = {
  id: string;
  name: string;
  vid: string;
  img: string;
  qty: string;
  price: number;
  rating: number;
  trust: number;
  dist: string;
  ful: "Delivery" | "Collection";
  quality: string;
};

export const OFFERS: Offer[] = [];

export const NEAR: {
  img: string; name: string; trust: number; rating: number; dist: string; stock: string;
}[] = [];

export const JOBS: {
  id: number; item: string; from: string; to: string; dist: string;
  pay: number; buyerTrust: number; traderTrust: number; eta: string;
}[] = [];

export const TICKER: string[] = [];

export const ONBOARD = [
  {
    title: "Tell us what you need.",
    body: "Search by voice or text, or build a bid with exact quality, quantity, and your price.",
    photo: IMG.onboard,
  },
  {
    title: "Available traders respond.",
    body: "Traders online and near you get your bid instantly and send live offers.",
    photo: IMG.trader,
  },
  {
    title: "Choose with confidence.",
    body: "Compare price, fairness vs market, distance, rating and Vimbiso Trust Score.",
    photo: IMG.spices,
  },
  {
    title: "Pool, deliver, or use USSD.",
    body: "Group-buy with neighbours, hand off to riders, or trade over *123# from any phone.",
    photo: IMG.delivery,
  },
];

export const DICT = {
  en: {
    tagline: "Trade in real time.",
    headline: "Trade in real time.",
    sub: "Tell us what you need. Available traders respond. You choose who to trade with.",
    trades: "trades done",
    completion: "completion",
    verified: "verified traders",
    getstarted: "Get started",
    signin: "I already have an account",
    ussd: "No smartphone? Use USSD *123#",
    hello: "Welcome",
    need: "What do you need?",
    buildbid: "My need",
    buildbid2: "Say what I need",
    online: "people on the network",
    matched: "matches today",
    rating: "avg rating",
    categories: "Categories",
    toptraders: "People near you",
  },
  sn: {
    tagline: "Enga mu nguva chaiyo.",
    headline: "Enga mu nguva chaiyo.",
    sub: "Tiudze zvaunoda. Vengesi vanopindura. Iwe unosarudza waungaenga naye.",
    trades: "kutengesa kwaitwa",
    completion: "kupera",
    verified: "vengesi vakasimbiswa",
    getstarted: "Tanga",
    signin: "Ndine account",
    ussd: "Huna foni? Shandisa USSD *123#",
    hello: "Mhoroi",
    need: "Unoda chii?",
    buildbid: "Zvandinoda",
    buildbid2: "Taura zvaunoda",
    online: "vanhu pa network",
    matched: "zvakawanikwa nhasi",
    rating: "chiyero",
    categories: "Mhando",
    toptraders: "Vanhu pedyo",
  },
} as const;

export const USSD: Record<string, string> = {
  main: "Welcome to Vimbiso Network\n\n1. Buy something\n2. I'm a trader\n3. My orders\n4. My Vimbiso ID\n5. Transaction history\n6. Delivery jobs\n0. Exit",
  buy: "What do you need?\nType item or:\n1. Tomatoes\n2. Maize meal\n3. Other\n0. Back",
  buyres:
    "Your request was noted.\nTraders on the network will respond when online.\n\n1. My orders\n0. Main menu",
  id: "Your Vimbiso ID shows after registration on the network.\nTrust starts at 0 until real trades complete.\n\n0. Back",
  hist: "No trades on this line yet.\nComplete a deal on Vimbiso to see history.\n\n0. Back",
  del: "No delivery jobs nearby yet.\nJobs appear when buyers and traders match.\n\n0. Back",
};

export const USSD_MAP: Record<string, Record<string, string>> = {
  main: { "1": "buy", "2": "main", "4": "id", "5": "hist", "6": "del" },
  buy: { "1": "buyres", "2": "buyres", "3": "buyres" },
  buyres: { "1": "buyres", "2": "hist" },
  del: { "1": "hist" },
};

export function fairBadge(price: number): { kind: "low" | "good" | "high"; label: string } {
  const m = MARKET.tomatoes;
  if (price < m - 0.5) return { kind: "low", label: "Below market" };
  if (price > m + 0.5) return { kind: "high", label: "Above market" };
  return { kind: "good", label: "Fair price" };
}

export function money(n: number) {
  return `$${n.toFixed(2)}`;
}
