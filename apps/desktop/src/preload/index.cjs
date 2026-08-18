/**
 * DeepSeek Harness Desktop - Preload Script
 *
 * Exposes a limited API to the renderer process via window.dsh.desktop
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dsh', {
  desktop: {
    // ── File Dialogs ────────────────────────────────────────────────────────
    openDirectoryPicker: () =>
      ipcRenderer.invoke('desktop:open-directory-picker'),

    openFilePicker: (filters) =>
      ipcRenderer.invoke('desktop:open-file-picker', filters),

    saveFilePicker: (defaultPath, filters) =>
      ipcRenderer.invoke('desktop:save-file-picker', defaultPath, filters),

    // ── Notifications ───────────────────────────────────────────────────────
    showNotification: (options) =>
      ipcRenderer.invoke('desktop:show-notification', options),

    // ── External Links ──────────────────────────────────────────────────────
    openExternal: (url) =>
      ipcRenderer.invoke('desktop:open-external', url),

    // ── App Info ────────────────────────────────────────────────────────────
    getVersion: () =>
      ipcRenderer.invoke('desktop:get-version'),

    getPlatformInfo: () =>
      ipcRenderer.invoke('desktop:get-platform-info'),

    // ── Window Control ──────────────────────────────────────────────────────
    minimize: () => ipcRenderer.send('desktop:window-minimize'),
    maximize: () => ipcRenderer.send('desktop:window-maximize'),
    close: () => ipcRenderer.send('desktop:window-close'),

    // ── Native Menu State (for client-side UI) ──────────────────────────────
    isMac: () => process.platform === 'darwin',

    // ── IPC Channel listeners (for events from main process) ────────────────
    on: (channel, callback) => {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },

    once: (channel, callback) => {
      ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    },

    // ── Send to main process ────────────────────────────────────────────────
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
  },
});

// Safety check
console.log('[dsh-desktop] Preload script loaded successfully');
