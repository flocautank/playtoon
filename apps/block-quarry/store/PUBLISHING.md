# Publishing Block Quarry on Google Play — step by step

Everything that can be prepared in code is done: the Android app (`apps/block-quarry`), a CI build that signs it,
the store texts, graphics, privacy policy and form answers. What is left needs **your** Google accounts, identity and
payment — nobody else can do it for you. Budget: **25 USD once**, about **2 hours of forms**, then a **14-day closed test**
before the app can go public (Google rule for new personal developer accounts).

## 0. Before you start — the name
"Bloc Party / Block Party" is taken on Google Play (several games, including *Tetris® Block Party*) and is also a
well-known band, so the game is published as **Block Quarry** (listing title "Block Quarry: Gem Block Puzzle").
A web search found no app with that name. Play checks name conflicts again at review time.

## 1. Google Play developer account (≈ 30 min + verification delay)
1. https://play.google.com/console/signup → **Personal** account (or **Organization** if you publish under a company:
   organizations skip the 12-tester rule but need a D-U-N-S number).
2. Pay the 25 USD fee, verify your identity (ID document) and a real Android device (Play Console app).
3. Note the public developer name and a contact email — they appear on the store page.

## 2. AdMob account and ad units (≈ 20 min)
1. https://admob.google.com → sign in with the same Google account → add an app: **Android**, "not published yet",
   name *Block Quarry*.
2. Create two ad units: **Rewarded** (name "rewarded") and **Interstitial** (name "between games").
3. **Privacy & messaging → GDPR → Create message** for the app (required, otherwise the consent form cannot be shown
   in Europe and ads stay off there). Select the default "Google" consent options, publish it.
4. In GitHub → `flocautank/playtoon` → Settings → Secrets and variables → Actions → **Variables** tab, add:
   - `ADMOB_APP_ID` = the app ID (`ca-app-pub-…~…`)
   - `ADMOB_REWARDED_ID` = the rewarded unit ID (`ca-app-pub-…/…`)
   - `ADMOB_INTERSTITIAL_ID` = the interstitial unit ID
   Until these exist, builds use Google's **test** ads (safe for internal testing, earn nothing).
5. After the app is live, link it in AdMob to its Play listing (App settings → Link to app store).
6. Optional but recommended by AdMob: an `app-ads.txt` at the root of your developer website domain
   (e.g. a `flocautank.github.io` repository with `app-ads.txt` containing the line AdMob gives you).

## 3. Signing key → GitHub secrets (5 min)
The upload key was generated for you (`block-quarry-upload.jks` + `SECRETS-a-copier.txt`, sent separately — keep them
private, never commit them). Add the four secrets listed in that file under Settings → Secrets and variables →
Actions → **Secrets**: `BQ_UPLOAD_KEYSTORE_BASE64`, `BQ_UPLOAD_KEYSTORE_PASSWORD`, `BQ_UPLOAD_KEY_ALIAS`,
`BQ_UPLOAD_KEY_PASSWORD`.

## 4. Build the release (automatic)
GitHub → Actions → **Android — Block Quarry** → *Run workflow* (or push any change to the game). When it is green,
download the artifact `block-quarry-…-release-aab` (the signed `.aab`) and, to try the game on your phone right away,
`block-quarry-…-debug-apk` (install the APK directly, allow "unknown sources").

## 5. Create the app in Play Console (≈ 1 h)
1. **Create app**: name `Block Quarry: Gem Block Puzzle`, default language **English (United States)**, **Game**, **Free**,
   accept the declarations.
2. **App content** (left menu → Policy → App content): fill every section with `data-safety.md`
   (privacy policy URL, ads = yes, app access, content rating, target audience 13+, data safety, advertising ID…).
3. **Main store listing**: texts from `listing.md` (English, then *Add translation → French*), icon
   `assets/play-icon-512.png`, feature graphic `assets/feature-graphic.png`, phone screenshots `store/screenshots/en/`
   (and `fr/` for the French listing). Category **Puzzle**, contact email.
4. **Monetize → Products → In-app products** → create `remove_ads` (one-time), price 2.99 €, names/descriptions from
   `listing.md`, **Activate**. (Play only lets you create products after a first AAB is uploaded — do step 6 first if
   the page is locked.)

## 6. Internal test — try the real build (same day)
1. **Testing → Internal testing → Create new release** → upload the `.aab` from step 4 → release notes "First build".
   Accept **Play App Signing** when asked (Google keeps the final signing key; ours is only the upload key).
2. **Testers** tab: add your own Gmail address, save, open the opt-in link on your phone, install from Play.
3. Check: consent form appears (in Europe), reward videos give their reward (test ads until step 2 is done),
   "Remove ads" purchase works — add your address under **Setup → License testing** so purchases are free test purchases.

## 7. Closed test — the 14-day clock (mandatory for new personal accounts)
1. **Testing → Closed testing → Create track** → promote the internal release to it.
2. Add **at least 12 testers** (a Google Group or a list of Gmail addresses — friends, family, colleagues) and share the
   opt-in link. They must **opt in and keep the app installed**; the rule is 12 testers opted in **continuously for 14 days**.
3. Ask them to play a few times and send feedback: Google asks about it in the next step.

## 8. Production (after 14 days)
1. **Dashboard → Apply for production** → answer the questions about the test (what testers did, what you fixed).
2. Google reviews (usually a few days). Then **Production → Create release** → promote the tested build → roll out
   (start at 20 % if you want, then 100 %).

## 9. Later updates (automatic)
Bump `version` in `apps/block-quarry/package.json` for a new user-visible version; `versionCode` is the GitHub run number.
To let the CI upload each build to the internal track by itself: Play Console → Setup → API access → create a
service account with "Release to testing tracks" permission, download its JSON key, and store it as the secret
`PLAY_SERVICE_ACCOUNT_JSON`.

## Monetisation rules implemented (for the review questions and your own peace of mind)
- Reward videos are always optional: +3 moves when an Adventure level runs out of moves, a free hammer to continue a
  game, or +20 coins (5 per day, in the Themes window).
- Full-screen ads only between two games or levels, never during play, never in the first 5 minutes of a session,
  at most one every 4 minutes and one break in three.
- "Remove ads" (one-time) removes those full-screen ads; reward videos stay available as an option.
- No ads before the consent form in the EEA/UK/Switzerland; "Privacy options" in Settings reopens it.
- No energy, no loot boxes, nothing that can only be bought: coins, boosters and themes are earned by playing.
