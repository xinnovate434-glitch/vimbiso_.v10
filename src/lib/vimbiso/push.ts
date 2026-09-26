import { config } from "./config";

const SW_PATH = "/sw-vimbiso.js";

export function canUsePush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Register service worker for background notifications */
export async function registerPushWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!canUsePush()) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    return reg;
  } catch {
    return null;
  }
}

/**
 * Ask permission and return subscription JSON to save in DB.
 * Needs VAPID public key in env for full Web Push (optional for now).
 */
export async function enablePushNotifications(userId?: string | null): Promise<{
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  subscription?: PushSubscriptionJSON;
  error?: string;
}> {
  if (!canUsePush()) {
    return { ok: false, permission: "unsupported", error: "Push not supported on this device" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, permission, error: "Permission denied" };
  }

  const reg = await registerPushWorker();
  if (!reg) return { ok: false, permission, error: "Service worker failed" };

  // Without VAPID key we still show local notifications when app is open;
  // background push needs VAPID + server sender.
  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  let subscription: PushSubscriptionJSON | undefined;

  if (vapid) {
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      subscription = sub.toJSON();
      if (userId && config.supabase.url) {
        await saveSubscription(userId, subscription);
      }
    } catch (e) {
      return {
        ok: true,
        permission,
        error: e instanceof Error ? e.message : "Subscribe failed (local alerts still work)",
      };
    }
  }

  return { ok: true, permission, subscription };
}

async function saveSubscription(userId: string, sub: PushSubscriptionJSON) {
  const base = config.supabase.url?.replace(/\/$/, "");
  const key = config.supabase.anonKey;
  if (!base || !key || !sub.endpoint) return;
  await fetch(`${base}/rest/v1/push_subscriptions`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh ?? null,
      auth: sub.keys?.auth ?? null,
      platform: "web",
      user_agent: navigator.userAgent,
    }),
  });
}

/** Local notification when app is open (works without VAPID) */
export async function notifyLocal(title: string, body: string) {
  if (!canUsePush()) return;
  if (Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) {
    await reg.showNotification(title, {
      body,
      icon: "/__grok/icon-180.png",
      tag: "vimbiso-local",
    });
  } else {
    new Notification(title, { body, icon: "/__grok/icon-180.png" });
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
