/**
 * DeepSeek Harness Desktop - Main Process Entry Point
 *
 * This is the Electron main process that:
 * 1. Creates the BrowserWindow
 * 2. Boots the DSH web server via dsh --profile desktop
 * 3. Manages the application lifecycle
 */

import { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog, Notification } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, cpSync, rmSync } from 'fs';
// electron-updater is CommonJS; under ESM its named export is not statically
// analyzable, so import the default and destructure.
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;

// Capture otherwise-silent startup failures in packaged builds.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED_REJECTION:', reason);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

// ── DSH Path Configuration ───────────────────────────────────────────────────
// In dev, the dsh packages live in this app's own node_modules. In a packaged
// build the runtime is unpacked to app.asar.unpacked/node_modules (see
// asarUnpack in electron-builder.yml) as the seed source; the actual dsh kernel
// the app runs lives in an independent runtime dir under the Harness home so
// the shell (this app) and the kernel (dsh) can be upgraded separately.
const DSH_PACKAGE_PATH = isDev
  ? app.getAppPath()
  : join(process.resourcesPath, 'app.asar.unpacked');

// The bundled kernel (seed) shipped inside the app.
const DSH_SEED_BIN = join(DSH_PACKAGE_PATH, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');

// Runtime kernel home (independent of the app bundle, so it survives shell
// upgrades). Same layout as DSH_PACKAGE_PATH: node_modules at its root.
const DSH_HOME = () => (process.env.DSH_HOME || join(app.getPath('appData'), 'deepseek-harness'));
const DSH_RUNTIME_DIR = () => join(DSH_HOME(), 'runtime');
const DSH_RUNTIME_BIN = () => join(DSH_RUNTIME_DIR(), 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');

// The dsh binary the app actually boots. In dev it is the local node_modules;
// in a packaged build it is the (possibly upgraded) independent runtime dir.
const DSH_BIN = () => (isDev ? DSH_SEED_BIN : DSH_RUNTIME_BIN());

// dsh is a Node CLI — run it under a real Node, not the Electron GUI binary.
// In a packaged build the app is launched by Finder/Dock with a minimal PATH
// (`command -v node` usually fails), so we run the bundled Node shipped in
// resources/bin, falling back to Electron's own bundled Node (which behaves
// like upstream Node under ELECTRON_RUN_AS_NODE).
const bundledNode = app.isPackaged ? join(process.resourcesPath, 'bin', 'node') : null;
const NODE_BIN = process.env.DSH_NODE_BIN
  || (app.isPackaged
    ? (bundledNode && existsSync(bundledNode) ? bundledNode : process.execPath)
    : (() => { try { return execSync('command -v node').toString().trim() || 'node'; } catch { return 'node'; } })());

// When NODE_BIN is the Electron binary itself (the fallback above), it must be
// launched in Node mode, otherwise it boots a second copy of the app.
const runsAsBundledNode = NODE_BIN === process.execPath;

// ── State ────────────────────────────────────────────────────────────────────
let mainWindow = null;
let dshProcess = null;
let tray = null;
let dshHome = null;
let dshCwd = null;
let dshReady = false;
app.isQuitting = false;

// Auto-update state (shell = this app). Kernel version is tracked separately;
// shell upgrades come from the GitHub release feed via electron-updater.
let dshKernelVersion = null;
let updateState = {
  status: 'idle', // idle | checking | available | not-available | downloading | downloaded | error
  version: null,
  error: null,
  progress: null,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * In a packaged build the dsh kernel the app runs lives in an independent
 * runtime dir under the Harness home (so the shell and kernel upgrade apart).
 * The first launch seeds that dir from the bundled copy in
 * app.asar.unpacked; later launches reuse it — a newer kernel published by the
 * dsh project can be installed into the same dir independently of the shell.
 *
 * Returns the version of the dsh kernel that will be booted.
 */
function ensureDshRuntime() {
  if (isDev) return null;

  const seedBin = DSH_SEED_BIN;
  if (!existsSync(seedBin)) {
    throw new Error(`bundled dsh runtime not found: ${seedBin}`);
  }

  const runtimeBin = DSH_RUNTIME_BIN();
  if (!existsSync(runtimeBin)) {
    console.log('[dsh] seeding runtime kernel …');
    const seedModules = join(DSH_PACKAGE_PATH, 'node_modules');
    const runtimeModules = join(DSH_RUNTIME_DIR(), 'node_modules');
    mkdirSync(DSH_RUNTIME_DIR(), { recursive: true });
    // Copy the full bundled node_modules into the runtime dir. cpSync cannot
    // read from inside app.asar directly (opendir is not patched), but the
    // seed lives in app.asar.unpacked (real files), so a plain copy works.
    cpSync(seedModules, runtimeModules, { recursive: true });
    console.log('[dsh] runtime kernel seeded');
  }

  return readDshKernelVersion(runtimeBin);
}

/** Read the `version` field from the dsh package next to a bin.js path. */
function readDshKernelVersion(dshBinPath) {
  try {
    const pkgPath = join(dirname(dshBinPath), '..', 'package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  } catch {
    return null;
  }
}

// ── Shell Auto-Update ─────────────────────────────────────────────────────────

/**
 * The current update feed configuration, or null when the app is not packaged
 * (development runs have no release feed). electron-updater reads the publish
 * block from app-update.yml at runtime, so no explicit feed URL is needed.
 */
function updateFeedConfigured() {
  return app.isPackaged && process.platform !== 'linux';
}

/**
 * Push the current update state to the renderer (if a window is up) and to the
 * tray tooltip label. Call this after every state transition.
 */
function broadcastUpdateState() {
  const payload = { ...updateState };
  mainWindow?.webContents.send('update:state', payload);
}

function setUpdateState(patch) {
  updateState = { ...updateState, ...patch };
  broadcastUpdateState();
}

/**
 * Wire electron-updater for the shell (this app). autoDownload is off so the
 * user confirms before a large binary download; the renderer calls
 * update:download / update:install to drive the flow. Events are forwarded to
 * the renderer via the update:state channel.
 */
function setupAutoUpdater() {
  if (!updateFeedConfigured()) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdateState({ status: 'checking', version: null, error: null, progress: null });
  });

  autoUpdater.on('update-available', (info) => {
    setUpdateState({ status: 'available', version: info.version, progress: null });
  });

  autoUpdater.on('update-not-available', (info) => {
    setUpdateState({ status: 'not-available', version: info.version });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    setUpdateState({ status: 'downloading', progress: progressObj.percent });
  });

  autoUpdater.on('update-downloaded', (info) => {
    setUpdateState({ status: 'downloaded', version: info.version });
  });

  autoUpdater.on('error', (err) => {
    console.error('[update]', err);
    setUpdateState({ status: 'error', error: err.message || String(err) });
  });

  // Startup check (quiet): only log, the renderer learns via update:state.
  const kernelVersion = dshKernelVersion;
  console.log(`[update] shell=${app.getVersion()} kernel=${kernelVersion ?? 'n/a'} — checking for updates`);
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('[update] initial check failed:', err);
    setUpdateState({ status: 'error', error: err.message || String(err) });
  });
}

/**
 * Trigger a manual check for a shell update from the renderer or tray.
 * @returns a snapshot of the new state.
 */
async function checkForShellUpdate() {
  if (!updateFeedConfigured()) {
    setUpdateState({ status: 'error', error: '更新仅在安装版应用中可用' });
    return updateState;
  }
  setUpdateState({ status: 'checking', version: null, error: null, progress: null });
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('[update] check failed:', err);
    setUpdateState({ status: 'error', error: err.message || String(err) });
  }
  return updateState;
}

/** Download a previously announced shell update (user confirmed). */
async function downloadShellUpdate() {
  if (!updateFeedConfigured()) {
    setUpdateState({ status: 'error', error: '更新仅在安装版应用中可用' });
    return updateState;
  }
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    console.error('[update] download failed:', err);
    setUpdateState({ status: 'error', error: err.message || String(err) });
  }
  return updateState;
}

/** Apply a downloaded shell update and restart the app. */
function installShellUpdate() {
  if (!updateFeedConfigured()) return;
  if (updateState.status !== 'downloaded') return;
  app.isQuitting = true;
  autoUpdater.quitAndInstall();
}

/**
 * dsh only considers a profile to exist once its manifest
 * (profiles/<name>/package.json) is present. On a fresh install the app data
 * dir has nothing yet, so synthesize the manifest (and the profile file) from
 * the shipped template. dsh then resolves every bundle from the bundled
 * runtime, so this never needs the npm registry. Existing profiles are left
 * untouched.
 */
function ensureProfileTree(dshHome) {
  const profileName = 'desktop';
  const profileDir = join(dshHome, 'profiles', profileName);
  const manifestPath = join(profileDir, 'package.json');
  if (existsSync(manifestPath)) return;

  const templatePath = join(app.getAppPath(), 'profiles', profileName, 'dsh.profile');
  let bundles;
  let templateRaw;
  try {
    templateRaw = readFileSync(templatePath, 'utf8');
    bundles = JSON.parse(templateRaw).bundles;
  } catch {
    throw new Error(`profile template not found: ${templatePath}`);
  }
  if (!Array.isArray(bundles) || bundles.length === 0) {
    throw new Error(`profile template has no bundles: ${templatePath}`);
  }

  mkdirSync(profileDir, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({
    name: `dsh-profile-${profileName}`,
    private: true,
    dependencies: {},
    dsh: { profile: { bundles } },
  }, null, 2) + '\n');
  try {
    writeFileSync(join(profileDir, 'dsh.profile'), templateRaw);
  } catch {}
}

/**
 * Bootstrap the DSH profile as a child process.
 * We run `dsh --profile desktop` and capture the URL it prints.
 */
function bootstrapDsh(cwd) {
  return new Promise((resolve, reject) => {
    const args = ['--profile', 'desktop'];

    // Also pass any args after --
    const doubleDashIdx = process.argv.indexOf('--');
    if (doubleDashIdx !== -1) {
      args.push(...process.argv.slice(doubleDashIdx + 1));
    }

    const proc = spawn(NODE_BIN, [DSH_BIN(), ...args], {
      cwd,
      env: {
        ...process.env,
        ...(runsAsBundledNode ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
        DSH_HOME: DSH_HOME(),
        NODE_ENV: isDev ? 'development' : 'production',
      },
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let urlBuffer = '';
    let resolved = false;

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      if (!process.env.DSH_QUIET) console.log('[dsh]', text.trimEnd());
      urlBuffer += text;
      // DSH prints URL lines like: "dsh web: http://127.0.0.1:3080"
      const match = text.match(/dsh\s+(?:web|desktop):\s+(https?:\/\/[^\s]+)/);
      if (match) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ url: match[1], process: proc });
      }
    });

    proc.stderr.on('data', (chunk) => {
      console.error('[dsh]', chunk.toString());
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Timeout: if no URL after 8s, fall back to the default dev port before
    // giving up: some profiles disable URL printing (printUrl: false) while
    // still serving 3080.
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolve({ url: 'http://127.0.0.1:3080', process: proc });
      }
    }, 8000);
  });
}

// ── Window Management ────────────────────────────────────────────────────────

function createWindow(webUrl) {
  const preferences = loadWindowPreferences();

  mainWindow = new BrowserWindow({
    width: preferences.width ?? 1280,
    height: preferences.height ?? 800,
    x: preferences.x,
    y: preferences.y,
    minWidth: 800,
    minHeight: 600,
    transparent: true,
    title: 'DeepSeek Harness',
    icon: assetPath('icon.png'),
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Load the DSH web UI. The URL may not be up yet (dsh still booting in the
  // background); navigation failures are handled by the did-fail-load retry.
  mainWindow.loadURL(webUrl).catch(() => {});

  // Strip + raise overlay injected into the renderer. Defined at module level
  // so the periodic re-inject below can reference it; the SPA reloads during
  // backend boot retries and drops the injected script, so we re-inject on a
  // timer to keep the fix present at all times.
  const STRIP_SCRIPT = `
      (() => {
        if (document.getElementById('dsh-drag-strip')) return;
        const strip = document.createElement('div');
        strip.id = 'dsh-drag-strip';
        strip.style.cssText = 'position:fixed;top:0;left:0;right:0;height:38px;z-index:100;-webkit-app-region:drag;';
        document.body.appendChild(strip);

        // Raise style: any raised ancestor sits above the strip so click targets
        // inside stacking-context containers stay reachable regardless of how the
        // renderer structures them.
        const STYLE_ID = 'dsh-drag-strip-raise-style';
        if (!document.getElementById(STYLE_ID)) {
          const s = document.createElement('style');
          s.id = STYLE_ID;
          s.textContent = '.dsh-drag-raised { z-index: 200 !important; }' +
            // 面板 tab 栏：提到拖动条上层（右侧/底部面板折叠时 tab 栏在 strip
            // 区；面板本体 z-auto 不创建 stacking context，tabBar 提 z 即可越过
            // strip，无需抬整个面板）。
            '[class*="tabBar"] { position: relative !important; z-index: 200 !important; }' +
            // sessionLog/导出按钮：始终提到拖动条上层（视觉完整且可点）。
            '[class*="sessionLogButton"] { position: relative !important; z-index: 200 !important; }' +
            // 设置弹窗：始终在最顶层，避免被抬升容器（z:200）或其它浮层盖住。
            '[class*="settings"]:not([class*="Button"]):not([class*="button"]):not([class*="icon"]):not([class*="Icon"]):not([class*="trigger"]):not([class*="Trigger"]):not([class*="tab"]):not([class*="Tab"]) { z-index: 9999 !important; }' +
            // shl-session-history 滑轨：高于抬升容器（200）以保持可见，低于弹窗
            // （tooltip 401、modal 1000）以免盖住弹窗。
            '.shlrail_fixed { z-index: 201 !important; }' +
            '.shlrail_tooltip { z-index: 202 !important; }';
          document.head.appendChild(s);
        }

        // Broad interactive-element net: includes divs styled as tabs/buttons
        // that the previous narrow list missed.
        const INTERACTIVE = 'button, a, input, textarea, select, [role="button"], [tabindex], [contenteditable], [onclick], [onmousedown], [class*="tab"], [class*="btn"], [class*="Button"], [class*="icon"], [class*="crumb"], [class*="menu"], [class*="dropdown"], [class*="close"]';

        const update = () => {
          const sr = strip.getBoundingClientRect();
          const active = new Set();
          let nodes;
          try { nodes = document.querySelectorAll(INTERACTIVE); } catch { nodes = []; }
          for (const el of nodes) {
            try {
              const r = el.getBoundingClientRect();
              const overlaps = r.width > 0 && r.height > 0 &&
                r.top < sr.bottom && r.bottom > sr.top &&
                r.left < sr.right && r.right > sr.left &&
                r.top < innerHeight && r.bottom > 0;
              if (!overlaps) {
                if (el.dataset.dshRaised) {
                  el.style.removeProperty('z-index');
                  el.style.removeProperty('position');
                  delete el.dataset.dshRaised;
                }
                continue;
              }
            el.style.setProperty('-webkit-app-region', 'no-drag');
            // Raise the whole ancestor chain so the element escapes every
            // stacking context that could otherwise trap it below the strip.
            // Static ancestors are promoted to relative so z-index takes
            // effect; the chain runs all the way up so fixed containers nested
            // in an unpainted parent (e.g. a plugin sidebar panel) still clear
            // the strip. Ancestors already above the strip level keep their
            // natural stacking so overlays are not flattened.
            let raised = false;
            let target = null;
            let anc = el.parentElement;
            while (anc && anc !== document.body && anc !== document.documentElement) {
              if (anc.classList.contains('dsh-drag-raised')) {
                // An outer ancestor is already raised above the strip, so every
                // element inside it is reachable — keep it and stop. Checking
                // the computed z-index alone is not enough: the raise class
                // bumps it to 200, which would read as "already above the
                // strip" and get dropped on the next sweep.
                active.add(anc);
                raised = true;
                target = null;
                break;
              }
              const st = getComputedStyle(anc);
              const z = parseInt(st.zIndex, 10);
              if (st.position !== 'static' && !Number.isNaN(z) && z >= 100) {
                // An ancestor already sits at/above the strip level, so
                // everything inside it is above the strip. Raising further
                // would only cover unrelated siblings (e.g. the sidebar tabs)
                // for no benefit — stop here.
                raised = true;
                target = null;
                break;
              }
              if (Number.isNaN(z) || z < 200) {
                // Remember the outermost positioned ancestor still below the
                // strip level. Hoisting that single outer container lifts the
                // button out of every intermediate stacking context (fixed
                // panels, transparent wrappers) without re-ordering siblings
                // inside the panel.
                target = { el: anc, st };
              }
              anc = anc.parentElement;
            }
            if (!raised && target) {
              const t = target.el;
              if (target.st.position === 'static') {
                t.style.position = 'relative';
                t.dataset.dshStaticRaised = '1';
              }
              t.classList.add('dsh-drag-raised');
              active.add(t);
              raised = true;
            }
            // No raised ancestor: lift the element itself, keeping its own
            // position (fixed/absolute must not become relative or the layout
            // breaks); static elements are promoted to relative so z-index
            // takes effect.
            if (!raised) {
              const st = getComputedStyle(el);
              if (st.position === 'static') el.style.position = 'relative';
              el.style.zIndex = '200';
              el.dataset.dshRaised = '1';
            }
            } catch (e) {}
          }
          // Drop the raise class from ancestors that no longer need it.
          const raisedEls = document.querySelectorAll('.dsh-drag-raised');
          for (const el of raisedEls) {
            if (!active.has(el)) {
              el.classList.remove('dsh-drag-raised');
              if (el.dataset.dshStaticRaised) {
                el.style.removeProperty('position');
                delete el.dataset.dshStaticRaised;
              }
            }
          }
        };

        update();
        const schedule = () => {
          clearTimeout(update._t);
          update._t = setTimeout(update, 40);
        };
        new MutationObserver(schedule).observe(document.body, {
          childList: true, subtree: true, attributes: true,
          attributeFilter: ['class', 'style']
        });
        // Panel show/hide and window resizing are class/style changes (not node
        // insertions); listen to both so the raise logic reacts immediately.
        window.addEventListener('resize', schedule);
        // Periodic sweep: guarantees convergence even if the observer misses a
        // purely positional change.
        setInterval(update, 1000);
      })();
    `;

  // Apply the rounded-corner shell styling (the transparent window is only
  // rounded if the page itself clips its background to a radius).
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      html, body { border-radius: 36px; }
      html { overflow: hidden; }
    `);
    mainWindow.webContents.executeJavaScript(STRIP_SCRIPT).catch(() => {});
  });

  // Re-inject periodically: the SPA reloads during backend boot retries and
  // drops the injected script; keep the strip + raise logic always present so
  // the fix survives app restarts and renderer reloads.
  setInterval(() => {
    mainWindow.webContents.executeJavaScript(STRIP_SCRIPT).catch(() => {});
  }, 3000);

  // DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window events
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('resize', () => {
    saveWindowPreferences();
  });

  mainWindow.on('move', () => {
    saveWindowPreferences();
  });

  return mainWindow;
}

// ── Window Preferences Persistence ───────────────────────────────────────────

function loadWindowPreferences() {
  try {
    const prefsPath = join(app.getPath('userData'), 'window-preferences.json');
    if (existsSync(prefsPath)) {
      return JSON.parse(readFileSync(prefsPath, 'utf8'));
    }
  } catch {}
  return {};
}

function saveWindowPreferences() {
  if (!mainWindow) return;
  try {
    const bounds = mainWindow.getBounds();
    const prefs = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    };
    const prefsPath = join(app.getPath('userData'), 'window-preferences.json');
    mkdirSync(app.getPath('userData'), { recursive: true });
    writeFileSync(prefsPath, JSON.stringify(prefs));
  } catch {}
}

// ── Path helpers ─────────────────────────────────────────────────────────────

// When packaged, native APIs (Tray, Notification) cannot read files from inside
// app.asar. Assets listed in `asarUnpack` land in `app.asar.unpacked/`, so the
// asset paths must point there when packaged.
function assetPath(...segments) {
  const base = app.isPackaged
    ? process.resourcesPath
    : join(__dirname, '..', '..', 'assets');
  return join(base, ...segments);
}

// ── Tray ─────────────────────────────────────────────────────────────────────

function createTray() {
  const iconPath = assetPath('icon.png');

  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 DeepSeek Harness',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: '新建会话',
      click: () => {
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: '检查更新…',
      click: () => {
        checkForShellUpdate();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('DeepSeek Harness');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return tray;
}

// ── Plugin Management (via IPC) ──────────────────────────────────────────────

/**
 * Read the current desktop profile manifest and project its installed plugins.
 * The profile's package.json lives at $DSH_HOME/profiles/desktop/package.json
 * and carries both the layer stack (dsh.profile.bundles) and the pnpm-managed
 * dependencies. `dsh plugin` reconciles the two, so the bundles list is the
 * authoritative "installed and active" roster.
 */
function listProfilePlugins(home) {
  const manifestPath = join(home, 'profiles', 'desktop', 'package.json');
  try {
    if (!existsSync(manifestPath)) return { bundles: [], dependencies: {} };
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return {
      bundles: Array.isArray(manifest.dsh?.profile?.bundles) ? manifest.dsh.profile.bundles : [],
      dependencies: manifest.dependencies ?? {},
    };
  } catch {
    return { bundles: [], dependencies: {} };
  }
}

/**
 * Return the environment the dsh plugin child should run with. In dev the
 * launcher's PATH already has pnpm, so process.env is fine as-is. In a
 * packaged build the app is launched by Finder/Dock with a minimal PATH that
 * usually lacks pnpm; `dsh plugin` (a thin pnpm forwarder) then fails with
 * "pnpm not found on PATH". Probe the well-known install locations and prepend
 * any directory that actually contains a pnpm binary.
 * @returns {Promise<{ env: NodeJS.ProcessEnv, found: boolean }>}
 */
async function resolvePnpmEnv() {
  if (!app.isPackaged) return { env: process.env, found: true };

  const home = app.getPath('home');
  const binDirs = [];
  const addDir = (p) => {
    try {
      if (p && existsSync(p) && existsSync(join(p, 'pnpm'))) binDirs.push(p);
    } catch {
      // ignore unreadable candidates
    }
  };
  addDir(process.env.PNPM_HOME);
  addDir(join(home, 'Library', 'pnpm'));
  addDir(join(home, '.local', 'share', 'pnpm'));
  addDir(join(home, '.npm-global', 'bin'));
  addDir('/opt/homebrew/bin');
  addDir('/usr/local/bin');
  try {
    const base = join(home, '.nvm', 'versions', 'node');
    for (const version of readdirSync(base)) {
      const bin = join(base, version, 'bin');
      if (existsSync(join(bin, 'pnpm'))) binDirs.push(bin);
    }
  } catch {
    // nvm absent — fine
  }
  if (binDirs.length === 0) return { env: process.env, found: false };
  return {
    env: { ...process.env, PATH: `${binDirs.join(':')}:${process.env.PATH ?? ''}` },
    found: true,
  };
}

/**
 * Run one `dsh plugin --profile desktop <args>` invocation as a child process.
 * Reuses the same NODE_BIN/DSH_BIN/DSH_HOME plumbing as bootstrapDsh so a
 * packaged build works without pnpm on the launcher PATH beyond dsh's own
 * requirement (pnpm must still be resolvable by the child).
 * @param args - pnpm arguments forwarded verbatim (e.g. ['add', spec]).
 * @returns resolved { ok, code, output } with stdout+stderr captured.
 */
async function runDshPlugin(args) {
  const { env, found } = await resolvePnpmEnv();
  if (!found) {
    return {
      ok: false,
      code: 127,
      output: 'dsh: pnpm not found — install pnpm or set $PNPM_HOME so the desktop app can manage profile plugins',
    };
  }
  return new Promise((resolve) => {
    const proc = spawn(NODE_BIN, [DSH_BIN(), 'plugin', '--profile', 'desktop', ...args], {
      cwd: dshCwd,
      env: {
        ...env,
        ...(runsAsBundledNode ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
        DSH_HOME: dshHome,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { output += chunk.toString(); });
    proc.on('error', (err) => resolve({ ok: false, code: -1, output: String(err) }));
    proc.on('close', (code) => resolve({ ok: code === 0, code, output }));
  });
}

/**
 * Parse the package names pnpm refused to build out of an install's stderr
 * ("[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: node-pty@1.1.0, ...").
 * The trailing "@version" is stripped so scoped names survive untouched.
 * @param output - captured stdout+stderr of a failed dsh plugin add.
 * @returns the plain package names whose build scripts were ignored.
 */
function parseIgnoredBuilds(output) {
  const match = /Ignored build scripts:\s*([^\n]+)/.exec(output);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim().replace(/@[^@\s]+$/, ''))
    .filter(Boolean);
}

/**
 * Append items to a `key` list inside a small YAML file (pnpm-workspace.yaml),
 * creating the file / key when missing. Only handles the flat `key:\n  - x`
 * shape pnpm uses; other content is preserved.
 * @param file - absolute path of the YAML file.
 * @param key - the list key, e.g. "onlyBuiltDependencies".
 * @param additions - item strings to ensure are present.
 * @returns true when the file changed.
 */
function appendYamlListItems(file, key, additions) {
  if (additions.length === 0) return false;
  const content = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const lines = content.split('\n');
  const keyLine = lines.findIndex((line) => new RegExp(`^${key}:\\s*$`).test(line));

  if (keyLine === -1) {
    const suffix = content && !content.endsWith('\n') ? '\n' : '';
    writeFileSync(file, `${content}${suffix}${key}:\n${additions.map((a) => `  - ${a}\n`).join('')}`);
    return true;
  }

  let end = keyLine + 1;
  while (end < lines.length && /^\s+-\s+\S/.test(lines[end])) end += 1;
  const present = new Set(lines.slice(keyLine + 1, end).map((l) => l.trim().replace(/^-\s*/, '')));
  const fresh = additions.filter((a) => !present.has(a));
  if (fresh.length === 0) return false;
  lines.splice(end, 0, ...fresh.map((a) => `  - ${a}`));
  writeFileSync(file, `${lines.join('\n')}\n`);
  return true;
}

/**
 * Restart the dsh child process so profile changes (new/removed bundles) take
 * effect, then point the window at the fresh URL. Called after a successful
 * plugin install/remove; the renderer reloads as part of loadURL.
 */
function restartDsh() {
  return new Promise((resolve, reject) => {
    const boot = () => bootstrapDsh(dshCwd).then(({ url, process: proc }) => {
      dshProcess = proc;
      dshReady = true;
      if (mainWindow) {
        mainWindow.loadURL(url).catch(() => {});
      }
      resolve();
    }, reject);

    if (dshProcess) {
      const old = dshProcess;
      old.once('exit', boot);
      old.kill('SIGTERM');
    } else {
      boot();
    }
  });
}

// ── Native Dialogs (via IPC) ─────────────────────────────────────────────────

function setupIpcHandlers() {
  // Open directory picker
  ipcMain.handle('desktop:open-directory-picker', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择工作目录',
    });
    return result.filePaths[0];
  });

  // Open file picker
  ipcMain.handle('desktop:open-file-picker', async (_event, filters) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: '选择文件',
      filters,
    });
    return result.filePaths[0];
  });

  // Save file picker
  ipcMain.handle('desktop:save-file-picker', async (_event, defaultPath, filters) => {
    const result = await dialog.showSaveDialog({
      title: '保存文件',
      defaultPath,
      filters,
    });
    return result.filePath;
  });

  // Show notification
  ipcMain.handle('desktop:show-notification', async (_event, options) => {
    const { title, body, icon } = options;
    const notif = new Notification({ title, body, icon });
    notif.show();
  });

  // Open external URL
  ipcMain.handle('desktop:open-external', async (_event, url) => {
    return shell.openExternal(url);
  });

  // Get app version
  ipcMain.handle('desktop:get-version', () => {
    return app.getVersion();
  });

  // ── Auto-Update (shell) ────────────────────────────────────────────────────

  // Current update state snapshot (rendered by the settings page).
  ipcMain.handle('update:get-state', () => {
    return {
      ...updateState,
      shellVersion: app.getVersion(),
      kernelVersion: dshKernelVersion,
      configured: updateFeedConfigured(),
    };
  });

  // Manual "check for updates" from the renderer or tray.
  ipcMain.handle('update:check', async () => checkForShellUpdate());

  // User confirmed the announced update — start downloading it.
  ipcMain.handle('update:download', async () => downloadShellUpdate());

  // User confirmed the download — apply and restart.
  ipcMain.handle('update:install', () => {
    installShellUpdate();
    return updateState;
  });

  // Get platform info
  ipcMain.handle('desktop:get-platform-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
    };
  });

  // Window control
  ipcMain.on('desktop:window-minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('desktop:window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('desktop:window-close', () => {
    mainWindow?.close();
  });

  // ── Plugin Manager ──────────────────────────────────────────────────────────

  // Read the installed plugin roster from the desktop profile manifest.
  ipcMain.handle('desktop:plugin-manager-list', () => listProfilePlugins(dshHome));

  // Install a plugin from an npm spec (package name, path, or tarball). On
  // success the dsh process restarts automatically to activate the new bundle.
  ipcMain.handle('desktop:plugin-manager-install', async (_event, spec) => {
    const value = typeof spec === 'string' ? spec.trim() : '';
    if (!value) return { ok: false, code: -1, output: 'empty install spec' };
    // Arguments reach the child as an argv array (no shell on non-Windows), so
    // a leading dash cannot become a flag; reject it defensively anyway.
    if (value.startsWith('-')) return { ok: false, code: -1, output: 'invalid spec (leading dash)' };

    // pnpm >= 10 refuses to run dependency build scripts by default and, when
    // it had to ignore some, fails the install with ERR_PNPM_IGNORED_BUILDS.
    // That is "pnpm approve-builds" in one step: parse the ignored names,
    // allowlist them in the profile's pnpm-workspace.yaml, and retry until the
    // install actually succeeds (the packages themselves are already fetched).
    const profileDir = join(dshHome, 'profiles', 'desktop');
    let result = await runDshPlugin(['add', value]);
    let attempts = 0;
    while (!result.ok && result.output.includes('ERR_PNPM_IGNORED_BUILDS') && attempts < 3) {
      const approved = appendYamlListItems(
        join(profileDir, 'pnpm-workspace.yaml'),
        'onlyBuiltDependencies',
        parseIgnoredBuilds(result.output),
      );
      if (!approved) break;
      attempts += 1;
      result = await runDshPlugin(['add', value]);
    }

    if (result.ok) {
      try {
        await restartDsh();
      } catch (err) {
        return { ...result, output: `${result.output}\n[restart failed] ${String(err)}` };
      }
    }
    return result;
  });

  // Remove a plugin by package name, then restart dsh to deactivate it.
  ipcMain.handle('desktop:plugin-manager-remove', async (_event, name) => {
    const value = typeof name === 'string' ? name.trim() : '';
    if (!value) return { ok: false, code: -1, output: 'empty plugin name' };
    if (value.startsWith('-')) return { ok: false, code: -1, output: 'invalid name (leading dash)' };
    const result = await runDshPlugin(['remove', value]);
    if (result.ok) {
      try {
        await restartDsh();
      } catch (err) {
        return { ...result, output: `${result.output}\n[restart failed] ${String(err)}` };
      }
    }
    return result;
  });
}

// ── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Set up IPC handlers
  setupIpcHandlers();

  // Enforce a single instance before creating any window.
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Show the window immediately and boot DSH in the background. Waiting for
  // dsh to print its URL (or the 8s timeout fallback) would delay the window
  // for seconds, so the window loads 3080 directly and reloads once dsh is up.
  createWindow('http://127.0.0.1:3080');
  createTray();

  // In a packaged build the profile tree (profiles/, storages/, settings.yaml)
  // lives under the app data dir, so dsh must run with that as its working
  // directory to locate the `desktop` profile. In dev, run from the app dir.
  dshHome = DSH_HOME();
  dshCwd = isDev ? (process.cwd() || app.getPath('home')) : dshHome;

  // Retry the initial navigation while dsh is still booting (port 3080 not up).
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, _desc, _url, isMainFrame) => {
    if (!isMainFrame || dshReady || errorCode !== -102) return;
    setTimeout(() => {
      mainWindow?.loadURL('http://127.0.0.1:3080').catch(() => {});
    }, 500);
  });

  try {
    dshKernelVersion = ensureDshRuntime();
    ensureProfileTree(dshHome);
    const { url, process: dshProc } = await bootstrapDsh(dshCwd);
    dshProcess = dshProc;
    dshReady = true;

    // Startup update check (quiet; renderer learns via update:state).
    setupAutoUpdater();

    // Point the window at the resolved URL unless it already loaded it.
    if (mainWindow) {
      const current = mainWindow.webContents.getURL();
      if (!current.startsWith(url)) {
        mainWindow.loadURL(url).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Failed to boot DSH:', err);
    dialog.showErrorBox('无法启动 DeepSeek Harness', err instanceof Error ? err.message : String(err));
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Closing the window only hides it (see the `close` handler in
  // createWindow), so restoring it keeps the app state — no rebuild needed.
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else if (dshProcess) {
    // Defensive: the window was actually destroyed while the app kept
    // running — recreate it pointing at the already-running dsh server.
    createWindow(`http://127.0.0.1:3080`);
    createTray();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (dshProcess) {
    dshProcess.kill('SIGTERM');
  }
});

// ── Exports for testing ──────────────────────────────────────────────────────
export { createWindow, bootstrapDsh };
