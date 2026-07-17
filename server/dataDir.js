import path from 'path';

// Resolve the writable data directory, shared by storage.js and auth.js.
//
// Priority:
//  1. KIDSLEARN_DATA_DIR — set explicitly by the Electron app to its
//     userData/data folder.
//  2. The Electron desktop app's userData location for this OS. This is the
//     key fix: a plain `node server/index.js` (dev server) now reads the SAME
//     store as the installed app instead of a separate, empty `server/data`.
//     Otherwise opening the app two different ways shows two different (and one
//     empty) data sets — which looks exactly like "my data was deleted".
//  3. Fallback: the bundled server/data (CI, or when no HOME/APPDATA exists).
//
// The path in (2) mirrors Electron's app.getPath('userData') with productName
// "KidsLearn": %APPDATA%\KidsLearn on Windows, ~/Library/Application Support/
// KidsLearn on macOS, ~/.config/KidsLearn on Linux.
export function resolveDataDir(bundledDir) {
  if (process.env.KIDSLEARN_DATA_DIR) return process.env.KIDSLEARN_DATA_DIR;
  const APP = 'KidsLearn';
  if (process.platform === 'win32' && process.env.APPDATA)
    return path.join(process.env.APPDATA, APP, 'data');
  if (process.platform === 'darwin' && process.env.HOME)
    return path.join(process.env.HOME, 'Library', 'Application Support', APP, 'data');
  if (process.env.HOME)
    return path.join(process.env.HOME, '.config', APP, 'data');
  return bundledDir;
}
