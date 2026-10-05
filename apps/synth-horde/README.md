# Synth Horde — Android app

The Playtoon 3D horde survivor (ex-"Neon Bonk"), packaged as a standalone **landscape** Android app with Capacitor 8.
The game code is shared with the website (`../../js/bonk.js`, `../../js/synthwave.js`, `../../vendor/three.module.min.js`):
`build.mjs` (through `../shared/build-app.mjs`) copies the game section of `../../index.html` into `www/` and bundles the JS.

| Folder / file | Role |
|---|---|
| `src/app.js` | Wires the game to the shared shell (settings, back button → pause) and monetisation (reward videos, capped interstitials between runs, `remove_ads`) |
| `android/` | Capacitor Android project (package `io.github.flocautank.synthhorde`, `sensorLandscape`, targetSdk 36) |
| `make-assets.mjs` | Draws icon, splash, Play icon and feature graphic → `assets/`; then `npx @capacitor/assets generate --android` |
| `../../tools/cast/poster.mjs` | Renders the real 3D cast (transparent PNGs) → `assets/cast/`, used by `make-assets.mjs` and the Steam art |
| `tools/store-shots.mjs` | Play Store screenshots (1920×1080, EN + FR) → `store/screenshots/` |
| `store/` | Store listing texts and Data safety answers (publishing guide: `../PUBLISHING.md`) |

Build: `npm ci && node build.mjs && npx cap sync android && cd android && ./gradlew assembleDebug`, or let
`.github/workflows/android.yml` do it (debug APK, signed AAB, emulator start).
