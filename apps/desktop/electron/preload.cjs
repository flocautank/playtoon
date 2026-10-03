// Seul pont entre le jeu et Electron : plein écran et « Quitter » (rien d'autre n'est exposé à la page).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ptDesktop', {
  fullscreen: v => ipcRenderer.invoke('pt:fullscreen', v),
  isFullscreen: () => ipcRenderer.invoke('pt:isFullscreen'),
  quit: () => ipcRenderer.send('pt:quit'),
  platform: process.platform,
});
