// Electron entry point – starts the Express server as a child process and
// opens a window pointing at it. Designed to work both in dev and packaged.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Ensure the Hebrew voice can autoplay without a user gesture (kids' app).
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let serverProcess;
let serverLog = '';

const SERVER_PORT = 3001;

// Resolve a bundled file robustly across dev and packaged (asar on/off) layouts.
function getResourcePath(rel) {
  const candidates = [
    path.join(process.resourcesPath || '', 'app', rel),         // packaged, asar:false -> resources/app/...
    path.join(__dirname, '..', rel),                            // dev, and packaged asar:false (__dirname=resources/app/electron)
    path.join(process.resourcesPath || '', 'app.asar', rel),    // packaged, asar:true
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return candidates[0];
}

function startServer() {
  const serverFile = getResourcePath('server/index.js');
  const userDataDir = path.join(app.getPath('userData'), 'data');
  serverLog += `[main] starting server: ${serverFile}\n`;
  serverLog += `[main] data dir: ${userDataDir}\n`;

  serverProcess = spawn(process.execPath, [serverFile], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(SERVER_PORT),
      KIDSLEARN_DATA_DIR: userDataDir,
    },
    stdio: 'pipe',
  });
  serverProcess.stdout?.on('data', d => { const s = d.toString(); serverLog += '[server] ' + s; console.log('[server]', s.trim()); });
  serverProcess.stderr?.on('data', d => { const s = d.toString(); serverLog += '[server:err] ' + s; console.error('[server]', s.trim()); });
  serverProcess.on('error', err => { serverLog += '[server:spawn-error] ' + err.message + '\n'; });
  serverProcess.on('exit', code => { serverLog += `[server] exited with code ${code}\n`; console.log('[server] exited', code); });
}

function waitForServer(retries = 50) {
  return new Promise(resolve => {
    const http = require('http');
    const tryOnce = (n) => {
      const req = http.get(`http://localhost:${SERVER_PORT}/`, () => resolve(true));
      req.on('error', () => {
        if (n <= 0) return resolve(false);
        setTimeout(() => tryOnce(n - 1), 200);
      });
      req.setTimeout(500, () => req.destroy());
    };
    tryOnce(retries);
  });
}

function loadingHtml() {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
    <html dir="rtl"><body style="font-family:Arial;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;height:100vh;margin:0;display:flex;align-items:center;justify-content:center;flex-direction:column">
      <div style="font-size:64px">⭐</div>
      <h2>KidsLearn נטען...</h2>
      <p style="opacity:.8">מתחיל את השרת</p>
    </body></html>`)}`;
}

function errorHtml() {
  const log = serverLog.replace(/</g, '&lt;');
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
    <html dir="rtl"><body style="font-family:Arial;padding:30px;background:#fff5f5;color:#333">
      <h2 style="color:#c62828">⚠️ KidsLearn לא הצליח להתחיל את השרת</h2>
      <p>אנא צלמו את המסך הזה ושלחו לתמיכה. פרטים טכניים:</p>
      <pre style="background:#1e1e2e;color:#a6e3a1;padding:16px;border-radius:8px;direction:ltr;text-align:left;white-space:pre-wrap;font-size:12px;max-height:60vh;overflow:auto">${log}</pre>
      <button onclick="location.reload()" style="padding:12px 24px;font-size:16px;border:none;border-radius:8px;background:#5c6bc0;color:#fff;cursor:pointer">נסה שוב</button>
    </body></html>`)}`;
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
      // Let the Hebrew voice read aloud automatically (no user gesture needed)
      autoplayPolicy: 'no-user-gesture-required',
    },
  });
  Menu.setApplicationMenu(null);

  // Show a loading screen immediately so the window is never blank.
  mainWindow.loadURL(loadingHtml());

  const ok = await waitForServer();
  if (ok) {
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}/`);
  } else {
    mainWindow.loadURL(errorHtml());
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Single-instance lock: if KidsLearn is already running, focus it instead of
// launching a second copy (a second server would fail to bind the port).
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    startServer();
    createWindow();
  });
}

app.on('window-all-closed', () => {
  if (serverProcess) { try { serverProcess.kill(); } catch {} }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) { try { serverProcess.kill(); } catch {} }
});
