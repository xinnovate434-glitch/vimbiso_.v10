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

export const OFFERS: Offer[] = [
  {
    id: "A",
    name: "John Vegetables",
    vid: "VMB-004821",
    img: PORTRAITS.john,
    qty: "20kg",
    price: 15,
    rating: 4.8,
    trust: 94,
    dist: "2.1 km",
    ful: "Delivery",
    quality: "Premium",
  },
  {
    id: "C",
    name: "Chipo Produce",
    vid: "VMB-005512",
    img: PORTRAITS.chipo,
    qty: "25kg",
    price: 16,
    rating: 4.9,
    trust: 97,
    dist: "1.5 km",
    ful: "Delivery",
    quality: "Premium",
  },
  {
    id: "B",
    name: "Mary Fresh Foods",
    vid: "VMB-003980",
    img: PORTRAITS.mary,
    qty: "20kg",
    price: 14,
    rating: 4.6,
    trust: 89,
    dist: "3.4 km",
    ful: "Collection",
    quality: "Standard",
  },
];

export const NEAR = [
  {
    img: PORTRAITS.john,
    name: "John Vegetables",
    trust: 94,
    rating: 4.8,
    dist: "2.1 km",
    stock: "Tomatoes, onions",
  },
  {
    img: PORTRAITS.chipo,
    name: "Chipo Produce",
    trust: 97,
    rating: 4.9,
    dist: "1.5 km",
    stock: "Veg, fruit",
  },
  {
    img: PORTRAITS.tinashe,
    name: "Tinashe Electronics",
    trust: 91,
    rating: 4.7,
    dist: "3.0 km",
    stock: "Chargers, airtime",
  },
];

export const JOBS = [
  {
    id: 1,
    item: "20kg tomatoes (Premium)",
    from: "Mbare Musika",
    to: "47 Chiremba Ave, Avondale",
    dist: "4.2 km",
    pay: 3.5,
    buyerTrust: 88,
    traderTrust: 94,
    eta: "by 10:15",
  },
  {
    id: 2,
    item: "Phone charger + cable",
    from: "Podium Rd, Harare",
    to: "Greendale, Harare",
    dist: "6.8 km",
    pay: 5,
    buyerTrust: 92,
    traderTrust: 87,
    eta: "by 11:00",
  },
  {
    id: 3,
    item: "50kg maize meal",
    from: "Chitungwiza Central",
    to: "Zengeza 5, Chitungwiza",
    dist: "2.1 km",
    pay: 2.5,
    buyerTrust: 85,
    traderTrust: 91,
    eta: "by 10:45",
  },
  {
    id: 4,
    item: "Fridge repair parts",
    from: "Selous Ave, Harare",
    to: "Mount Pleasant, Harare",
    dist: "5.3 km",
    pay: 4,
    buyerTrust: 90,
    traderTrust: 88,
    eta: "by 12:00",
  },
];

export const TICKER = [
  "Group buy pooled: 45kg tomatoes",
  "Order #VIM00000181 completed",
  "47 traders online near you",
  "Delivery in transit · Avondale",
  "USSD request · Bindura",
  "EcoCash payment verified",
];

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
    hello: "Good afternoon, Tendai",
    need: "What do you need?",
    buildbid: "Build bid",
    buildbid2: "Build a bid",
    online: "traders online near you",
    matched: "requests matched today",
    rating: "avg trader rating",
    categories: "Browse categories",
    toptraders: "Top-rated traders near you",
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
    hello: "Mhoroi Tendai",
    need: "Unoda chii?",
    buildbid: "Gadzira bidhi",
    buildbid2: "Gadzira bidhi",
    online: "vengesi vari online pedyo newe",
    matched: "zvikumbiro zvakawanikwa nhasi",
    rating: "chiyero chevengesi",
    categories: "Tarisa mitengo",
    toptraders: "Vengesi vane mukurumbira pedyo",
  },
} as const;

export const USSD: Record<string, string> = {
  main: "Welcome to Vimbiso\n\n1. Buy something\n2. I'm a trader\n3. My orders\n4. My Vimbiso ID\n5. Transaction history\n6. Delivery jobs\n0. Exit",
  buy: "What do you need?\nEnter text or:\n1. Tomatoes\n2. Maize meal\n3. Charger",
  buyres:
    "Searching...\n\n20kg tomatoes\n3 traders online near you\n\n1. See prices\n2. Place order\n0. Back",
  id: "Your Vimbiso ID:\nVMB-004821\nStatus: Verified\nTrust: 94\n\n0. Back",
  hist: "Recent trades:\n1. 20kg tomatoes  $15  done\n2. Charger  $4  done\n\n0. Back",
  del: "Delivery jobs near you:\n1. 20kg tomatoes  $3.50\n2. Maize 50kg  $2.50\n\n1. Accept  0. Back",
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
