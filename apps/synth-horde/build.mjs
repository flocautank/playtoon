// Construit www/ de Synth Horde (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: fileURLToPath(new URL('./', import.meta.url)), section: 'tab-bonk', versionKey: 'bonk', title: 'Synth Horde', ads: false, esbuild: build });
