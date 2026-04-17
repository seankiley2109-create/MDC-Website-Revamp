/**
 * Montana Data Company — ngrok Dev Tunnel
 *
 * Spawns the ngrok CLI, waits for it to bind, then queries the local
 * ngrok API at localhost:4040 to retrieve the public URL.
 * Prints exactly which values to copy into Paystack and .env.local.
 *
 * Usage:
 *   npm run tunnel            (run alongside npm run dev in a second terminal)
 *
 * First-time setup:
 *   1. Add to .env.local:   NGROK_AUTHTOKEN=your_token
 *   2. Add to .env.local:   NGROK_DOMAIN=trancelike-mouselike-criselda.ngrok-free.dev
 *      (or whatever static domain ngrok assigned you — Dashboard → Domains)
 */

'use strict';

const { spawn } = require('child_process');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = value;
  }
}

// ── Poll localhost:4040/api/tunnels until ngrok is up ─────────────────────────
function getTunnelUrl(attempt = 0) {
  return new Promise((resolve, reject) => {
    if (attempt > 30) {
      reject(new Error('ngrok did not become ready after 15 seconds.'));
      return;
    }

    setTimeout(() => {
      const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const data   = JSON.parse(body);
            const tunnel = (data.tunnels || []).find(t => t.proto === 'https');
            if (tunnel?.public_url) {
              resolve(tunnel.public_url);
            } else {
              getTunnelUrl(attempt + 1).then(resolve).catch(reject);
            }
          } catch {
            getTunnelUrl(attempt + 1).then(resolve).catch(reject);
          }
        });
      });
      req.on('error', () => {
        getTunnelUrl(attempt + 1).then(resolve).catch(reject);
      });
    }, 500);
  });
}

// ── Box printer ───────────────────────────────────────────────────────────────
function printBox(lines) {
  const width  = Math.max(...lines.map(l => l.length)) + 2;
  const border = '─'.repeat(width + 2);
  console.log(`\n┌${border}┐`);
  for (const line of lines) {
    const pad = width - line.length;
    console.log(`│ ${line}${' '.repeat(pad)} │`);
  }
  console.log(`└${border}┘\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  loadEnvLocal();

  const authtoken = process.env.NGROK_AUTHTOKEN;
  const domain    = process.env.NGROK_DOMAIN;

  if (!authtoken) {
    console.error('\n❌  NGROK_AUTHTOKEN is not set in .env.local');
    console.error('    Get your token at: https://dashboard.ngrok.com/get-started/your-authtoken\n');
    process.exit(1);
  }

  // Build CLI args:  ngrok http [--domain=X] [--authtoken=Y] 3000
  const args = ['http', '--authtoken', authtoken];
  if (domain) args.push(`--domain=${domain}`);
  args.push('3000');

  console.log('\n⏳  Starting ngrok tunnel on port 3000…');
  if (domain) console.log(`    Domain: ${domain}`);

  const proc = spawn('ngrok', args, {
    stdio: ['ignore', 'ignore', 'pipe'], // capture stderr for error output only
  });

  let stderr = '';
  proc.stderr.on('data', chunk => { stderr += chunk.toString(); });

  proc.on('error', (err) => {
    console.error('\n❌  Could not launch ngrok CLI:', err.message);
    console.error('    Make sure ngrok is installed: https://ngrok.com/download\n');
    process.exit(1);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌  ngrok exited with code ${code}`);
      if (stderr) console.error('   ', stderr.trim());
      process.exit(1);
    }
  });

  // Query the local ngrok API to get the assigned URL
  try {
    const url        = await getTunnelUrl();
    const webhookUrl = `${url}/api/subscribe/webhook`;

    printBox([
      '  Montana Data Company — Dev Tunnel Active  ',
      '',
      `  Public URL    →  ${url}`,
      `  Webhook URL   →  ${webhookUrl}`,
      '',
      '  ── Add to .env.local ──────────────────────────────',
      `  APP_URL="${url}"`,
      '',
      '  ── Register in Paystack (once) ────────────────────',
      '  Dashboard → Settings → Webhooks → Webhook URL',
      `  ${webhookUrl}`,
    ]);

    console.log('🚇  Tunnel is live. Press Ctrl+C to stop.\n');

    // Keep alive and clean up on exit
    process.stdin.resume();
    process.on('SIGINT', () => {
      console.log('\n⏹  Stopping tunnel…');
      proc.kill();
      process.exit(0);
    });

  } catch (err) {
    console.error('\n❌  ', err.message);
    if (stderr) console.error('    ngrok output:', stderr.trim());
    proc.kill();
    process.exit(1);
  }
}

main();
