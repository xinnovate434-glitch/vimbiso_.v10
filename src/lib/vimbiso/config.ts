/**
 * Real service configuration for Vimbiso (original app).
 * Public VITE_ keys are safe for the browser / APK.
 * Server-only secrets stay in process.env (Edge Functions / Nitro).
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  },
  weather: {
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined,
    defaultCity: "Harare",
    defaultCoords: { lat: -17.8292, lon: 31.0522 },
  },
  mapbox: {
    token: import.meta.env.VITE_MAPBOX_TOKEN as string | undefined,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY as string | undefined,
  },
  africastalking: {
    username: import.meta.env.VITE_AT_USERNAME as string | undefined,
    // API key must NOT be in the client bundle for production SMS —
    // keep AFRICASTALKING_API_KEY on the server / Edge Function only.
  },
  authEnabled: import.meta.env.VITE_AUTH_ENABLED !== "false",
} as const;

export function assertClientConfig() {
  const missing: string[] = [];
  if (!config.supabase.url) missing.push("VITE_SUPABASE_URL");
  if (!config.supabase.anonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing;
}

export function aiConfigured() {
  return Boolean(config.gemini.apiKey);
}
