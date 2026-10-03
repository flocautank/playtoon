# Playtoon — release guide: everything left for you to do

Everything that can be done without your accounts, identity and payment is done and tested:

| Platform | Ready | Model |
|---|---|---|
| **Android (Google Play)** | 3 apps, signed builds by CI, started in an emulator on every change, store kits | Block Quarry & Nova Foundry: free + ads (+ optional one-time purchase) · Synth Horde: **paid** |
| **PC (Steam)** | 3 games for Windows, Linux/Steam Deck, macOS, built by CI (Linux build launch-tested), upload to Steam by CI, store kits | All three **paid** |
| **iOS (App Store), later** | 3 Xcode projects, CI compile check + TestFlight upload on demand, screenshots | Same as Android |
| **PlayStation** | Not feasible "easily" — see the end of this page | — |
| Website | Free (no ads) — **decision pending**, see `PRICING.md` | — |

Detailed guides: Android → `PUBLISHING.md` · Steam → `desktop/STEAM.md` · iOS → `IOS.md` · prices → `PRICING.md`.

---

## 0. Decisions first (10 minutes)
- [ ] **Web versions**: keep free / turn Synth Horde into a demo / remove it (see `PRICING.md`). Tell me and I implement it.
- [ ] **Prices** (suggested in `PRICING.md`): Steam 2.99 / 3.99 / 4.99 US$, Synth Horde mobile 2,99 €.
- [ ] **Seller status**: selling apps makes you a *trader* under EU law (DSA): the stores ask for your trader details and
      show your contact details (name, address, phone / e-mail) to EU customers on the store page. Many solo developers
      register a **micro-entreprise** (free, online, gives a SIRET) — ask an accountant or your tax office if unsure.

## 1. Google Play — Android (start here: the 14-day test is the longest step)
Costs **US$ 25 once**. Details: `PUBLISHING.md`.
- [ ] Create the Play Console developer account (identity + device verification).
- [ ] Payments profile (bank account) — needed for Synth Horde's price and the in-app products.
- [ ] AdMob: create the Android apps **Block Quarry** and **Nova Foundry**, their ad units, the GDPR message; add GitHub
      variables `BQ_ADMOB_APP_ID`, `BQ_ADMOB_REWARDED_ID`, `BQ_ADMOB_INTERSTITIAL_ID`, `NF_ADMOB_…` (same three).
- [ ] GitHub secrets `UPLOAD_KEYSTORE_BASE64`, `UPLOAD_KEYSTORE_PASSWORD`, `UPLOAD_KEY_ALIAS` (the upload key I sent you —
      one key for the three apps).
- [ ] For each app: create it in Play Console, paste the store listing (`<app>/store/listing.md`), upload graphics and
      screenshots, fill App content (`<app>/store/data-safety.md`), content rating, target audience.
- [ ] Block Quarry: in-app product `remove_ads` (2,99 €) · Nova Foundry: `eternal_boost` (3,99 €) · Synth Horde: set the
      **price 2,99 €** and turn on *Automatic protection*.
- [ ] Upload the signed AAB from GitHub Actions → **Android** → artifact `…-release-aab` to a **closed test**, invite
      **12 testers**, keep them for **14 days** (each app). Then apply for production.

## 2. Steam — PC
Costs **US$ 100 per game** (US$ 300), paid back per game after US$ 1,000 of revenue. Details: `desktop/STEAM.md`.
- [ ] Steamworks account: agreement, **W-8BEN tax interview**, bank, identity.
- [ ] Pay the fee and create the 3 apps → App IDs → GitHub variables `BQ_STEAM_APPID`, `NF_STEAM_APPID`, `SH_STEAM_APPID`.
- [ ] For each app: depots (App ID +1 Windows, +2 Linux, +3 macOS), launch options, Linux runtime, Steam Cloud (tables in `STEAM.md`).
- [ ] Build account + secrets `STEAM_USERNAME`, `STEAM_CONFIG_VDF`; run Actions → **Desktop** → *steam_upload*.
- [ ] Store pages from `desktop/steam/<game>/` (texts, art, screenshots), content survey, price, Steam Input / Deck.
- [ ] Store page review + build review (~3–5 business days each), **Coming soon ≥ 2 weeks**, release
      (not before **30 days** after your first fee payment).

## 3. Apple — iOS (when you want)
Costs **US$ 99 per year**. Details: `IOS.md`.
- [ ] Apple Developer Program, Paid Apps Agreement, bank, tax, **Small Business Program** (15 %), DSA trader status.
- [ ] App IDs + App Store Connect records, prices, in-app products, privacy labels, age rating.
- [ ] AdMob iOS apps → variables `BQ_IOS_ADMOB_*`, `NF_IOS_ADMOB_*`.
- [ ] App Store Connect API key → secrets `APPSTORE_API_KEY_ID`, `APPSTORE_API_ISSUER_ID`, `APPSTORE_API_KEY_P8_BASE64`,
      variable `APPLE_TEAM_ID`; run Actions → **iOS** → *testflight*; test with TestFlight; submit for review.

## 4. Before each release: test on real hardware (only you can)
- [ ] Android phone: install the APK from Actions → Android → `…-debug-apk`: play each game a few minutes, ads (test ads),
      purchase sandbox (once Play Console is set up), consent form.
- [ ] PC: download Actions → Desktop → `desktop-windows` → unpack `block-quarry-windows.tar.gz`, run `BlockQuarry.exe`
      (same for the others); try a gamepad in Synth Horde.
- [ ] If possible a Steam Deck or a low-end PC for Synth Horde's performance.

## Summary of costs and waiting times
| | Cost | Waiting |
|---|---|---|
| Google Play | US$ 25 once | identity check (days) + **14-day closed test per app** |
| Steam | US$ 100 × 3 | identity/tax (days) + **30 days** after first fee + 2 weeks "coming soon" + reviews |
| Apple | US$ 99 / year | enrolment ~48 h + review 24–48 h |
| AdMob | free | payments above ~70 € balance |

Fastest realistic schedule if you start today: Android in production in ~3 weeks, Steam in ~5 weeks, iOS whenever you enrol.

## GitHub settings to add (all in one place)
**Secrets**: `UPLOAD_KEYSTORE_BASE64`, `UPLOAD_KEYSTORE_PASSWORD`, `UPLOAD_KEY_ALIAS` · `STEAM_USERNAME`, `STEAM_CONFIG_VDF` ·
`APPSTORE_API_KEY_ID`, `APPSTORE_API_ISSUER_ID`, `APPSTORE_API_KEY_P8_BASE64` · optional `PLAY_SERVICE_ACCOUNT_JSON` (automatic
upload to Play's internal track).
**Variables**: `BQ_ADMOB_APP_ID`, `BQ_ADMOB_REWARDED_ID`, `BQ_ADMOB_INTERSTITIAL_ID`, `NF_ADMOB_APP_ID`, `NF_ADMOB_REWARDED_ID`,
`NF_ADMOB_INTERSTITIAL_ID` · `BQ_STEAM_APPID`, `NF_STEAM_APPID`, `SH_STEAM_APPID` · `BQ_IOS_ADMOB_APP_ID`,
`BQ_IOS_ADMOB_REWARDED_ID`, `BQ_IOS_ADMOB_INTERSTITIAL_ID`, `NF_IOS_ADMOB_APP_ID`, `NF_IOS_ADMOB_REWARDED_ID`,
`NF_IOS_ADMOB_INTERSTITIAL_ID` · `APPLE_TEAM_ID`.

---

## PlayStation: why it is not "easy", and what would be needed
- Publishing on PlayStation requires being accepted into **PlayStation Partners** (in practice as a registered business),
  signing NDAs, and buying **development kits**; the SDK, the kits' prices and the rules are confidential.
- PlayStation consoles do not run web games: the three games would have to be **ported to a console engine**
  (e.g. Unity, Unreal, or Godot through a console-porting company), then pass Sony's **certification** (TRC).
- Realistic path if the games sell well on Steam: approach a **porting studio or publisher** (they hold the dev kits and
  handle certification against a revenue share). Same situation for Xbox (ID@Xbox) and Nintendo Switch.
- Meanwhile, **Steam Deck** covers the "console in hand" audience: the Linux build and Synth Horde's gamepad support are ready.
