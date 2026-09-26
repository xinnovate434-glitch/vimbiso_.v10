import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = config.supabase.url;
  const key = config.supabase.anonKey;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

/** Tables we expect after running 0001_vimbiso_core.sql */
export type DbUser = {
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
};

export type DbApproval = {
  id: string;
  type: string;
  target_id: string;
  user_id: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  created_at: string;
};
