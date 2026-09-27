// Construit www/ de Block Quarry (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: new URL('./', import.meta.url).pathname, section: 'tab-blocks', versionKey: 'blocks', title: 'Block Quarry', esbuild: build });
