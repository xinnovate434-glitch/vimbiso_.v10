# Vimbiso — preference pass (what we corrected)

## Priority 1
- Nav + FAB hidden on Vimby, Messages, receipt, innovate screens (app.tsx)
- Text-first Vimby composer sticky; mic optional (screens-chat.tsx)
- Gemini multi-model + offline guide replies (ai.ts) — set VITE_GEMINI_API_KEY in GitHub Actions secrets
- Demo lists empty: NEAR, OFFERS, JOBS, TICKER (data.ts)
- No Trust 94 / John defaults on order/status (screens-buyer.tsx)
- Profile photo: user photo or blank, not demo portrait (screens-work.tsx)
- USSD menus: no fake VMB-004821 / Trust 94 / fake trade history (data.ts)
- Store defaults: empty search/bid, trust 0 (store.ts)

## Priority 2 (kept)
- Vimby deal desk → Post live bid (deal-desk.ts + screens-chat)
- Trust / Price pulse / Safe meet / Agent kit / Quiet presence / Delivery leg (screens-innovate.tsx)

## Your action
1. GitHub secret VITE_GEMINI_API_KEY
2. Push this pack, rebuild APK, uninstall old app first
