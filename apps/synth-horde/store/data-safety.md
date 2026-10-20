# Synth Horde — Play Console "App content" answers

Synth Horde is a **paid app with no ads and no in-app purchases**. Game progress stays on the device. Since 1.21.0 the
only SDK that processes data is **Google Play Games Services** (leaderboards: daily challenge, best survival), and only
once it is configured (see `../src/app.js`, `../../shared/scores.js`).

## Privacy policy
`https://flocautank.github.io/playtoon/privacy.html`

## Ads
**Does your app contain ads?** **No.**

## App access
All functionality is available without special access (no login).

## Content rating (IARC questionnaire)
Category: **Game**. Violence: fantasy violence against abstract geometric enemies, no blood, no humans. Sexuality: none.
Language: none. Controlled substances: none. Gambling / simulated gambling: none (chests give random in-run upgrades bought
with in-game gold only). User interaction / chat / sharing location: none. Digital purchases: **no**.
Expected result: PEGI 7 / ESRB Everyone 10+ (likely).

## Target audience and content
Target age groups: **13–15, 16–17, 18+** (keeps the app out of the Families program, which has extra requirements).

## Advertising ID
**Does your app use advertising ID?** **No** (no ads SDK; the `AD_ID` permission is not in the manifest).

## Data safety form
**Before Play Games is configured** (no `SH_PLAY_GAMES_APP_ID` variable): **No** data collected or shared
(answer "No" to collection: the store then shows "No data collected" / "No data shared").
**Once the leaderboards are live**: **Yes** — the two lines of the table below. Encrypted in transit: **Yes** (Google's SDK).
Account deletion: not applicable (no account of ours; the Play Games profile belongs to Google).

## Government apps / financial features / health
Not applicable.

## Leaderboards (Google Play Games Services) — added in 1.21.0
The app uses **Google Play Games Services v2** for its leaderboards (daily challenge, best survival). Only the score and the leaderboard
it belongs to are sent, by Google's SDK, to Google's servers, under the player's Play Games profile (gamer tag) —
we run no server and receive nothing. Not signed in / offline: nothing is sent. Play Games is only active when the
GitHub variable `SH_PLAY_GAMES_APP_ID` is set (see `apps/RELEASE-GUIDE.md` → *Leaderboards*); before that, the app
does not include the Play Games app ID and these lines do not apply.

Add to the Data safety form (Google acts as the service provider; check Google's own list for the Play Games SDK:
https://developer.android.com/games/pgs/data-safety):

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| App activity → Other actions (leaderboard scores) | Yes | No | Yes (only when signed in to Play Games) | App functionality |
| Personal info → User IDs (Play Games player ID, by Google) | Yes | No | Yes | App functionality, Account management |

The store listing may say "Google Play Games leaderboards". Game Center (iOS) and Steam (PC) handle their leaderboards the
same way: App Store Connect privacy label → *Gameplay content* / *User ID* "Not linked to you / used for app functionality"
only if Apple asks for it (Game Center data is Apple's, not collected by the developer).
