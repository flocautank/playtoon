// Construit www/ de Synth Horde (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: new URL('./', import.meta.url).pathname, section: 'tab-bonk', versionKey: 'bonk', title: 'Synth Horde', esbuild: build });
