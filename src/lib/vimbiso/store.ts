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
  | "admin";

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
};

type Actions = {
  go: (screen: Screen) => void;
  goHome: () => void;
  enterApp: (role: Role) => void;
  setLang: (lang: Lang) => void;
  toggleLite: () => void;
  toastMsg: (message: string) => void;
  set: (partial: Partial<State>) => void;
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
];

function homeFor(role: Role): Screen {
  if (role === "trader") return "trade";
  if (role === "delivery") return "delDash";
  if (role === "admin") return "admin";
  return "home";
}

export const useVimbiso = create<State & Actions>((set, get) => ({
  screen: "splash",
  role: "buyer",
  regRole: "buyer",
  lang: "en",
  lite: false,
  online: false,
  delOnline: false,
  userId: null,
  userStatus: "pending",
  vimbisoId: null,
  name: "",
  city: "Harare",
  phone: "",
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
  orderStep: 2,
  reviewStars: 0,
  reviewNote: "",
  voiceOn: false,
  poolOpen: false,
  poolJoined: 3,
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
  search: "20kg tomatoes",
  safePoint: "Shell station Avondale",

  go: (screen) => set({ screen }),
  goHome: () => set({ screen: homeFor(get().role) }),
  enterApp: (role) => {
    const resolved = role === "both" ? "buyer" : role;
    const status = get().userStatus;
    // Pending users see home but with limited actions; rejected stay out
    if (status === "rejected" || status === "suspended") {
      set({ toast: { id: Date.now(), message: "Account not approved yet" } });
      return;
    }
    set({ role: resolved, screen: homeFor(resolved) });
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
  set: (partial) => set(partial),
}));


