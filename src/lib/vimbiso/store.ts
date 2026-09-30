import { create } from "zustand";

export type Role = "buyer" | "trader" | "delivery" | "admin" | "both";
export type Lang = "en" | "sn";
export type Screen =
  | "splash"
  | "onboard"
  | "welcome"
  | "ussd"
  | "signin"
  | "otp"
  | "signup"
  | "identity"
  | "delreg"
  | "delid"
  | "home"
  | "bid"
  | "basket"
  | "radar"
  | "offers"
  | "order"
  | "status"
  | "review"
  | "trade"
  | "incoming"
  | "makeoffer"
  | "delDash"
  | "delRadar"
  | "delJobs"
  | "delJob"
  | "profile"
  | "admin"
  | "messages"
  | "ai"
  | "receipt"
  | "pricePulse"
  | "safeMeet"
  | "trust"
  | "agentKit"
  | "networkMore";

export type BidItem = {
  name: string;
  quality: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  photo: string;
};

type Toast = { id: number; message: string };

type State = {
  screen: Screen;
  role: Role;
  regRole: Role;
  lang: Lang;
  lite: boolean;
  online: boolean;
  delOnline: boolean;
  /** Real user id from database (null = not logged in for real) */
  userId: string | null;
  /** pending | approved | rejected | suspended */
  userStatus: string;
  vimbisoId: string | null;
  name: string;
  city: string;
  phone: string;
  profilePhoto: string | null;
  trustScore: number;
  rating: number;
  completedTrades: number;
  toast: Toast | null;
  onboardStep: number;
  suStep: number;
  bidStep: number;
  bidItem: string;
  bidCat: string;
  bidQuality: string;
  bidQty: number;
  bidUnit: string;
  bidPrice: number;
  bidItems: BidItem[];
  selectedOffer: string | null;
  payMethod: "cash" | "ecocash" | "onemoney";
  orderStep: number;
  reviewStars: number;
  reviewNote: string;
  voiceOn: boolean;
  poolOpen: boolean;
  poolJoined: number;
  ussdStack: string[];
  counterMode: "accept" | "counter";
  counterPrice: number;
  offerQuality: string;
  offerFulfill: "delivery" | "collection";
  vehicle: string;
  vehicleColor: string;
  make: string;
  plate: string;
  insurance: string;
  policy: string;
  licence: string;
  delStep: number;
  jobPhotos: { type: "pickup" | "drop"; time: string }[];
  search: string;
  safePoint: string;
  /** user already saw first AI welcome */
  firstAiDone: boolean;
};

type Actions = {
  go: (screen: Screen) => void;
  goHome: () => void;
  enterApp: (role: Role) => void;
  setLang: (lang: Lang) => void;
  toggleLite: () => void;
  toastMsg: (message: string) => void;
  set: (partial: Partial<State>) => void;
  signOut: () => void;
};

export const HIDE_NAV: Screen[] = [
  "splash",
  "onboard",
  "welcome",
  "signin",
  "otp",
  "signup",
  "identity",
  "delreg",
  "delid",
  "radar",
  "delRadar",
  "admin",
  "ussd",
  "ai",
  "messages",
  "receipt",
  "pricePulse",
  "safeMeet",
  "trust",
  "agentKit",
  "networkMore",
];

function homeFor(role: Role): Screen {
  if (role === "trader") return "trade";
  if (role === "delivery") return "delDash";
  if (role === "admin") return "admin";
  return "home";
}


const SESSION_KEY = "vimbiso_session_v1";

type SessionSnap = {
  userId: string | null;
  userStatus: string;
  vimbisoId: string | null;
  name: string;
  city: string;
  phone: string;
  role: Role;
  regRole: Role;
  profilePhoto: string | null;
  trustScore: number;
  rating: number;
  completedTrades: number;
};

function loadSession(): Partial<SessionSnap> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SessionSnap;
  } catch {
    return {};
  }
}

function saveSession(s: Partial<State>) {
  try {
    const snap: SessionSnap = {
      userId: s.userId ?? null,
      userStatus: s.userStatus ?? "pending",
      vimbisoId: s.vimbisoId ?? null,
      name: s.name ?? "",
      city: s.city ?? "Harare",
      phone: s.phone ?? "",
      role: (s.role as Role) || "buyer",
      regRole: (s.regRole as Role) || "buyer",
      profilePhoto: s.profilePhoto ?? null,
      trustScore: s.trustScore ?? 0,
      rating: s.rating ?? 0,
      completedTrades: s.completedTrades ?? 0,
    };
    if (snap.userId) localStorage.setItem(SESSION_KEY, JSON.stringify(snap));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore quota */
  }
}

const _boot = loadSession();

export const useVimbiso = create<State & Actions>((set, get) => ({
  screen: _boot.userId ? homeFor((_boot.role as Role) || "buyer") : "splash",
  role: (_boot.role as Role) || "buyer",
  regRole: (_boot.regRole as Role) || "buyer",
  lang: "en",
  lite: false,
  online: false,
  delOnline: false,
  userId: _boot.userId ?? null,
  userStatus: _boot.userStatus || "pending",
  vimbisoId: _boot.vimbisoId ?? null,
  name: _boot.name || "",
  city: _boot.city || "Harare",
  phone: _boot.phone || "",
  profilePhoto: _boot.profilePhoto ?? null,
  trustScore: _boot.trustScore ?? 0,
  rating: _boot.rating ?? 0,
  completedTrades: _boot.completedTrades ?? 0,
  toast: null,
  onboardStep: 0,
  suStep: 1,
  bidStep: 1,
  bidItem: "Tomatoes",
  bidCat: "veg",
  bidQuality: "premium",
  bidQty: 20,
  bidUnit: "kg",
  bidPrice: 15,
  bidItems: [],
  selectedOffer: null,
  payMethod: "cash",
  orderStep: 0,
  reviewStars: 0,
  reviewNote: "",
  voiceOn: false,
  poolOpen: false,
  poolJoined: 0,
  ussdStack: ["main"],
  counterMode: "accept",
  counterPrice: 16.5,
  offerQuality: "premium",
  offerFulfill: "delivery",
  vehicle: "Motorcycle",
  vehicleColor: "Red",
  make: "Honda CB125",
  plate: "ABC-1234",
  insurance: "Old Mutual",
  policy: "INS-2024-8821",
  licence: "DL-0099281",
  delStep: 0,
  jobPhotos: [],
  search: "",
  safePoint: "Shell station Avondale",
  firstAiDone: (typeof localStorage !== "undefined" && localStorage.getItem("vimbiso_first_ai") === "1"),

  go: (screen) => set({ screen }),
  goHome: () => set({ screen: homeFor(get().role) }),
  enterApp: (role) => {
    const resolved = role === "both" ? "buyer" : role;
    const status = get().userStatus;
    if (status === "rejected" || status === "suspended") {
      set({ toast: { id: Date.now(), message: "Account not approved yet" } });
      return;
    }
    const firstAi =
      get().firstAiDone ||
      (typeof localStorage !== "undefined" && localStorage.getItem("vimbiso_first_ai") === "1");
    // First time into the app → open Vimbiso AI welcome (typewriter + Gemini)
    set({
      role: resolved,
      screen: firstAi ? homeFor(resolved) : "ai",
      firstAiDone: firstAi,
    });
    saveSession({ ...get(), role: resolved });
  },
  setLang: (lang) => set({ lang }),
  toggleLite: () => set({ lite: !get().lite }),
  toastMsg: (message) => {
    const id = Date.now();
    set({ toast: { id, message } });
    window.setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 2200);
  },
  set: (partial) => {
    set(partial);
    const g = get();
    if (
      partial.userId !== undefined ||
      partial.userStatus !== undefined ||
      partial.vimbisoId !== undefined ||
      partial.name !== undefined ||
      partial.phone !== undefined ||
      partial.city !== undefined ||
      partial.profilePhoto !== undefined ||
      partial.trustScore !== undefined ||
      partial.rating !== undefined ||
      partial.completedTrades !== undefined ||
      partial.role !== undefined
    ) {
      saveSession(g);
    }
  },
  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
    set({
      userId: null,
      userStatus: "pending",
      vimbisoId: null,
      name: "",
      phone: "",
      profilePhoto: null,
      trustScore: 0,
      rating: 0,
      completedTrades: 0,
      screen: "welcome",
    });
  },
}));


