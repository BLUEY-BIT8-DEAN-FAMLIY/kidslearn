// Electron entry point – starts the Express server in-process and opens a window.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

const SERVER_PORT = 3001;

function getResourcePath(rel) {
  // In a packaged app, files live under resources/app; in dev they're at repo root
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', rel);
  }
  return path.join(__dirname, '..', rel);
}

function startServer() {
  const serverFile = getResourcePath('server/index.js');
  // Writable data dir (history, config, review) – outside the read-only asar
  const userDataDir = path.join(app.getPath('userData'), 'data');
  // Use Node bundled with Electron via fork-style spawn of the same exe
  serverProcess = spawn(process.execPath, [serverFile], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(SERVER_PORT),
      KIDSLEARN_DATA_DIR: userDataDir,
    },
    stdio: 'pipe',
  });
  serverProcess.stdout?.on('data', d => console.log('[server]', d.toString().trim()));
  serverProcess.stderr?.on('data', d => console.error('[server]', d.toString().trim()));
  serverProcess.on('exit', code => console.log('[server] exited with code', code));
}

function waitForServer(retries = 30) {
  return new Promise(resolve => {
    const http = require('http');
    const tryOnce = (n) => {
      const req = http.get(`http://localhost:${SERVER_PORT}/`, () => {
        resolve(true);
      });
      req.on('error', () => {
        if (n <= 0) return resolve(false);
        setTimeout(() => tryOnce(n - 1), 200);
      });
      req.setTimeout(500, () => req.destroy());
    };
    tryOnce(retries);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'KidsLearn',
    icon: getResourcePath('kidslearn.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Hide the menu bar completely
  Menu.setApplicationMenu(null);

  await waitForServer();
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}/`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try { serverProcess.kill(); } catch {}
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    try { serverProcess.kill(); } catch {}
  }
});
