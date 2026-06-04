import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';

const APP_ROUTE = '/lessons/bash-commands';
const PROGRESS_KEY = 'cct.progress.v1';

const appPort = await getFreePort();
const chromePort = await getFreePort();
const userDataDir = await mkdtemp(join(tmpdir(), 'claude-code-tutorials-chrome-'));
const appUrl = `http://localhost:${appPort}`;

let serverProcess;
let chromeProcess;

async function main() {
  serverProcess = await startProcess('npm', ['run', 'start', '--', '-p', String(appPort)], {
    ready: (line) => line.includes('Ready') || line.includes('Local:'),
  });
  await waitForHttp(`${appUrl}${APP_ROUTE}`);

  chromeProcess = await startChrome(chromePort, userDataDir);
  const browser = new Browser(`http://127.0.0.1:${chromePort}`);

  await runDesktopLearningFlow(browser);
  await runMobileLayoutFlow(browser);

  console.log('Rendered QA passed');
  console.log(`- Production app: ${appUrl}`);
  console.log('- Covered: terminal challenge, Replay, Plant and Forest cascade scaling, palette locked/unlocked flows, desktop/mobile overflow, console/runtime errors');
}

async function runDesktopLearningFlow(browser) {
  const page = await browser.open();
  await page.setViewport(1440, 900);
  await page.setReducedMotion(true);
  await page.navigate(`${appUrl}${APP_ROUTE}`);
  await page.waitFor(() => Boolean(document.querySelector('#terminal-challenge-input')));
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ bankedTips: {} })), PROGRESS_KEY);
  await page.navigate(`${appUrl}${APP_ROUTE}`);
  await page.waitFor(() => Boolean(document.querySelector('#challenge-brief-heading')));

  const lessonState = await page.evaluate(() => {
    const region = document.querySelector('[aria-labelledby="challenge-brief-heading"]');
    const signature = Array.from(document.querySelectorAll('h2')).find((el) => el.textContent.includes("Search, don't slurp"));
    const regionBox = region?.getBoundingClientRect();
    const signatureBox = signature?.getBoundingClientRect();
    return {
      heading: document.querySelector('#challenge-brief-heading')?.textContent,
      promptCopy: region?.textContent.includes('After the transcript finishes, the terminal asks') ?? false,
      hintCopy: region?.textContent.includes('?') && region?.textContent.includes('reset'),
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      cardWithinViewport: regionBox ? regionBox.left >= 0 && regionBox.right <= window.innerWidth : false,
      noOverlap: regionBox && signatureBox ? regionBox.bottom <= signatureBox.top : false,
      challengeReady: !document.querySelector('#terminal-challenge-input')?.disabled,
    };
  });

  assertIncludes(lessonState.heading, 'Your turn: find where auth errors are thrown', 'challenge brief heading');
  assert(lessonState.promptCopy, 'challenge brief prompt copy missing');
  assert(lessonState.hintCopy, 'challenge brief hint/reset copy missing');
  assert(lessonState.noOverflow, 'desktop lesson has horizontal overflow');
  assert(lessonState.cardWithinViewport, 'challenge brief leaves desktop viewport');
  assert(lessonState.noOverlap, 'challenge brief overlaps signature tip');
  assert(lessonState.challengeReady, 'terminal challenge input should be ready under reduced motion');

  await submitTerminalCommand(page, '?');
  await page.waitForText('Hint: Search for the exact error constructor inside src/server.');
  await submitTerminalCommand(page, 'Read src/server/auth.ts');
  await page.waitForText('Close, but this exercise wants a search command');
  await submitTerminalCommand(page, 'reset');
  await page.waitFor((needle) => {
    const visibleTextIncludes = (text) => Array.from(document.body.querySelectorAll('*')).some((element) => {
      if (element instanceof HTMLScriptElement || element instanceof HTMLStyleElement) return false;
      if (element.children.length > 0) return false;
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.textContent.includes(text);
    });
    return !visibleTextIncludes(needle);
  }, 10000, 'Close, but this exercise wants a search command');
  await submitTerminalCommand(page, 'rg "throw new AuthError" src/server');
  await page.waitForText('Found the line without loading two full files.');
  await page.waitForText('3,200 tokens saved');
  await page.clickByText('Replay');
  await page.waitForNoText('Found the line without loading two full files.');
  const replayState = await page.evaluate(() => ({
    inputValue: document.querySelector('#terminal-challenge-input')?.value,
    challengeReady: !document.querySelector('#terminal-challenge-input')?.disabled,
  }));
  assert(replayState.inputValue === '', 'Replay should clear the challenge input');
  assert(replayState.challengeReady, 'Replay should leave the reduced-motion challenge ready');

  await page.clickByText('Bank this tip');
  await page.waitForText('tokens kept out of the next prompt loop');
  await page.clickByText('Team of 20');
  await page.waitForText('160,000,000');
  const progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), PROGRESS_KEY);
  assert(progress?.bankedTips?.['bash-commands']?.includes('l3-grep'), 'banking did not persist the signature tip');

  await page.navigate(appUrl);
  await page.waitForText('1 / 273 tips banked');
  await page.waitForText('3,200 raw tokens banked');
  await page.waitForText('Sprout stage');
  await page.clickByText('Team of 20');
  await page.waitForText('160,000,000 scaled tokens saved');

  await page.clickByLabel('⌘K, open command palette');
  await page.typeInto('[aria-label="Search lessons, features, and token habits"]', 'agent sdk');
  await page.waitForText('Agent SDK: Claude Code as a library');
  await page.press('Escape');
  await page.waitFor(() => !document.querySelector('dialog[open]'));

  await page.clickByLabel('⌘K, open command palette');
  await page.typeInto('[aria-label="Search lessons, features, and token habits"]', 'How to prompt Claude Code effectively');
  await page.waitForText('How to prompt Claude Code effectively');
  const lockedPaletteState = await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll('dialog [aria-disabled="true"]')).find((element) =>
      element.textContent.includes('How to prompt Claude Code effectively'),
    );
    return {
      locked: Boolean(row),
      hasLink: Boolean(row?.querySelector('a[href]')),
      href: window.location.pathname,
    };
  });
  assert(lockedPaletteState.locked, 'locked palette result should be aria-disabled');
  assert(!lockedPaletteState.hasLink, 'locked palette result should not be a link');
  await page.press('Enter');
  await sleep(250);
  const afterLockedEnter = await page.evaluate(() => window.location.pathname);
  assert(afterLockedEnter === '/', 'Enter on a locked palette result should not navigate');
  await page.press('Escape');
  await page.waitFor(() => !document.querySelector('dialog[open]'));

  await page.clickByLabel('⌘K, open command palette');
  await page.typeInto('[aria-label="Search lessons, features, and token habits"]', 'Agent SDK: Claude Code as a library');
  await page.waitForText('Agent SDK: Claude Code as a library');
  await page.press('Enter');
  await page.waitFor(() => window.location.pathname === '/lessons/agent-sdk-overview');

  assertNoPageErrors(page);
  await page.close();
}

async function runMobileLayoutFlow(browser) {
  const page = await browser.open();
  await page.setViewport(390, 844, true);
  await page.setReducedMotion(true);
  await page.navigate(`${appUrl}${APP_ROUTE}`);
  await page.waitFor(() => Boolean(document.querySelector('#challenge-brief-heading')));

  const mobileState = await page.evaluate(() => {
    const region = document.querySelector('[aria-labelledby="challenge-brief-heading"]');
    const terminal = document.querySelector('#terminal-challenge-input');
    const regionBox = region?.getBoundingClientRect();
    const terminalBox = terminal?.getBoundingClientRect();
    return {
      heading: document.querySelector('#challenge-brief-heading')?.textContent,
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      cardWithinViewport: regionBox ? regionBox.left >= 0 && regionBox.right <= window.innerWidth : false,
      terminalWithinViewport: terminalBox ? terminalBox.left >= 0 && terminalBox.right <= window.innerWidth : false,
    };
  });

  assertIncludes(mobileState.heading, 'Your turn: find where auth errors are thrown', 'mobile challenge heading');
  assert(mobileState.noOverflow, 'mobile lesson has horizontal overflow');
  assert(mobileState.cardWithinViewport, 'challenge brief leaves mobile viewport');
  assert(mobileState.terminalWithinViewport, 'terminal input leaves mobile viewport');
  assertNoPageErrors(page);
  await page.close();
}

async function submitTerminalCommand(page, command) {
  await page.typeInto('#terminal-challenge-input', command);
  await page.click('form button[type="submit"]');
}

function assertNoPageErrors(page) {
  const errors = page.errors.filter((entry) => !isIgnorableWarning(entry));
  assert(errors.length === 0, `browser console/runtime errors:\n${errors.map((entry) => `- ${entry}`).join('\n')}`);
}

function isIgnorableWarning(entry) {
  return entry.includes('Download the React DevTools');
}

class Browser {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.nextId = 1;
  }

  async open() {
    const response = await fetch(`${this.baseUrl}/json/new`, { method: 'PUT' });
    if (!response.ok) throw new Error(`Chrome tab creation failed: ${response.status}`);
    const target = await response.json();
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new Page(socket, () => this.nextId++);
  }
}

class Page {
  constructor(socket, nextId) {
    this.socket = socket;
    this.nextId = nextId;
    this.pending = new Map();
    this.errors = [];

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
        return;
      }

      if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
        const text = message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
        this.errors.push(`${message.params.type}: ${text}`);
      }
      if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(`exception: ${message.params.exceptionDetails.text}`);
      }
      if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) {
        this.errors.push(`${message.params.entry.level}: ${message.params.entry.text}`);
      }
    });
  }

  async init() {
    await this.send('Runtime.enable');
    await this.send('Log.enable');
    await this.send('Page.enable');
  }

  send(method, params = {}) {
    const id = this.nextId();
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  async setViewport(width, height, mobile = false) {
    await this.init();
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  }

  async setReducedMotion(reduced) {
    await this.init();
    await this.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }],
    });
  }

  async navigate(url) {
    await this.init();
    await this.send('Page.navigate', { url });
    await this.waitFor(() => document.readyState === 'complete');
  }

  async evaluate(fn, ...args) {
    await this.init();
    const source = `(${fn.toString()})(...${JSON.stringify(args)})`;
    const result = await this.send('Runtime.evaluate', {
      expression: source,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async waitFor(fn, timeoutMs = 10000, ...args) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const passed = await this.evaluate(fn, ...args);
      if (passed) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${fn.toString()}`);
  }

  async waitForText(text, timeoutMs = 10000) {
    await this.waitFor((needle) => Array.from(document.body.querySelectorAll('*')).some((element) => {
      if (element instanceof HTMLScriptElement || element instanceof HTMLStyleElement) return false;
      if (element.children.length > 0) return false;
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.textContent.includes(needle);
    }), timeoutMs, text);
  }

  async waitForNoText(text, timeoutMs = 10000) {
    await this.waitFor((needle) => !Array.from(document.body.querySelectorAll('*')).some((element) => {
      if (element instanceof HTMLScriptElement || element instanceof HTMLStyleElement) return false;
      if (element.children.length > 0) return false;
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.textContent.includes(needle);
    }), timeoutMs, text);
  }

  async click(selector) {
    await this.evaluate((target) => {
      const element = document.querySelector(target);
      if (!element) throw new Error(`Missing selector: ${target}`);
      element.click();
    }, selector);
  }

  async clickByText(text) {
    await this.evaluate((needle) => {
      const element = Array.from(document.querySelectorAll('button, a')).find((candidate) =>
        candidate.textContent.includes(needle),
      );
      if (!element) throw new Error(`Missing clickable text: ${needle}`);
      element.click();
    }, text);
  }

  async clickByLabel(label) {
    await this.evaluate((needle) => {
      const element = Array.from(document.querySelectorAll('button, a, input')).find(
        (candidate) => candidate.getAttribute('aria-label') === needle,
      );
      if (!element) throw new Error(`Missing aria-label: ${needle}`);
      element.click();
    }, label);
  }

  async typeInto(selector, value) {
    await this.evaluate((target, nextValue) => {
      const element = document.querySelector(target);
      if (!(element instanceof HTMLInputElement)) throw new Error(`Missing input: ${target}`);
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (!valueSetter) throw new Error('Unable to find native input value setter');
      element.focus();
      valueSetter.call(element, nextValue);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, selector, value);
  }

  async press(key) {
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key });
  }

  async close() {
    this.socket.close();
  }
}

async function startChrome(port, profileDir) {
  const chromePath = findChromePath();
  return startProcess(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ], {
    ready: (line) => line.includes('DevTools listening on'),
  });
}

function findChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error('Could not find Chrome. Set CHROME_PATH to a Chromium-compatible browser binary.');
  }
  return found;
}

async function startProcess(command, args, { ready }) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  const waitForReady = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out starting ${command} ${args.join(' ')}`)), 30000);
    const onData = (chunk) => {
      const text = chunk.toString();
      output += text;
      if (ready(text) || ready(output)) {
        clearTimeout(timeout);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) reject(new Error(`${command} exited with ${code}\n${output}`));
    });
  });

  await waitForReady;
  return child;
}

async function waitForHttp(url) {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until the production server is ready.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) resolve(port);
        else reject(new Error('Unable to allocate a port'));
      });
    });
  });
}

async function cleanup() {
  for (const child of [serverProcess, chromeProcess]) {
    if (child && !child.killed) {
      child.kill('SIGTERM');
      await sleep(250);
      if (!child.killed) child.kill('SIGKILL');
    }
  }
  await rm(userDataDir, { recursive: true, force: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(value, expected, label) {
  assert(String(value ?? '').includes(expected), `${label} did not include "${expected}"`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(130);
});

try {
  await main();
} finally {
  await cleanup();
}
