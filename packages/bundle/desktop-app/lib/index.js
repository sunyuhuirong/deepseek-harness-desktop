/**
 * @deepseek-ai/dsh-bundle-desktop — desktop profile bundle entry point.
 *
 * This module exists primarily as a package.json + cordis.patch.yml bundle.
 * The patch file is what gets applied; this JS export is kept for compatibility
 * with the bundle loading contract.
 *
 * No runtime glue is needed here because the desktop shell (Electron main process)
 * handles window management, native dialogs, and tray separately from DSH.
 */

const name = 'dsh-bundle-desktop';

export { name };
