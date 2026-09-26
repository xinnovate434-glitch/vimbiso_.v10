/**
 * Send Web Push to stored subscriptions (server-only).
 * Requires: VAPID keys + `web-push` package on the server.
 * Install: npm i web-push
 * Generate keys: npx web-push generate-vapid-keys
 */
import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";
import { config } from "./config";

type NotifyInput = {
  title: string;
  body: string;
  url?: string;
  userId?: string;
};

export const sendPushToUsers = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: NotifyInput }) => {
    const data = ctx.data;
    if (!data?.title || !data?.body) {
      return { ok: false, sent: 0, error: "title and body required" };
    }

    const publicKey = env("VAPID_PUBLIC_KEY") || env("VITE_VAPID_PUBLIC_KEY");
    const privateKey = env("VAPID_PRIVATE_KEY");
    const subject = env("VAPID_SUBJECT") || "mailto:admin@vimbiso.local";

    if (!publicKey || !privateKey) {
      return {
        ok: false,
        sent: 0,
        error: "Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server",
      };
    }

    // Dynamic import so client bundles never pull web-push
    let webpush: {
      setVapidDetails: (s: string, pub: string, priv: string) => void;
      sendNotification: (sub: unknown, payload: string) => Promise<unknown>;
    };
    try {
      webpush = await import("web-push");
    } catch {
      return { ok: false, sent: 0, error: "Run: npm i web-push" };
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const base = (config.supabase.url || env("VITE_SUPABASE_URL") || "").replace(/\/$/, "");
    const key = env("SUPABASE_SERVICE_ROLE_KEY") || config.supabase.anonKey || env("VITE_SUPABASE_ANON_KEY");
    if (!base || !key) return { ok: false, sent: 0, error: "Supabase not configured" };

    let q = "push_subscriptions?select=endpoint,p256dh,auth";
    if (data.userId) q += `&user_id=eq.${data.userId}`;

    const res = await fetch(`${base}/rest/v1/${q}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return { ok: false, sent: 0, error: await res.text() };
    const rows = (await res.json()) as { endpoint: string; p256dh: string; auth: string }[];

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url || "/",
      tag: "vimbiso-network",
    });

    let sent = 0;
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          payload,
        );
        sent += 1;
      } catch {
        /* expired subscription — ignore */
      }
    }
    return { ok: true, sent, error: null };
  },
);
