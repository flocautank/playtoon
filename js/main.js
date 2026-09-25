// Onglets : un seul jeu actif à la fois, les autres sont mis en pause.
const G = window.GAMES || {};
const tabs = ['blocks', 'forge', 'bonk'];
let current = null;

function show(id) {
  if (!tabs.includes(id)) id = 'blocks';
  if (id === current) return;
  if (current && G[current]) G[current].hide();
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.id === 'tab-' + id));
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === id));
  current = id;
  if (G[id]) G[id].show();
  try { localStorage.setItem('arcade.tab', id); } catch (e) {}
}

window.addEventListener('hashchange', () => show(location.hash.slice(1)));
let start = location.hash.slice(1);
if (!tabs.includes(start)) { try { start = localStorage.getItem('arcade.tab') || 'blocks'; } catch (e) { start = 'blocks'; } }
show(start);
