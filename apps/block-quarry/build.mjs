// Construit www/ de Block Quarry (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: fileURLToPath(new URL('./', import.meta.url)), section: 'tab-blocks', versionKey: 'blocks', title: 'Block Quarry', esbuild: build });
