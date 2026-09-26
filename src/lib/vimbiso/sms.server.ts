/**
 * Server-only SMS via Africa's Talking.
 * API key never goes to the browser.
 */
import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";

function normalizeZwPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("263")) return `+${d}`;
  if (d.startsWith("0") && d.length >= 9) return `+263${d.slice(1)}`;
  if (d.length === 9 && d.startsWith("7")) return `+263${d}`;
  if (phone.trim().startsWith("+")) return phone.trim();
  return `+${d}`;
}

type SmsInput = { phone: string; code: string };

export const sendOtpSms = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: SmsInput }): Promise<{
    ok: boolean;
    error: string | null;
    to?: string;
    devCode?: string;
  }> => {
    const data = ctx.data;
    if (!data?.phone || !data?.code) {
      return { ok: false, error: "phone and code required" };
    }

    const username = env("AFRICASTALKING_USERNAME") || "Crea";
    const apiKey = env("AFRICASTALKING_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: "AFRICASTALKING_API_KEY not set on server",
        devCode: data.code,
      };
    }

    const to = normalizeZwPhone(data.phone);
    const message = `Vimbiso code: ${data.code}. Valid 10 min. Do not share.`;

    try {
      const body = new URLSearchParams({
        username,
        to,
        message,
      });
      const res = await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
      });
      const text = await res.text();
      if (!res.ok) {
        return {
          ok: false,
          error: text.slice(0, 200) || res.statusText,
          devCode: data.code,
        };
      }
      return { ok: true, error: null, to };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "SMS failed",
        devCode: data.code,
      };
    }
  },
);
