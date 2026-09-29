# Edits applied ON the original Vimbiso app (not a side shell)

1. Fake traders/offers/jobs/ticker cleared in `src/lib/vimbiso/data.ts`
2. Home/Offers empty states in `screens-buyer.tsx` (no John/Chipo/Tinashe)
3. Gemini AI: `src/lib/vimbiso/ai.ts` + `VITE_GEMINI_API_KEY` in config
4. Realtime WebSocket + reconnect: `src/lib/vimbiso/realtime.ts`
5. Live hooks: `use-live-bids.ts`, `use-live-offers.ts`
6. Config: Supabase, Weather, Mapbox, Gemini
7. `.env.example` lists all keys
8. `migrations/realtime.sql` for Supabase publication

## GitHub secrets for APK
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY,
VITE_OPENWEATHER_API_KEY, VITE_MAPBOX_TOKEN
