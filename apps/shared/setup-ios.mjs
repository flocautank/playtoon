// Prépare le projet iOS d'une application Playtoon après `npx cap add ios` (idempotent) :
// orientation, iPhone seulement, conformité export (pas de chiffrement propre), et pour les applis avec publicité :
// identifiant AdMob (variable de build ADMOB_APP_ID, test par défaut, réel passé par la CI), SKAdNetwork de Google,
// texte de la demande App Tracking Transparency.
// Usage (depuis le dossier de l'application) : node ../shared/setup-ios.mjs portrait|landscape [noads]
import { readFileSync, writeFileSync } from 'fs';

const orient = process.argv[2] || 'portrait', noAds = process.argv[3] === 'noads';
const plistPath = 'ios/App/App/Info.plist', pbxPath = 'ios/App/App.xcodeproj/project.pbxproj';
let p = readFileSync(plistPath, 'utf8');
const setKey = (key, xml) => {
  const re = new RegExp(`\\s*<key>${key}</key>\\s*(<string>[^<]*</string>|<true/>|<false/>|<array>[\\s\\S]*?</array>|<dict>[\\s\\S]*?</dict>)`);
  p = p.replace(re, '');
  if (xml !== null) p = p.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${xml}\n</dict>\n</plist>\n`);
};
const ori = orient === 'landscape'
  ? '<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>'
  : '<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>';
setKey('UISupportedInterfaceOrientations', ori);
setKey('UISupportedInterfaceOrientations~ipad', ori);
setKey('UIRequiresFullScreen', '<true/>');
setKey('UIRequiredDeviceCapabilities', '<array>\n\t\t<string>arm64</string>\n\t</array>');
setKey('ITSAppUsesNonExemptEncryption', '<false/>');   // pas de chiffrement propre : pas de déclaration d'export à chaque envoi
setKey('UIStatusBarHidden', orient === 'landscape' ? '<true/>' : null);
if (noAds) {
  for (const k of ['GADApplicationIdentifier', 'SKAdNetworkItems', 'NSUserTrackingUsageDescription']) setKey(k, null);
} else {
  setKey('GADApplicationIdentifier', '<string>$(ADMOB_APP_ID)</string>');
  setKey('SKAdNetworkItems', '<array>\n\t\t<dict>\n\t\t\t<key>SKAdNetworkIdentifier</key>\n\t\t\t<string>cstr6suwn9.skadnetwork</string>\n\t\t</dict>\n\t</array>');
  setKey('NSUserTrackingUsageDescription', '<string>Your choice only changes whether ads can be personalised for you. The game works the same either way.</string>');
}
writeFileSync(plistPath, p);

let x = readFileSync(pbxPath, 'utf8');
x = x.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, 'TARGETED_DEVICE_FAMILY = 1;');   // iPhone seulement (pas de captures iPad à fournir)
if (!noAds && !x.includes('ADMOB_APP_ID')) {
  // identifiant d'application AdMob iOS de TEST par défaut ; la CI le remplace (xcodebuild ADMOB_APP_ID=…)
  x = x.replace(/(\t+)(PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)/g, '$1ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511";\n$1$2');
}
writeFileSync(pbxPath, x);
console.log('ios/ prêt :', orient, noAds ? '· sans pub' : '· AdMob + ATT', '· iPhone seulement');
