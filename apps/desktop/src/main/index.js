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
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

// ── DSH Path Configuration ───────────────────────────────────────────────────
// In dev, the dsh packages live in this app's own node_modules. In a packaged
// build the runtime is unpacked to app.asar.unpacked/node_modules (see
// asarUnpack in electron-builder.yml) so the plain-Node child can read it
// directly, with no runtime extraction to the app data dir.
const DSH_PACKAGE_PATH = isDev
  ? app.getAppPath()
  : join(process.resourcesPath, 'app.asar.unpacked');

const DSH_BIN = join(DSH_PACKAGE_PATH, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * In a packaged build the dsh runtime ships unpacked under
 * Contents/Resources/app.asar.unpacked (see asarUnpack in electron-builder.yml),
 * so nothing needs to be extracted — just verify it is bundled before booting.
 */
function ensureDshRuntime() {
  if (isDev) return;

  const binPath = join(DSH_PACKAGE_PATH, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');
  if (!existsSync(binPath)) {
    throw new Error(`dsh runtime not bundled: ${binPath}`);
  }
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

    const proc = spawn(NODE_BIN, [DSH_BIN, ...args], {
      cwd,
      env: {
        ...process.env,
        ...(runsAsBundledNode ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
        DSH_HOME: process.env.DSH_HOME || join(app.getPath('appData'), 'deepseek-harness'),
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

  // Apply the rounded-corner shell styling (the transparent window is only
  // rounded if the page itself clips its background to a radius).
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      html, body { border-radius: 36px; }
      html { overflow: hidden; }
    `);
    // Make the window draggable: a transparent drag strip across the top,
    // while interactive elements inside that strip stay clickable. Only
    // elements that overlap the strip are raised above it; everything else
    // keeps its natural stacking so overlays like the settings panel are not
    // covered.
    mainWindow.webContents.executeJavaScript(`
      (() => {
        if (document.getElementById('dsh-drag-strip')) return;
        const strip = document.createElement('div');
        strip.id = 'dsh-drag-strip';
        strip.style.cssText = 'position:fixed;top:0;left:0;right:0;height:38px;z-index:100;-webkit-app-region:drag;';
        document.body.appendChild(strip);

        const update = () => {
          const sr = strip.getBoundingClientRect();
          for (const el of document.querySelectorAll('button, a, input, textarea, select, [role="button"]')) {
            const r = el.getBoundingClientRect();
            const overlaps = r.top < sr.bottom && r.bottom > sr.top && r.left < sr.right && r.right > sr.left && r.width > 0;
            if (overlaps) {
              el.style.setProperty('-webkit-app-region', 'no-drag');
              el.style.position = 'relative';
              el.style.zIndex = '200';
            } else if (el.style.zIndex === '200') {
              el.style.removeProperty('-webkit-app-region');
              el.style.position = '';
              el.style.zIndex = '';
            }
          }
        };
        update();
        new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
      })();
    `).catch(() => {});
  });

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
    const proc = spawn(NODE_BIN, [DSH_BIN, 'plugin', '--profile', 'desktop', ...args], {
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
  dshHome = process.env.DSH_HOME || join(app.getPath('appData'), 'deepseek-harness');
  dshCwd = isDev ? (process.cwd() || app.getPath('home')) : dshHome;

  // Retry the initial navigation while dsh is still booting (port 3080 not up).
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, _desc, _url, isMainFrame) => {
    if (!isMainFrame || dshReady || errorCode !== -102) return;
    setTimeout(() => {
      mainWindow?.loadURL('http://127.0.0.1:3080').catch(() => {});
    }, 500);
  });

  try {
    ensureDshRuntime();
    ensureProfileTree(dshHome);
    const { url, process: dshProc } = await bootstrapDsh(dshCwd);
    dshProcess = dshProc;
    dshReady = true;

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
