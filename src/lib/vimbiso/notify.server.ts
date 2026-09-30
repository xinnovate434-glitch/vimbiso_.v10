/** Server notify stub for SPA/Capacitor builds */
export async function notifyUser(_args: unknown) {
  return { ok: false, error: "Server notify not available in app build" };
}
