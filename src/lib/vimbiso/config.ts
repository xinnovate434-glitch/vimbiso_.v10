/**
 * Real service configuration for Vimbiso.
 * Public (VITE_) keys are safe for the browser.
 * Server-only secrets stay in process.env / .env
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  },
  weather: {
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined,
    // default city for Zimbabwe demo
    defaultCity: "Harare",
    defaultCoords: { lat: -17.8292, lon: 31.0522 },
  },
  mapbox: {
    token: import.meta.env.VITE_MAPBOX_TOKEN as string | undefined,
  },
  authEnabled: import.meta.env.VITE_AUTH_ENABLED === "true",
} as const;

export function assertClientConfig() {
  const missing: string[] = [];
  if (!config.supabase.url) missing.push("VITE_SUPABASE_URL");
  if (!config.supabase.anonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  if (!config.weather.apiKey) missing.push("VITE_OPENWEATHER_API_KEY");
  if (!config.mapbox.token) missing.push("VITE_MAPBOX_TOKEN");
  return missing;
}
