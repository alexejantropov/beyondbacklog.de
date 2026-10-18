// Starts the production server (server.mjs) on dist/ for the browser checks and stops it when
// the process exits. Returns the base URL; pass --base <url> to the checks to skip it.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

export async function startPreviewServer(port) {
  if (!existsSync('dist/client/index.html')) {
    console.error('dist/ is missing. Run `npm run build` first (or pass --base <url>).');
    process.exit(2);
  }
  const base = `http://127.0.0.1:${port}`;
  // Dummy secrets so the API routes load; nothing is sent.
  const server = spawn('node', ['server.mjs'], { stdio: 'ignore', detached: true, env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), SUBSCRIBE_SECRET: 'check', RESEND_API_KEY: 're_check' } });
  process.on('exit', () => {
    try {
      process.kill(-server.pid);
    } catch {
      // already gone
    }
  });
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(base)).ok) return base;
    } catch {
      // not up yet
    }
    if (i > 60) throw new Error('Preview server did not start');
    await sleep(500);
  }
}
