# Vimbiso — original app + all agreed edits (final pack)

## Included
- Original React UI (auth, home, bid, trade, profile, etc.)
- Fake demo traders/offers/jobs cleared (`data.ts`)
- Session remember (no OTP every open)
- Profile photo + real trust/rating/trades from Supabase user
- Network **map scan** (slow zoom-out by distance, not classic radar)
- GPS weather (phone location first)
- Voice order (real speech only)
- Gemini AI helper module (`ai.ts`)
- Realtime helpers + reconnect (`realtime.ts`)
- **FAB +** with 4 clean actions (dashboard stays clean)
- Capacitor SPA entry (`capacitor.html`, `vite.capacitor.config.ts`, `src/capacitor-main.tsx`)
- Clean GitHub Actions APK workflow + Android mic/location permissions
- Market images under `public/images/`

## FAB actions
- Buyer: Build bid · Network map · Voice order · Live offers
- Trader: Buyer requests · Network map · Make offer · Go online
- Delivery: Open jobs · Network map · Driver desk · History

## GitHub secrets
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY,
VITE_OPENWEATHER_API_KEY, VITE_MAPBOX_TOKEN

## Push
Unzip over your repo, commit, push, run **Build Android APK**.
