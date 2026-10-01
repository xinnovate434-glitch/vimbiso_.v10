/**
 * Real service configuration for Vimbiso (original app).
 * Public VITE_ keys are injected at APK build time from GitHub secrets.
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
  elevenlabs: {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined,
    /** Default multilingual voice — change later if you pick another in ElevenLabs */
    voiceId: (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) || "21m00Tcm4TlvDq8ikWAM",
  },
  africastalking: {
    username: import.meta.env.VITE_AT_USERNAME as string | undefined,
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

export function elevenConfigured() {
  return Boolean(config.elevenlabs.apiKey && String(config.elevenlabs.apiKey).length > 10);
}
