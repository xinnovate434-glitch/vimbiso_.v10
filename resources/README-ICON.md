# Vimbiso app icon

- `resources/icon.png` — 1024×1024 master
- `android-icons/mipmap-*/ic_launcher.png` — Android densities
- `public/icons/` — web / in-app

The GitHub Actions workflow copies `android-icons` into the Android project after `cap sync`.
