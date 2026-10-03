#!/usr/bin/env node
// Requires Node 22+ and an installed Chromium browser. No npm dependencies.
// BROWSER_PATH may point to Chrome/Edge/Chromium on another machine.
// BROWSER_NO_SANDBOX=1 supports trusted local PNG conversion inside a restricted process sandbox.
// Optional arguments: source PNG filenames to regenerate only selected pizzas.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'public/assets/img/pizzas');
const outputDir = path.join(sourceDir, 'web');
const sizes = [320, 480, 800, 1280];
const quality = 0.95;
const browserCandidates = [
  process.env.BROWSER_PATH,
  path.join(process.env.PROGRAMFILES || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].filter(Boolean);
const browserPath = browserCandidates.find(existsSync);
if (!browserPath) throw new Error('Install Chrome/Edge/Chromium or set BROWSER_PATH.');

const availableSources = (await readdir(sourceDir)).filter(name => name.endsWith('.png')).sort();
const requestedSources = process.argv.slice(2);
if (requestedSources.some(name => !availableSources.includes(name))) throw new Error('Unknown source PNG filename.');
const sourceNames = requestedSources.length ? availableSources.filter(name => requestedSources.includes(name)) : availableSources;
if (!sourceNames.length) throw new Error('No source PNGs found.');
await mkdir(outputDir, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), 'slice-pizza-webp-'));
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  ...(process.env.BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let browserLogs = '';
browser.stderr.on('data', chunk => { browserLogs = (browserLogs + chunk.toString()).slice(-8192); });

let socket;
try {
  const debugUrl = await new Promise((resolve, reject) => {
    let logs = '';
    const timeout = setTimeout(() => reject(new Error('Browser startup timed out.')), 20000);
    browser.once('error', error => { clearTimeout(timeout); reject(error); });
    browser.once('exit', code => { clearTimeout(timeout); reject(new Error(`Browser exited: ${code}\n${logs}`)); });
    browser.stderr.on('data', chunk => {
      logs += chunk.toString();
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  const debugOrigin = debugUrl.replace(/^ws:/, 'http:').replace(/\/devtools\/.*$/, '');
  const targets = await (await fetch(`${debugOrigin}/json/list`)).json();
  const page = targets.find(target => target.type === 'page');
  if (!page) throw new Error('No browser page target found.');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const rejectPending = error => {
    for (const operation of pending.values()) {
      clearTimeout(operation.timeout);
      operation.reject(error);
    }
    pending.clear();
  };
  const browserError = detail => new Error(`${detail}\n${browserLogs.trim()}\nIf the browser renderer is blocked by a restricted process sandbox, use BROWSER_NO_SANDBOX=1 for these trusted local PNGs.`);
  socket.addEventListener('error', () => rejectPending(browserError('Browser WebSocket error.')));
  socket.addEventListener('close', event => rejectPending(browserError(`Browser WebSocket closed (${event.code}): ${event.reason}`)));
  browser.once('exit', (code, signal) => rejectPending(browserError(`Browser exited (${code ?? signal}).`)));
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.consoleAPICalled') {
      console.log(message.params.args.map(argument => argument.value ?? argument.description ?? '').join(' '));
    }
    if (!message.id) return;
    const operation = pending.get(message.id);
    if (!operation) return;
    pending.delete(message.id);
    clearTimeout(operation.timeout);
    if (message.error) operation.reject(new Error(message.error.message));
    else operation.resolve(message.result);
  });
  const call = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(browserError(`${method} timed out after ${timeoutMs / 1000}s.`)); }, timeoutMs);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const browserVersion = await call('Browser.getVersion');
  await call('Runtime.enable');
  console.log(`Using ${browserVersion.product} for local PNG exports.`);
  const assets = [];
  for (const name of sourceNames) {
    const sourcePath = path.join(sourceDir, name);
    const source = await readFile(sourcePath);
    const hash = createHash('sha256').update(source).digest('hex');
    console.log(`Converting ${name} (${Math.round(source.length / 1024)} KiB source).`);
    const expression = `(${async function convert(sourceUrl, targetSizes, encodingQuality) {
      console.info('Loading source PNG.');
      const image = new Image();
      image.src = sourceUrl;
      await image.decode();
      console.info(`Decoded source: ${image.naturalWidth} x ${image.naturalHeight}.`);
      const variants = [];
      const nativeSize = Math.max(image.naturalWidth, image.naturalHeight);
      // Keep the original detail for large displays, without enlarging small sources.
      const availableSizes = [...new Set([...targetSizes.filter(size => size < nativeSize), nativeSize])];
      for (const size of availableSizes) {
        console.info(`Encoding and verifying ${size}px WebP.`);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        const expectedPixels = context.getImageData(0, 0, size, size).data;
        const dataUrl = canvas.toDataURL('image/webp', encodingQuality);
        if (!dataUrl.startsWith('data:image/webp;base64,')) throw new Error('Browser WebP encoder unavailable.');
        const decoded = new Image();
        decoded.src = dataUrl;
        await decoded.decode();
        if (decoded.naturalWidth !== size || decoded.naturalHeight !== size) throw new Error('Wrong WebP dimensions.');
        const check = document.createElement('canvas');
        check.width = size;
        check.height = size;
        const checkContext = check.getContext('2d', { willReadFrequently: true });
        checkContext.drawImage(decoded, 0, 0);
        const pixels = checkContext.getImageData(0, 0, size, size).data;
        let transparentPixels = 0;
        let translucentPixels = 0;
        let maxAlpha = 0;
        let alphaMaxDelta = 0;
        let alphaDifferentPixels = 0;
        for (let index = 3; index < pixels.length; index += 4) {
          const alpha = pixels[index];
          if (alpha === 0) transparentPixels++;
          else if (alpha < 255) translucentPixels++;
          maxAlpha = Math.max(maxAlpha, alpha);
          const alphaDelta = Math.abs(alpha - expectedPixels[index]);
          alphaMaxDelta = Math.max(alphaMaxDelta, alphaDelta);
          if (alphaDelta) alphaDifferentPixels++;
        }
        if (!transparentPixels || maxAlpha < 240) throw new Error('Alpha verification failed.');
        if (alphaMaxDelta) throw new Error('WebP encoding changed transparency.');
        variants.push({ size, dataUrl, transparentPixels, translucentPixels, maxAlpha, alphaMaxDelta, alphaDifferentPixels });
      }
      return { width: image.naturalWidth, height: image.naturalHeight, variants };
    }})(${JSON.stringify(`data:image/png;base64,${source.toString('base64')}`)}, ${JSON.stringify(sizes)}, ${quality})`;
    const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, 60000);
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || 'Image conversion failed.');
    const converted = response.result.value;
    const entry = { source: name, sourceBytes: source.length, sourceSha256: hash, width: converted.width, height: converted.height, variants: [] };
    for (const variant of converted.variants) {
      const outputName = `${path.parse(name).name}-${variant.size}.webp`;
      const encoded = Buffer.from(variant.dataUrl.split(',')[1], 'base64');
      await writeFile(path.join(outputDir, outputName), encoded);
      const { dataUrl, ...metadata } = variant;
      entry.variants.push({ file: outputName, bytes: encoded.length, ...metadata });
    }
    if (createHash('sha256').update(await readFile(sourcePath)).digest('hex') !== hash) throw new Error(`Source changed: ${name}`);
    assets.push(entry);
    console.log(`${name}: ${entry.variants.map(variant => `${variant.size}px ${Math.round(variant.bytes / 1024)} KiB`).join(', ')}`);
  }
  const sourceBytes = assets.reduce((sum, entry) => sum + entry.sourceBytes, 0);
  const totals = {};
  for (const entry of assets) for (const variant of entry.variants) {
    totals[variant.size] = (totals[variant.size] || 0) + variant.bytes;
  }
  const nativeBytes = assets.reduce((sum, entry) => sum + entry.variants.at(-1).bytes, 0);
  const report = { encoder: 'Chromium Canvas WebP', quality, fit: 'contain, centered, transparent, no crop, no upscale', sourceCount: assets.length, sourceBytes, nativeBytes, totals, assets };
  const reportDir = path.join(root, 'output');
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, 'pizza-optimization-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ sourceCount: assets.length, sourceBytes, nativeBytes, totals, nativeSavings: `${(100 - nativeBytes / sourceBytes * 100).toFixed(1)}%` }, null, 2));
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  browser.kill();
  await new Promise(resolve => { if (browser.exitCode !== null) resolve(); else { browser.once('exit', resolve); setTimeout(resolve, 5000).unref(); } });
  // Resolve and verify the exact temporary profile before recursive cleanup.
  const resolvedProfile = path.resolve(profile);
  if (path.dirname(resolvedProfile) === path.resolve(tmpdir()) && path.basename(resolvedProfile).startsWith('slice-pizza-webp-')) {
    await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
  }
}
