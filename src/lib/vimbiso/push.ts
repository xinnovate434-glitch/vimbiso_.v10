import { config } from "./config";

const SW_PATH = "/sw-vimbiso.js";

export function canUsePush(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor Android WebView often has no PushManager — use local alerts fallback
  return "Notification" in window;
}

export type PushResult = {
  ok: boolean;
  permission?: NotificationPermission | "unsupported" | "denied" | "granted" | "default";
  error?: string;
};

/**
 * Enable alerts. On APK WebView, browser Push API is often missing —
 * we still allow Notification permission when available, and always
 * register preference so in-app toasts + future FCM can use it.
 */
export async function enablePushNotifications(userId: string | null): Promise<PushResult> {
  if (typeof window === "undefined") {
    return { ok: false, permission: "unsupported", error: "Not in browser" };
  }

  // Always remember user preference for in-app routing
  try {
    localStorage.setItem(
      "vimbiso_notify_pref",
      JSON.stringify({ userId, enabled: true, at: Date.now() }),
    );
  } catch {
    /* ignore */
  }

  if (!("Notification" in window)) {
    return {
      ok: true,
      permission: "unsupported",
      error:
        "System push is limited on this install. You will still get in-app alerts when the app is open. Full background push needs Firebase (FCM) — we can add that next.",
    };
  }

  try {
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
    }
    if (perm !== "granted") {
      return {
        ok: false,
        permission: perm,
        error: "Permission denied — enable notifications in phone Settings for Vimbiso.",
      };
    }

    // Optional service worker (may fail silently in Capacitor)
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register(SW_PATH).catch(() => null);
      } catch {
        /* ignore */
      }
    }

    try {
      new Notification("Vimbiso Network", {
        body: "Alerts on — we will notify you about bids and offers when possible.",
        tag: "vimbiso-welcome",
      });
    } catch {
      /* some WebViews block Notification constructor */
    }

    return { ok: true, permission: "granted" };
  } catch (e) {
    return {
      ok: false,
      permission: "unsupported",
      error: e instanceof Error ? e.message : "Could not enable notifications",
    };
  }
}

export function notifyLocal(title: string, body: string) {
  try {
    const pref = localStorage.getItem("vimbiso_notify_pref");
    if (!pref) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, tag: "vimbiso-live" });
    }
  } catch {
    /* ignore */
  }
}
