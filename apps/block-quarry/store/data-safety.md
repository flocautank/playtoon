# Block Quarry — Play Console "App content" answers

These answers match what the app actually does (see `../src/mon.js` and `privacy.html`). The only SDKs that
process data are **Google Mobile Ads (AdMob) + UMP consent** and **Google Play Billing**.

## Privacy policy
`https://flocautank.github.io/playtoon/privacy.html`

## Ads
**Does your app contain ads?** Yes.

## App access
All functionality is available without special access (no login).

## Content rating (IARC questionnaire)
Category: **Game**. Violence: none. Sexuality: none. Language: none. Controlled substances: none.
Gambling / simulated gambling: **none** (coins are earned by playing and only buy boosters and themes; no loot boxes).
User interaction / chat / sharing location: **none**. Digital purchases: **yes** (one-time "Remove ads").
Expected result: PEGI 3 / ESRB Everyone (with "In-App Purchases").

## Target audience and content
Target age groups: **13–15, 16–17, 18+** (not "under 13": that would put the app under the Families policy and
require Families-certified ad SDKs). "Could the app unintentionally appeal to children?" — answer honestly
(casual puzzle, cartoon blocks); if Google asks for it, the ads are already restricted to `MaxAdContentRating.General`.

## Advertising ID
**Does your app use advertising ID?** Yes — purpose: **Advertising or marketing** (through the Google Mobile Ads SDK,
which declares the `AD_ID` permission automatically).

## Data safety form

**Does your app collect or share any of the required user data types?** Yes.
**Is all of the user data collected by your app encrypted in transit?** Yes.
**Do you provide a way for users to request that their data is deleted?** No account exists; game data is on the
device only. (Answer "No" — ad data is handled by Google; players can reset their advertising ID.)

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Location → Approximate location (from IP, by AdMob) | Yes | Yes | No | Advertising or marketing, Fraud prevention |
| Device or other IDs → Advertising ID | Yes | Yes | No | Advertising or marketing, Analytics, Fraud prevention |
| App activity → App interactions (ad views/taps) | Yes | Yes | No | Advertising or marketing, Analytics |
| App info and performance → Diagnostics (AdMob SDK) | Yes | No | No | Analytics, Fraud prevention |

Not collected: name, email, user IDs, contacts, photos, files, messages, health, precise location, web history,
financial info (payments are processed by Google Play, which the app never sees).

"Is this data processed ephemerally?" — No. "Is collection required?" — Required (ads fund the free version),
but personalisation depends on the player's UMP consent in the EEA/UK/Switzerland.

## Government apps / financial features / health
No / None / No.

## News app, COVID-19, Data deletion URL
Not applicable.
