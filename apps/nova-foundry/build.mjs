// Construit www/ de Nova Foundry (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: new URL('./', import.meta.url).pathname, section: 'tab-forge', versionKey: 'forge', title: 'Nova Foundry', esbuild: build });
