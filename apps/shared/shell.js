// Coquille des applications MOBILES de Playtoon : l'interface commune (shell-ui.js) + bouton retour Android,
// pause / reprise, barre d'état, écran de démarrage, initialisation de la monétisation.
import { initShellUI } from './shell-ui.js';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// opts : ceux de initShellUI (shell-ui.js), plus onBack?: () => bool et statusColor
export async function initShell(opts) {
  const { G, mon } = initShellUI(opts);
  // bouton retour Android : le jeu d'abord (pause, fermer un menu), puis la fenêtre ouverte, sinon arrière-plan
  App.addListener('backButton', () => {
    if (opts.onBack && opts.onBack()) return;
    const open = [...document.querySelectorAll('.overlay:not(.hidden)')].pop();
    if (open) { const c = open.querySelector('#pt-cancel, #bq-close, [data-back]'); if (c) { c.click(); return; } }
    App.minimizeApp();
  });
  App.addListener('pause', () => G.hide());
  App.addListener('resume', () => G.show());

  try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: opts.statusColor || '#120f2a' }); } catch (e) {}
  try { await SplashScreen.hide(); } catch (e) {}
  await mon.init();
}
