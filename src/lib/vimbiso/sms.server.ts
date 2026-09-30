/**
 * SMS via Africa's Talking.
 * In SPA/Capacitor build this runs only if called from a server route;
 * client uses api.sendOtpViaSms which catches failures.
 */

export async function sendOtpSms(args: { data: { phone: string; code: string } }): Promise<{
  ok: boolean;
  error: string | null;
  to?: string;
  devCode?: string;
}> {
  const phone = args?.data?.phone;
  const code = args?.data?.code;
  if (!phone || !code) return { ok: false, error: "Missing phone or code" };

  const username = process.env.AFRICASTALKING_USERNAME || process.env.VITE_AT_USERNAME;
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  if (!username || !apiKey) {
    return { ok: false, error: "SMS not configured", devCode: code };
  }

  try {
    const body = new URLSearchParams({
      username,
      to: phone.startsWith("+") ? phone : "+263" + phone.replace(/^0/, ""),
      message: "Vimbiso code: " + code,
    });
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body,
    });
    if (!res.ok) {
      return { ok: false, error: await res.text(), devCode: code };
    }
    return { ok: true, error: null, to: phone };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "SMS failed",
      devCode: code,
    };
  }
}
