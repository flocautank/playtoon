// Version PC (Steam) d'un jeu Playtoon : une fenêtre Electron qui sert le jeu depuis app://game/ (protocole
// privilégié : modules ES et localStorage fonctionnent comme sur le web, sans serveur ni accès réseau).
const { app, BrowserWindow, protocol, net, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const GAME = require('./game.json');

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
// Overlay Steam (Maj+Tab) sous Windows : Electron doit dessiner dans le processus principal
if (process.platform === 'win32') { app.commandLine.appendSwitch('in-process-gpu'); app.commandLine.appendSwitch('disable-direct-composition'); }
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');   // musique et sons dès le lancement
// WebGL partout : GPU utilisé même si son pilote est sur liste noire de Chromium, et rendu logiciel (SwiftShader) en
// dernier recours — sinon Synth Horde refuserait de démarrer sur ces PC (et ce serait un remboursement Steam).
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
Menu.setApplicationMenu(null);
if (!app.requestSingleInstanceLock()) app.quit();

const WWW = path.join(__dirname, 'www');
const stateFile = () => path.join(app.getPath('userData'), 'window.json');
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch (e) { return {}; } };
let win;

function createWindow() {
  const st = readState();
  win = new BrowserWindow({
    width: st.width || GAME.width, height: st.height || GAME.height, x: st.x, y: st.y,
    minWidth: 800, minHeight: 600, backgroundColor: GAME.bg, title: GAME.title, show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'), fullscreen: !!st.fullscreen,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, devTools: !app.isPackaged, spellcheck: false },
  });
  win.loadURL('app://game/index.html');
  win.once('ready-to-show', () => win.show());
  // liens externes (politique de confidentialité…) dans le navigateur, jamais dans la fenêtre du jeu
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });
  // F11 ou Alt+Entrée : plein écran
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.on('close', () => {
    const b = win.getNormalBounds();
    try { fs.writeFileSync(stateFile(), JSON.stringify({ ...b, fullscreen: win.isFullScreen() })); } catch (e) {}
  });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  protocol.handle('app', req => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '');
    const file = path.normalize(path.join(WWW, rel || 'index.html'));
    if (!file.startsWith(WWW + path.sep)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  ipcMain.handle('pt:fullscreen', (e, v) => { win.setFullScreen(v === undefined ? !win.isFullScreen() : !!v); return win.isFullScreen(); });
  ipcMain.handle('pt:isFullscreen', () => win.isFullScreen());
  ipcMain.on('pt:quit', () => app.quit());
  createWindow();
});
app.on('window-all-closed', () => app.quit());
