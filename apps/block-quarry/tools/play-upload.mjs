// Envoie un AAB sur une piste Google Play (internal, alpha, beta, production) via l'API Play Developer.
// Usage : node tools/play-upload.mjs <compte-de-service.json> <app-release.aab> [piste]
// Prérequis : l'application existe dans la Play Console et un premier AAB y a été déposé à la main
// (exigence de Google), et le compte de service a le droit « Publier » sur l'application.
import { google } from 'googleapis';
import { createReadStream } from 'fs';

const [keyFile, aab, track = 'internal'] = process.argv.slice(2);
const packageName = 'io.github.flocautank.blockquarry';
const auth = new google.auth.GoogleAuth({ keyFile, scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
const api = google.androidpublisher({ version: 'v3', auth });

const { data: edit } = await api.edits.insert({ packageName });
const { data: bundle } = await api.edits.bundles.upload({ packageName, editId: edit.id, media: { mimeType: 'application/octet-stream', body: createReadStream(aab) } });
await api.edits.tracks.update({ packageName, editId: edit.id, track, requestBody: { track, releases: [{ versionCodes: [String(bundle.versionCode)], status: track === 'production' ? 'draft' : 'completed' }] } });
await api.edits.commit({ packageName, editId: edit.id });
console.log(`versionCode ${bundle.versionCode} publié sur la piste « ${track} »`);
