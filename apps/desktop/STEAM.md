# Playtoon on Steam — step by step

The three games are ready as PC builds (Electron): **Block Quarry**, **Nova Foundry**, **Synth Horde** — Windows,
Linux (also Steam Deck) and macOS. Each is sold as a separate paid game (prices: `../PRICING.md`). The PC versions have
no ads and no in-game purchases.

| What | Where |
|---|---|
| Builds (every push to `main`) | GitHub → Actions → **Desktop** → artifacts `desktop-windows`, `desktop-linux`, `desktop-macos` (one `.tar.gz` per game) |
| Upload to Steam | Actions → **Desktop** → *Run workflow* → tick **steam_upload** (needs the secrets and variables below) |
| Store texts, tags, requirements | `steam/<game>/store.md` (EN + FR) |
| Store / library images (all Steamworks sizes) | `steam/<game>/art/` (regenerate: `node steam/make-art.mjs`) |
| Screenshots 1920×1080 | `steam/<game>/screenshots/en/` and `/fr/` |
| Local build | `cd apps/desktop && npm ci && node build.mjs [game] [--win\|--linux\|--mac]` → `dist/<game>/` |

---

## 1. Steamworks account (once — about 1 hour, then a waiting period)
1. https://partner.steamgames.com → **Join Steamworks** with your normal Steam account (or a dedicated one).
2. Sign the Steam Distribution Agreement as an **individual** (or as your company if you create one).
3. **Tax interview**: as a French resident, form **W-8BEN** (individual) with your French tax number (numéro fiscal) —
   the France–US treaty lowers the US withholding on Steam income to **0 %**.
4. **Bank information** (IBAN / BIC) and **identity verification** (ID document; Valve may take a few days).
5. **Steam Direct fee: US$ 100 per game** (so US$ 300 for the three), paid in Steamworks → *Create new app*.
   It is paid back in your Steam income once a game reaches US$ 1,000 of gross revenue.
6. Valve rules for a new developer: **30 days** must pass between paying the first fee and releasing a game, and each
   game must show a **"Coming soon" page for at least 2 weeks** before release.

## 2. For each game: create the app
Steamworks → *Create new app* → pay the fee → note the **App ID** (e.g. 3456780).
In GitHub → `flocautank/playtoon` → Settings → Secrets and variables → Actions → **Variables**:

| Variable | Value |
|---|---|
| `BQ_STEAM_APPID` | Block Quarry's App ID |
| `NF_STEAM_APPID` | Nova Foundry's App ID |
| `SH_STEAM_APPID` | Synth Horde's App ID |

## 3. Depots (one per system) — order matters
SteamPipe → **Depots** for the app. A new app already has one depot, `App ID + 1`. Make it, and add, exactly:

| Depot ID | Name | Operating system (depot settings) |
|---|---|---|
| App ID **+ 1** | Windows | Windows, 64-bit |
| App ID **+ 2** | Linux | Linux + SteamOS |
| App ID **+ 3** | macOS | macOS |

(The upload workflow sends `…-windows` to App ID+1, `…-linux` to +2, `…-macos` to +3.) Click **Publish** (Publish tab).

## 4. Launch options
Installation → **General installation** → *Launch options*, one per system:

| OS | Executable | Arguments |
|---|---|---|
| Windows | `BlockQuarry.exe` · `NovaFoundry.exe` · `SynthHorde.exe` | — |
| Linux + SteamOS | `launch.sh` | — (it adds `--no-sandbox`, needed inside the Steam Linux Runtime) |
| macOS | `Block Quarry.app` · `Nova Foundry.app` · `Synth Horde.app` | — |

Installation → **Linux runtime**: choose **Steam Linux Runtime 3.0 (sniper)**. Publish.

## 5. Steam Cloud (saves follow the player)
Saves are the game's local storage, in the Electron user-data folder named after the game.
Application → **Steam Cloud**: byte quota 50 MB, number of files 2000. Enable **Auto-Cloud** and add one root per system:

| Root | Subdirectory | Pattern | Recursive | OS |
|---|---|---|---|---|
| `WinAppDataRoaming` | `Block Quarry/Local Storage` | `*` | yes | Windows |
| `LinuxHome` | `.config/Block Quarry/Local Storage` | `*` | yes | Linux |
| `MacAppSupport` | `Block Quarry/Local Storage` | `*` | yes | macOS |

(Replace `Block Quarry` by `Nova Foundry` / `Synth Horde` for the other games.) Publish.

## 6. Build uploads from GitHub
1. Create a **dedicated Steam account for builds** (no purchases on it), add it to your Steamworks partner group with the
   permission **Edit App Metadata** (and *Publish App Changes To Steam* if it should set builds live).
2. On your PC, install **steamcmd**, run `steamcmd +login <that account> +quit`, enter the Steam Guard code.
3. Encode the file `config/config.vdf` (in the steamcmd folder) in base64 (`base64 -w0 config/config.vdf`) and add two
   GitHub **secrets**: `STEAM_USERNAME` = the account name, `STEAM_CONFIG_VDF` = the base64 text.
4. Actions → **Desktop** → *Run workflow* → tick **steam_upload**, branch `beta` → the three games are built and uploaded.
5. Steamworks → SteamPipe → **Builds**: the new build is on branch `beta`; test it, then **set it live on `default`**.
   (Valve does not allow the default branch to be set live by a script for released games: this click stays manual.)

## 7. Test before release
- You own your own games in Steam (developer copy). Install, then check on Windows (and Linux / Steam Deck if you can):
  launch, sound, full screen (F11 / Alt+Enter / Settings), **Steam overlay** (Shift+Tab), quit, relaunch → progress kept,
  Steam Cloud (play on a second PC).
- Synth Horde with a gamepad (Xbox / PlayStation / Steam Deck): stick, A jump, B slide, X interact, Start pause, level-up
  cards with ←/→ and A.

## 8. Store page, Steam Deck, release
1. **Store page** (each game): paste the texts, tags, genres, languages and system requirements from `steam/<game>/store.md`,
   upload the images from `steam/<game>/art/` (header, small, main, vertical capsules, page background) and the
   screenshots. **Library assets**: library capsule, header, hero, logo. **Community icon** and **client icon**.
2. **Content survey**: Block Quarry and Nova Foundry: nothing. Synth Horde: cartoon fantasy violence against living audio gear (speakers, cassettes, TVs) only, no blood.
3. **Pricing**: Steamworks → *Pricing* → base price in USD, accept Valve's recommended regional prices.
4. **Steam Input** (Steam Deck): Synth Horde → default configuration *Gamepad*; Block Quarry and Nova Foundry →
   *Mouse only / Web browser* template (touchscreen also works). Then *Request Steam Deck compatibility review*.
5. Submit the **store page for review**, then the **build for review** (Valve takes about 3–5 business days each).
6. Publish the **Coming soon** page (at least 2 weeks before release), then press **Release** on the day.

## Not included (possible later)
- **Steam achievements / cloud via the Steamworks SDK** (e.g. `steamworks.js`): Nova Foundry already has in-game achievements
  that could be mirrored. Not required to sell on Steam.
- **Code signing**: not needed for Steam on Windows; the macOS build is ad-hoc signed (Apple notarization optional).
