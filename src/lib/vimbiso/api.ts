/**
 * Real backend API for Vimbiso using Supabase REST.
 * All writes go to the database. Approvals start as pending.
 */

import { config } from "./config";

const base = () => config.supabase.url?.replace(/\/$/, "") ?? "";
const key = () => config.supabase.anonKey ?? "";

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: key(),
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra,
  };
}

async function rest<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  if (!base() || !key()) {
    return { data: null, error: "Supabase not configured" };
  }
  try {
    const res = await fetch(`${base()}/rest/v1/${path}`, {
      ...init,
      headers: { ...headers(), ...(init.headers as object) },
    });
    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: text || res.statusText };
    }
    if (res.status === 204) return { data: null, error: null };
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Network error" };
  }
}

export type UserRow = {
  id: string;
  phone: string;
  name: string;
  city: string;
  roles: string[];
  trust_score: number;
  rating: number;
  completed_trades: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  vimbiso_id: string | null;
  created_at: string;
};

export type ApprovalRow = {
  id: string;
  type: string;
  target_id: string;
  user_id: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  created_at: string;
};

/** Find user by phone */
export async function findUserByPhone(phone: string) {
  const q = `users?phone=eq.${encodeURIComponent(phone)}&select=*`;
  const { data, error } = await rest<UserRow[]>(q);
  if (error) return { user: null, error };
  return { user: data?.[0] ?? null, error: null };
}

/** Create user as pending + approval row */
export async function registerUser(input: {
  phone: string;
  name: string;
  city: string;
  roles: string[];
}) {
  const { data, error } = await rest<UserRow[]>("users", {
    method: "POST",
    body: JSON.stringify({
      phone: input.phone,
      name: input.name,
      city: input.city,
      roles: input.roles,
      status: "pending",
    }),
  });
  if (error || !data?.[0]) return { user: null, error: error ?? "Create failed" };

  const user = data[0];
  await rest("approvals", {
    method: "POST",
    body: JSON.stringify({
      type: "user_identity",
      target_id: user.id,
      user_id: user.id,
      status: "pending",
    }),
  });
  return { user, error: null };
}

/** List users waiting for your approval */
export async function listPendingApprovals() {
  const { data, error } = await rest<ApprovalRow[]>(
    "approvals?status=eq.pending&select=*&order=created_at.desc",
  );
  return { approvals: data ?? [], error };
}

/** Approve or reject */
export async function decideApproval(
  approvalId: string,
  targetUserId: string,
  decision: "approved" | "rejected",
  type: string,
) {
  const { error: e1 } = await rest(`approvals?id=eq.${approvalId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: decision,
      decided_at: new Date().toISOString(),
    }),
  });
  if (e1) return { error: e1 };

  if (type === "user_identity") {
    await rest(`users?id=eq.${targetUserId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: decision }),
    });
  }
  if (type === "delivery_registration") {
    await rest(`delivery_profiles?user_id=eq.${targetUserId}`, {
      method: "PATCH",
      body: JSON.stringify({ approval_status: decision }),
    });
  }
  return { error: null };
}

/** Admin stats from real tables */
export async function adminStats() {
  const [users, traders, pending] = await Promise.all([
    rest<{ count: number }[]>("users?select=count", {
      headers: { ...headers(), Prefer: "count=exact" },
    }),
    rest<UserRow[]>("users?roles=cs.{trader}&status=eq.approved&select=id"),
    rest<ApprovalRow[]>("approvals?status=eq.pending&select=id"),
  ]);
  return {
    users: users.data?.length ?? 0,
    traders: traders.data?.length ?? 0,
    pendingApprovals: pending.data?.length ?? 0,
  };
}

/**
 * OTP: store a code in DB. Real SMS via Africa's Talking is server-side;
 * for now we generate + store so login is real against the database.
 * (Wire AT SMS when you have a small server endpoint.)
 */
export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function storeOtp(phone: string, code: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  return rest("otp_codes", {
    method: "POST",
    body: JSON.stringify({ phone, code, expires_at: expires, used: false }),
  });
}

export async function verifyOtp(phone: string, code: string) {
  const q =
    `otp_codes?phone=eq.${encodeURIComponent(phone)}` +
    `&code=eq.${encodeURIComponent(code)}` +
    `&used=eq.false&order=created_at.desc&limit=1`;
  const { data, error } = await rest<
    { id: string; expires_at: string }[]
  >(q);
  if (error) return { ok: false, error };
  const row = data?.[0];
  if (!row) return { ok: false, error: "Invalid code" };
  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, error: "Code expired" };
  }
  await rest(`otp_codes?id=eq.${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({ used: true }),
  });
  return { ok: true, error: null };
}

// ---------- marketplace: bids, offers, orders ----------

export type BidRow = {
  id: string;
  buyer_id: string;
  items: unknown;
  city: string | null;
  status: string;
  created_at: string;
};

export type OfferRow = {
  id: string;
  trader_id: string;
  bid_id: string | null;
  price: number;
  qty: string | null;
  quality: string | null;
  fulfillment: string | null;
  status: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  buyer_id: string;
  trader_id: string;
  offer_id: string | null;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  city: string | null;
  created_at: string;
};

export async function createBid(input: {
  buyerId: string;
  items: unknown[];
  city?: string;
}) {
  return rest<BidRow[]>("bids", {
    method: "POST",
    body: JSON.stringify({
      buyer_id: input.buyerId,
      items: input.items,
      city: input.city ?? null,
      status: "open",
    }),
  });
}

export async function listOpenBids(city?: string) {
  let q = "bids?status=eq.open&select=*&order=created_at.desc&limit=50";
  if (city) q += `&city=eq.${encodeURIComponent(city)}`;
  return rest<BidRow[]>(q);
}

export async function createOffer(input: {
  traderId: string;
  bidId?: string;
  price: number;
  qty?: string;
  quality?: string;
  fulfillment?: "delivery" | "collection";
}) {
  return rest<OfferRow[]>("offers", {
    method: "POST",
    body: JSON.stringify({
      trader_id: input.traderId,
      bid_id: input.bidId ?? null,
      price: input.price,
      qty: input.qty ?? null,
      quality: input.quality ?? null,
      fulfillment: input.fulfillment ?? "delivery",
      status: "active",
    }),
  });
}

export async function listActiveOffers(bidId?: string) {
  let q = "offers?status=eq.active&select=*&order=created_at.desc&limit=50";
  if (bidId) q += `&bid_id=eq.${bidId}`;
  return rest<OfferRow[]>(q);
}

export async function createOrder(input: {
  buyerId: string;
  traderId: string;
  offerId?: string;
  items: unknown[];
  subtotal: number;
  deliveryFee?: number;
  paymentMethod: "cash" | "ecocash" | "onemoney";
  city?: string;
}) {
  const delivery = input.deliveryFee ?? 1;
  return rest<OrderRow[]>("orders", {
    method: "POST",
    body: JSON.stringify({
      buyer_id: input.buyerId,
      trader_id: input.traderId,
      offer_id: input.offerId ?? null,
      items: input.items,
      subtotal: input.subtotal,
      delivery_fee: delivery,
      total: input.subtotal + delivery,
      payment_method: input.paymentMethod,
      payment_status: "pending",
      order_status: "placed",
      city: input.city ?? null,
    }),
  });
}

export async function listOrdersForUser(userId: string, role: "buyer" | "trader") {
  const col = role === "buyer" ? "buyer_id" : "trader_id";
  return rest<OrderRow[]>(
    `orders?${col}=eq.${userId}&select=*&order=created_at.desc&limit=50`,
  );
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: string,
  paymentStatus?: string,
) {
  const body: Record<string, string> = {
    order_status: orderStatus,
    updated_at: new Date().toISOString(),
  };
  if (paymentStatus) body.payment_status = paymentStatus;
  return rest(`orders?id=eq.${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** Online traders for radar / heat map (approved + trader role) */
export async function listOnlineTraders() {
  return rest<
    {
      id: string;
      name: string;
      city: string;
      trust_score: number;
      rating: number;
      vimbiso_id: string | null;
    }[]
  >(
    "users?status=eq.approved&roles=cs.{trader}&select=id,name,city,trust_score,rating,vimbiso_id&limit=100",
  );
}

/** Send OTP SMS via server (Africa's Talking). Falls back to showing code in UI if SMS fails. */
export async function sendOtpViaSms(phone: string, code: string) {
  try {
    const { sendOtpSms } = await import("./sms.server");
    // TanStack Start server fn invocation
    const result = await (sendOtpSms as (args: { data: { phone: string; code: string } }) => Promise<{
      ok: boolean;
      error: string | null;
      to?: string;
      devCode?: string;
    }>)({ data: { phone, code } });
    return result;
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "SMS unavailable",
      devCode: code,
    };
  }
}
