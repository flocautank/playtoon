// Construit www/ de Nova Foundry (voir apps/shared/build-app.mjs).
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { buildApp } from '../shared/build-app.mjs';
await buildApp({ dir: fileURLToPath(new URL('./', import.meta.url)), section: 'tab-forge', versionKey: 'forge', title: 'Nova Foundry', esbuild: build });
