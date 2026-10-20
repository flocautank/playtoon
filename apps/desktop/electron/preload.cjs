// Seul pont entre le jeu et Electron : plein écran, « Quitter » et, pour les jeux qui en ont (argument --pt-scores),
// les classements Steam (rien d'autre n'est exposé à la page).
const { contextBridge, ipcRenderer } = require('electron');
const scores = process.argv.includes('--pt-scores') ? {
  status: () => ipcRenderer.invoke('pt:lb-status'),
  submit: (board, score, day) => ipcRenderer.invoke('pt:lb-submit', board, score, day),
  entries: board => ipcRenderer.invoke('pt:lb-entries', board),
} : undefined;
contextBridge.exposeInMainWorld('ptDesktop', {
  fullscreen: v => ipcRenderer.invoke('pt:fullscreen', v),
  isFullscreen: () => ipcRenderer.invoke('pt:isFullscreen'),
  quit: () => ipcRenderer.send('pt:quit'),
  platform: process.platform,
  ...(scores ? { scores } : {}),
});
