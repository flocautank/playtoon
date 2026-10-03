# Playtoon on the Apple App Store — step by step ("Apple later")

Everything that can be prepared without an Apple account is done:

| Done | Where |
|---|---|
| iOS projects (Capacitor 8, Swift Package Manager, no CocoaPods) | `apps/<game>/ios/` |
| Info.plist: orientation, iPhone only, export compliance (no encryption), AdMob app ID, SKAdNetwork, tracking prompt text | `apps/shared/setup-ios.mjs` (re-run after `npx cap add ios`) |
| Ads on iOS: Google consent form, then the App Tracking Transparency prompt; separate iOS ad units | `apps/shared/mon.js`, `apps/shared/build-app.mjs` |
| In-app purchases on iOS (StoreKit) through the same plugin as Google Play | `@capgo/native-purchases` |
| Icons and launch screens | `apps/<game>/ios/App/App/Assets.xcassets` (from `assets/`) |
| CI: compile check on every change, signed upload to TestFlight on demand | `.github/workflows/ios.yml` |
| iPhone screenshots 1290×2796 (Synth Horde: 2796×1290), EN + FR | `apps/<game>/store/ios-screenshots/` |
| Store texts | reuse `apps/<game>/store/listing.md` (same texts as Google Play; App Store limits below) |

A Mac is **not** needed: GitHub's macOS runners build and upload.

| App | Bundle ID | Model | Product (in-app) |
|---|---|---|---|
| Block Quarry | `io.github.flocautank.blockquarry` | Free + ads | `remove_ads` — Non-Consumable, 2,99 € |
| Nova Foundry | `io.github.flocautank.novafoundry` | Free + ads | `eternal_boost` — Non-Consumable, 3,99 € |
| Synth Horde | `io.github.flocautank.synthhorde` | **Paid 2,99 €**, no ads | — |

## 1. Apple Developer Program (US$ 99 / year)
https://developer.apple.com/programs/enroll → as an **individual** (your name is shown as the seller) or an organisation
(needs a D-U-N-S number). Identity check with the Apple Developer app; approval within ~48 h.
Then App Store Connect → Business: sign the **Paid Apps Agreement**, add bank account and **tax forms** (W-8BEN),
and apply to the **App Store Small Business Program** (commission 15 % instead of 30 %).
EU: declare your **trader status** (DSA) — as a trader, your address, phone and e-mail are shown on the store page.

## 2. App IDs and App Store Connect records (each game)
1. developer.apple.com → Identifiers → **+** → App ID → the bundle ID from the table. Block Quarry and Nova Foundry:
   capability **In-App Purchase** (on by default).
2. App Store Connect → My Apps → **+** → New App: platform iOS, name (`Block Quarry: Gem Block Puzzle`, `Nova Foundry:
   Idle Clicker`, `Synth Horde: Neon Survivor` — max 30 characters), primary language English, the bundle ID, SKU
   (`blockquarry`, `novafoundry`, `synthhorde`).
3. **Pricing**: Block Quarry / Nova Foundry free; Synth Horde **2,99 €** (tier list) in all countries.
4. **In-app purchases** (Block Quarry, Nova Foundry): Features → In-App Purchases → **+** → *Non-Consumable* with the product
   ID from the table, price, EN + FR names and descriptions (same as on Google Play), a review screenshot (the settings
   screen) → it is submitted with the first app version.
5. **App Privacy** (privacy "nutrition label"):
   - Block Quarry, Nova Foundry: *Data used to track you*: Device ID (advertising identifier); *Data linked to you*: none;
     *Data not linked to you*: Coarse location (from IP), Product interaction, Advertising data, Crash/performance data
     (all collected by the Google Mobile Ads SDK, purpose: Third-party advertising + Analytics).
   - Synth Horde: **Data Not Collected**.
   - Privacy policy URL for all: `https://flocautank.github.io/playtoon/privacy.html`.
6. **Age rating** questionnaire: everything *None*, except Synth Horde → *Cartoon or Fantasy Violence: Infrequent/Mild*.
   Block Quarry / Nova Foundry: answer *Yes* to "contains ads". Expected: 4+ (Synth Horde 9+).
7. Store page: subtitle (30 characters), promotional text, description, keywords (100 characters), support URL
   (`https://github.com/flocautank/playtoon/issues`), screenshots from `store/ios-screenshots/` (6.7"/6.9" slot).

## 3. AdMob for iOS (Block Quarry, Nova Foundry)
AdMob is per platform: in https://admob.google.com add an **iOS app** for each of the two games, create its ad units
(Rewarded for both, plus Interstitial for Block Quarry), and enable the same GDPR message. Then GitHub → Variables:

| Variable | Value |
|---|---|
| `BQ_IOS_ADMOB_APP_ID` / `NF_IOS_ADMOB_APP_ID` | the iOS app ID `ca-app-pub-…~…` |
| `BQ_IOS_ADMOB_REWARDED_ID` / `NF_IOS_ADMOB_REWARDED_ID` | the rewarded unit `ca-app-pub-…/…` |
| `BQ_IOS_ADMOB_INTERSTITIAL_ID` / `NF_IOS_ADMOB_INTERSTITIAL_ID` | the interstitial unit (Nova Foundry: repeat the rewarded ID) |

Without them, builds use Google's **test** ads. In AdMob → Privacy & messaging, also create the **IDFA explainer** message
(optional, shown before Apple's tracking prompt).

## 4. Keys for automatic uploads (once)
1. App Store Connect → Users and Access → Integrations → **App Store Connect API** → generate a key with the **Admin**
   role (needed so Xcode can create the distribution certificate and profiles by itself). Download `AuthKey_XXXX.p8`
   (only once!), note the **Key ID** and the **Issuer ID**.
2. GitHub → Secrets: `APPSTORE_API_KEY_ID`, `APPSTORE_API_ISSUER_ID`, `APPSTORE_API_KEY_P8_BASE64` (= `base64 -i AuthKey_XXXX.p8`).
   GitHub → Variables: `APPLE_TEAM_ID` (developer.apple.com → Membership → Team ID).
3. Actions → **iOS** → *Run workflow* → tick **testflight** → the three apps are archived, signed and uploaded.

## 5. TestFlight, review, release
1. App Store Connect → TestFlight: the builds appear after ~15 min of processing. Install the **TestFlight** app on your
   iPhone and test (ads in test mode until the AdMob variables exist; purchases in the sandbox).
2. Check: Google consent form (in the EU), then Apple's tracking prompt; reward videos; "Remove ads" / "Eternal Engine"
   purchase and **Restore purchases** (Apple requires a restore button: it is in Settings).
3. Select the build in the version page, fill "What's new", **Submit for Review** (usually 24–48 h). No closed-test
   period is required on Apple (unlike Google Play's 14 days).
