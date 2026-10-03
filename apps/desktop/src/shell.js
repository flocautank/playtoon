// Coquille de la version PC (Electron) : l'interface commune (réglages, plein écran, Quitter) + pause quand la
// fenêtre perd le focus (Synth Horde se met en pause, les autres arrêtent simplement de dessiner).
import { initShellUI } from '../../shared/shell-ui.js';

export function initDesktop(opts) {
  document.body.classList.add('pt-desktop');
  const { G } = initShellUI(opts);
  let hidden = false;
  window.addEventListener('blur', () => { if (!hidden) { hidden = true; G.hide(); } });
  window.addEventListener('focus', () => { if (hidden) { hidden = false; G.show(); } });
  // Échap ferme d'abord une fenêtre de la coquille (réglages, confirmation)
  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = ['pt-modal', 'bq-settings'].map(id => document.getElementById(id)).find(o => o && !o.classList.contains('hidden'));
    if (open) { e.stopImmediatePropagation(); (open.querySelector('#pt-cancel, #bq-close')).click(); }
  }, true);
}
