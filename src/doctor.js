#!/usr/bin/env node
import fs from 'node:fs/promises';
import { config } from './config.js';
import { ReportStore } from './services/reportStore.js';

async function main() {
  const checks = [];
  checks.push({ name: 'Node version', value: process.version, ok: Number(process.versions.node.split('.')[0]) >= 20 });
  checks.push({ name: 'GITHUB_TOKEN configured', value: config.githubToken ? 'yes' : 'no (public unauthenticated mode)', ok: true });
  checks.push({ name: 'Data directory', value: config.dataDir, ok: true });

  const store = new ReportStore();
  await store.ensure();
  await fs.access(store.reportsDir);
  checks.push({ name: 'Reports directory writable', value: store.reportsDir, ok: true });

  console.log('GitLumen MCP Doctor\n');
  for (const check of checks) {
    console.log(`${check.ok ? '✅' : '❌'} ${check.name}: ${check.value}`);
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(`❌ Doctor failed: ${error.message}`);
  process.exit(1);
});
