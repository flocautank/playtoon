// Prépare le projet Android d'une application Playtoon après `npx cap add android` (idempotent) :
// identifiant AdMob injecté par la CI, orientation, numéro de version et signature fournis par la CI.
// Usage (depuis le dossier de l'application) : node ../shared/setup-android.mjs portrait|landscape [noads] [scores]
// « noads » : application payante sans SDK publicitaire (pas d'identifiant AdMob dans le manifeste).
// « scores » : classements Google Play Jeux (Block Quarry, Synth Horde) — l'identifiant Play Jeux n'est déclaré dans le
// manifeste que si la CI fournit PLAY_GAMES_APP_ID (manifeste src/playgames/ ajouté aux variantes à la construction).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const orient = process.argv[2] || 'portrait', noAds = process.argv.includes('noads'), scores = process.argv.includes('scores');
const man = 'android/app/src/main/AndroidManifest.xml', gr = 'android/app/build.gradle';
let m = readFileSync(man, 'utf8');
if (noAds) m = m.replace(/\n\s*<!-- AdMob[^\n]*-->\n\s*<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"[^\n]*\n/, '\n');
else if (!m.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  m = m.replace('android:theme="@style/AppTheme">\n', 'android:theme="@style/AppTheme">\n\n        <!-- AdMob : identifiant de l\'application (test par défaut, réel injecté par la CI via ADMOB_APP_ID) -->\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${admobAppId}" />\n');
}
m = m.replace(/\n\s*android:screenOrientation="[a-zA-Z]+"/, '');
m = m.replace('android:launchMode="singleTask"\n', `android:launchMode="singleTask"\n            android:screenOrientation="${orient === 'landscape' ? 'sensorLandscape' : 'portrait'}"\n`);
writeFileSync(man, m);

let g = readFileSync(gr, 'utf8');
if (!g.includes('VERSION_CODE')) {
  g = g.replace(/        versionCode 1\n        versionName "1.0"\n/, `        // numéro de version : VERSION_CODE (la CI passe le numéro de build), VERSION_NAME (js/version.js)
        versionCode((System.getenv("VERSION_CODE") ?: "1") as Integer)
        versionName(System.getenv("VERSION_NAME") ?: "1.0.0")
        manifestPlaceholders = [admobAppId: System.getenv("ADMOB_APP_ID") ?: "ca-app-pub-3940256099942544~3347511713"]
`);
  g = g.replace(`    buildTypes {
        release {
            minifyEnabled false`, `    // signature de publication : clé d'envoi fournie par la CI (secrets GitHub), jamais dans le dépôt
    signingConfigs {
        release {
            def ks = System.getenv("UPLOAD_KEYSTORE_PATH")
            if (ks) {
                storeFile file(ks)
                storePassword System.getenv("UPLOAD_KEYSTORE_PASSWORD")
                keyAlias System.getenv("UPLOAD_KEY_ALIAS") ?: "upload"
                keyPassword System.getenv("UPLOAD_KEY_PASSWORD") ?: System.getenv("UPLOAD_KEYSTORE_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (System.getenv("UPLOAD_KEYSTORE_PATH")) signingConfig signingConfigs.release
            minifyEnabled false`);
}
if (scores && !g.includes('PLAY_GAMES_APP_ID')) {
  g = g.replace("apply from: 'capacitor.build.gradle'\n", `apply from: 'capacitor.build.gradle'

// Google Play Jeux (classements) : déclaré SEULEMENT si la CI fournit PLAY_GAMES_APP_ID (variable GitHub
// <PRÉFIXE>_PLAY_GAMES_APP_ID). Sans lui : ni ressource ni meta-data, l'appli démarre exactement comme avant et le
// plugin PtScores (apps/shared/pt-scores) reste inactif.
def playGamesAppId = (System.getenv("PLAY_GAMES_APP_ID") ?: "").trim()
if (playGamesAppId) {
    android {
        buildFeatures { resValues = true }
        defaultConfig { resValue "string", "games_app_id", playGamesAppId }
        sourceSets {
            debug { manifest.srcFile 'src/playgames/AndroidManifest.xml' }
            release { manifest.srcFile 'src/playgames/AndroidManifest.xml' }
        }
    }
}
`);
}
if (scores) {
  mkdirSync('android/app/src/playgames', { recursive: true });
  writeFileSync('android/app/src/playgames/AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<!-- Ajouté au manifeste de l'appli par android/app/build.gradle seulement quand PLAY_GAMES_APP_ID est fourni (CI). -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <meta-data android:name="com.google.android.gms.games.APP_ID" android:value="@string/games_app_id" />
    </application>
</manifest>
`);
}
writeFileSync(gr, g);
console.log('android/ prêt :', orient, g.includes('VERSION_CODE') ? '· version et signature par la CI' : '· ÉCHEC du patch gradle', noAds ? (m.includes('APPLICATION_ID') ? '· ÉCHEC : AdMob encore présent' : '· sans pub') : m.includes('APPLICATION_ID') ? '· AdMob' : '· ÉCHEC AdMob',
  scores ? (g.includes('PLAY_GAMES_APP_ID') ? '· Play Jeux si PLAY_GAMES_APP_ID' : '· ÉCHEC Play Jeux') : '');
