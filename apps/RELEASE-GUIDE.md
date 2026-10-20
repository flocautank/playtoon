# Playtoon — release guide: everything left for you to do

Everything that can be done without your accounts, identity and payment is done and tested:

| Platform | Ready | Model |
|---|---|---|
| **Android (Google Play)** | 3 apps, signed builds by CI, started in an emulator on every change, store kits | Block Quarry & Nova Foundry: free + ads (+ optional one-time purchase) · Synth Horde: **paid** |
| **PC (Steam)** | 3 games for Windows, Linux/Steam Deck, macOS, built by CI (Linux build launch-tested), upload to Steam by CI, store kits | All three **paid** |
| **iOS (App Store), later** | 3 Xcode projects, CI compile check + TestFlight upload on demand, screenshots | Same as Android |
| **PlayStation** | Not feasible "easily" — see the end of this page | — |
| Website | Free (no ads) — **decision pending**, see `PRICING.md` | — |

Leaderboards (Block Quarry, Synth Horde): Google Play Games, Game Center, Steam — ready in the games, to switch on with
your accounts: section **Classements — ce qu'il te reste à faire** below.

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

## Classements — ce qu'il te reste à faire
Tout est prêt côté jeu (Block Quarry 1.13.0, Synth Horde 1.21.0) : boutons « Classement », envoi des scores, défi du jour
calé sur la **date UTC**, bornes anti-triche. Ce sont les **classements natifs** de chaque plateforme (pas de serveur à
nous, un classement par plateforme) ; tant que tu n'as rien créé, les boutons restent **masqués** et le jeu marche comme
avant. **Nova Foundry : aucun classement** (rien à faire). Le site web n'en a pas non plus.

Chaque partie dépend d'un compte **pas encore créé** : Google Play Jeux → compte Play Console (section 1) ; Game Center →
compte Apple Developer (section 3) ; Steam → compte Steamworks et App ID (section 2). Fais-les dans cet ordre-là, quand
le compte existe.

### Les classements à créer (recopie exactement)
| Jeu | Classement (nom affiché EN / FR) | Variable GitHub de l'ID Play Jeux | ID Game Center | Nom Steam | Format | Ordre | Min | Max | Période |
|---|---|---|---|---|---|---|---|---|---|
| Block Quarry | Daily challenge / Défi du jour | `BQ_PLAY_LB_DAILY` | `io.github.flocautank.blockquarry.daily` | `daily-AAAA-MM-JJ` (auto) | nombre entier | plus grand = meilleur | 1 | 1 000 000 | **quotidien** |
| Block Quarry | Classic record / Record Classique | `BQ_PLAY_LB_CLASSIC` | `io.github.flocautank.blockquarry.classic` | `classic` (auto) | nombre entier | plus grand = meilleur | 1 | 10 000 000 | permanent |
| Block Quarry | Time Attack record / Record Chrono | `BQ_PLAY_LB_CHRONO` | `io.github.flocautank.blockquarry.chrono` | `chrono` (auto) | nombre entier | plus grand = meilleur | 1 | 1 000 000 | permanent |
| Synth Horde | Daily challenge / Défi du jour | `SH_PLAY_LB_DAILY` | `io.github.flocautank.synthhorde.daily` | `daily-AAAA-MM-JJ` (auto) | nombre entier | plus grand = meilleur | 1 | 200 000 | **quotidien** |
| Synth Horde | Best survival / Meilleure survie | `SH_PLAY_LB_SURVIVAL` | `io.github.flocautank.synthhorde.survival` | `survival` (auto) | **durée** (secondes) | plus grand = meilleur | 1 s | 24 h | permanent |

Les bornes servent d'anti-triche : le jeu n'envoie jamais un score hors bornes, et tu saisis les mêmes dans les consoles
(Play Jeux : en millisecondes pour la survie, soit **1 000** et **86 400 000** ; Game Center : en secondes, **1** et
**86 400**). Le défi du jour n'est envoyé que pour la grille du jour UTC en cours, et refusé si l'horloge de l'appareil
s'écarte de plus d'une heure de l'heure réseau (Android 13+, serveurs Steam, occurrence Game Center) ; hors ligne, le
score reste dans le jeu et part plus tard. Le défi change à **minuit UTC** (2 h du matin à Paris l'été, 1 h l'hiver).

### A. Google Play Jeux (Android) — après la section 1
1. Play Console → ton appli → **Développer le nombre d'utilisateurs → Services de jeux Play → Configuration et gestion →
   Configuration** → *Non, mon jeu n'utilise pas d'API Google* → donne un nom (ex. « Block Quarry ») → **Créer**.
2. Même page → **Identifiants → Ajouter un identifiant → Android** : la Play Console propose l'appli et la clé de
   signature de Google Play (signature d'application Play) — valide. Si elle demande un écran de consentement OAuth,
   suis son lien (Google Cloud) : type *Externe*, nom du jeu, ton e-mail, enregistre.
3. **Classements → Créer un classement**, une fois par ligne du tableau ci-dessus : nom (EN, puis traduction FR),
   **Format** *Numérique* sans décimale (survie : *Heure*), **Ordre** *Plus grand est meilleur*, **Limites** min/max du
   tableau, icône facultative (512×512). Enregistre, puis **copie l'ID** affiché (il commence par `CgkI…`).
4. **Testeurs** : ajoute ton compte Google (tant que la configuration n'est pas publiée, seuls les testeurs la voient).
5. En haut de la page de configuration, copie l'**ID du projet / de l'application** (environ 12 chiffres).
6. GitHub → `flocautank/playtoon` → **Settings → Secrets and variables → Actions → Variables → New repository variable** :
   `BQ_PLAY_GAMES_APP_ID`, `BQ_PLAY_LB_DAILY`, `BQ_PLAY_LB_CLASSIC`, `BQ_PLAY_LB_CHRONO` ; `SH_PLAY_GAMES_APP_ID`,
   `SH_PLAY_LB_DAILY`, `SH_PLAY_LB_SURVIVAL` (valeur = l'ID copié, sans espace).
7. Fais la même chose (1 à 6) pour Synth Horde, puis **Examiner et publier** la configuration Play Jeux de chaque jeu.
8. Actions → **Android** → *Run workflow* : les nouveaux AAB contiennent Play Jeux. Envoie-les sur le **test interne**,
   installe depuis le Play Store (l'APK de débogage de la CI n'est pas signé par Google : Play Jeux y refuse la connexion).
9. Vérifie : au lancement, bandeau « Connecté en tant que … » ; joue le défi du jour jusqu'à la fin → **Classement** →
   l'écran Google montre ton score. Puis mets à jour la fiche **Sécurité des données** (`<appli>/store/data-safety.md`).

Bon à savoir : Google remet ses classements « du jour » à zéro à **minuit heure du Pacifique** (9 h à Paris). Pour ne
jamais mélanger deux grilles, un score du défi joué entre minuit UTC et minuit Pacifique attend dans le jeu et part
dès que la journée de Google rejoint celle du défi (le jeu le fait seul à la reprise ; un défi d'un autre jour est abandonné).

### B. Game Center (iOS) — après la section 3
1. App Store Connect → ton app → **Services → Game Center → Classements → +**.
2. Défi du jour : **Classement récurrent** ; nom de référence `Daily challenge` ; **ID** exactement celui du tableau ;
   format **Entier** ; **Tri** *Du plus élevé au plus faible* ; envoi *Meilleur score* ; plage **1** à la valeur max ;
   **début** demain à **00:00 UTC** (GMT) ; **durée 1 jour** ; **se répète tous les 1 jour**.
3. Record Classique, record Chrono, meilleure survie : **Classement classique**, même ID, tri, plage ; survie au format
   **Temps écoulé — à la seconde**.
4. Pour chacun : **Localisation** anglais + français (nom affiché du tableau).
5. Page de la version de l'app → section **Game Center** → coche Game Center et ajoute les classements (sinon ils ne
   sont pas actifs à la validation). Rien à mettre dans GitHub : les ID sont déjà dans le jeu, et la capacité Game Center
   est déjà dans le projet (la signature automatique l'ajoute à l'App ID).
6. Vérifie : Actions → **iOS** → *Run workflow* (testflight) → installe par **TestFlight** ; sur l'iPhone, Réglages →
   Game Center connecté (en TestFlight, Game Center utilise son bac à sable tout seul) ; joue le défi → **Classement**.
   Si Game Center n'est pas connecté, le bouton propose la connexion ; refus = le jeu continue sans classement.
7. Étiquettes de confidentialité (App Privacy) : rien de collecté par toi pour Game Center (les données sont celles d'Apple).

### C. Steam — après la section 2
1. Rien à créer : le jeu crée ses classements au premier score (`daily-2026-10-20`, `classic`, `chrono`, `survival`),
   triés du plus grand au plus petit (survie affichée en temps). Ils apparaissent ensuite dans Steamworks →
   **Statistiques et succès → Classements** (tu peux y changer le nom affiché ; laisse « écriture par le client »).
2. Les variables `BQ_STEAM_APPID` et `SH_STEAM_APPID` (section 2) suffisent — elles sont aussi inscrites dans la construction.
3. Vérifie : Actions → **Desktop** → *Run workflow* (steam_upload, branche `beta`) → lance le jeu **depuis Steam** (Steam
   doit tourner) → finis un défi → **Classement** : le panneau du jeu affiche le top 10 et ta place. Sans Steam : boutons masqués.
4. Page du magasin : coche la fonctionnalité **Classements Steam** (`desktop/steam/<jeu>/store.md`).

### D. Fiches et confidentialité (déjà rédigées)
- `privacy.html` (en ligne avec le site) décrit les classements : rien à faire.
- Google Play : mets à jour **Sécurité des données** quand Play Jeux est actif (`<appli>/store/data-safety.md`, section *Leaderboards*).
- Fiches boutique : les lignes « classements » de `<appli>/store/listing.md` ne sont à garder qu'une fois les classements en service.

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
`NF_IOS_ADMOB_INTERSTITIAL_ID` · `APPLE_TEAM_ID` · leaderboards (see *Classements*): `BQ_PLAY_GAMES_APP_ID`,
`BQ_PLAY_LB_DAILY`, `BQ_PLAY_LB_CLASSIC`, `BQ_PLAY_LB_CHRONO`, `SH_PLAY_GAMES_APP_ID`, `SH_PLAY_LB_DAILY`, `SH_PLAY_LB_SURVIVAL`.

---

## PlayStation: why it is not "easy", and what would be needed
- Publishing on PlayStation requires being accepted into **PlayStation Partners** (in practice as a registered business),
  signing NDAs, and buying **development kits**; the SDK, the kits' prices and the rules are confidential.
- PlayStation consoles do not run web games: the three games would have to be **ported to a console engine**
  (e.g. Unity, Unreal, or Godot through a console-porting company), then pass Sony's **certification** (TRC).
- Realistic path if the games sell well on Steam: approach a **porting studio or publisher** (they hold the dev kits and
  handle certification against a revenue share). Same situation for Xbox (ID@Xbox) and Nintendo Switch.
- Meanwhile, **Steam Deck** covers the "console in hand" audience: the Linux build and Synth Horde's gamepad support are ready.
