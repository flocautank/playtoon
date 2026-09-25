// Traductions : anglais par défaut, langue de l'appareil détectée, choix mémorisé (playtoon.lang).
// Une valeur est soit un texte avec des {variables}, soit une fonction (pluriels, accords).
// Dans le HTML : data-i18n="clé" (texte), data-i18n-html="clé" (HTML), data-i18n-title="clé" (infobulle).

export const LANGS = [['en', 'English'], ['fr', 'Français'], ['es', 'Español'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português']];
const KEY = 'playtoon.lang';
const s = (n, one, many) => (n === 1 ? one : many);

const DICT = {
  en: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modes', 'bp.modesTip': 'Game modes: Adventure, daily challenge, Time Attack',
    'bp.score': 'SCORE', 'bp.best': 'BEST', 'bp.restartTip': 'Restart', 'bp.themesTip': 'Themes',
    'bp.hammerTip': 'Hammer: smash one cell', 'bp.bombTip': 'Bomb: clear a 3×3 square', 'bp.shuffleTip': 'Shuffle: three new pieces',
    'bp.praise': ['', 'Nice!', 'Great!', 'Awesome!', 'Amazing!', 'LEGENDARY!'],
    'bp.combo': 'Combo ×{n}', 'bp.allClear': 'ALL CLEAR! +300',
    'bp.th.classic': 'Classic', 'bp.th.neon': 'Neon', 'bp.th.pastel': 'Pastel', 'bp.th.pixel': 'Pixel', 'bp.th.gold': 'Gold & Obsidian',
    'bp.equipped': '✓ equipped', 'bp.equip': 'Equip',
    'bp.level': 'Level {n}', 'bp.getGems': 'Collect {n} 💎', 'bp.clearLines': v => `Clear ${v.n} ${s(v.n, 'line', 'lines')}`,
    'bp.levelWon': 'Level {n} cleared!', 'bp.failClose': 'So close!', 'bp.fail': 'Level failed',
    'bp.resWin': 'Used {used} of {total} moves · 🪙 {coins} total', 'bp.noMoves': 'Out of moves.', 'bp.noRoom': 'No room left for the pieces.',
    'bp.daily': '🎯 Daily challenge', 'bp.dailySub': '{date} · streak {n}', 'bp.dailyBest': ' · best {n}', 'bp.dailyStreak': ' · streak {n}',
    'bp.chrono': '⏱ Time Attack!', 'bp.chronoSub': '2 minutes, every line gives time back',
    'bp.mapLines': 'lines',
    'bp.newPieces': 'New pieces!', 'bp.newPiecesSub': 'free once per level', 'bp.newPiecesChrono': 'New pieces',
    'bp.overTitle': 'No more room!', 'bp.timeUp': '⏱ Time’s up!', 'bp.finalScore': 'Score:',
    'bp.bestChrono': '🏆 Best time attack!', 'bp.rank': v => `Ranked #${v.n} in your top 10`, 'bp.outTop': 'Not in your top 10', 'bp.noPoints': 'No points: not ranked',
    'bp.dailyEnd': v => `🎯 Challenge of ${v.date} — today’s best: ${v.best} · streak: ${v.n} ${s(v.n, 'day', 'days')}`,
    'bp.newRecord': '🏆 New record!', 'bp.record': 'Record: {n}',
    'bp.hudLevel': 'LEVEL {n} · MOVES', 'bp.hudDaily': '🎯 DAILY', 'bp.hudGoal': 'GOAL', 'bp.hudDailyBest': 'TODAY’S BEST', 'bp.hudTime': '⏱ TIME', 'bp.hudScoreRec': 'SCORE · RECORD {n}',
    'bp.tuto': 'Drag a piece onto the grid',
    'bp.cRestartLevel': 'Restart level {n}?', 'bp.cRestart': 'Restart', 'bp.cChrono': 'Restart Time Attack? The current score will be lost.', 'bp.cChronoOk': 'Restart',
    'bp.cNewGame': 'Start a new game? The current score will be lost.',
    'bp.pickCell': 'Pick a cell', 'bp.pickCellSub': 'to smash', 'bp.plus3': '+3 moves', 'bp.lastChance': 'last chance!',
    'bp.contBooster': '🔨 Continue with a booster', 'bp.again': 'Play again', 'bp.modesBtn': '🗺️ Modes',
    'bp.adventure': 'Adventure', 'bp.advHelp': 'Free the 💎 by clearing the lines that hold them, or clear the required number of lines, before you run out of moves. The fewer moves you use, the more stars you earn.',
    'bp.scrollHint': '↕ 40 levels: scroll the map', 'bp.dailyBtn': '🎯 Daily challenge', 'bp.chronoBtn': '⏱ Time Attack 2 min', 'bp.chronoBtnSub': '+1.5 s per line cleared',
    'bp.classic': 'Classic game (endless)', 'close': 'Close',
    'bp.themes': 'Themes', 'bp.themesHelp': 'Unlock block styles with your coins 🪙 (earned by clearing lines and winning stars).',
    'bp.more': '+3 moves · 🪙 25', 'bp.cont': '🔨 Continue', 'bp.next': 'Next', 'bp.retry': 'Retry', 'bp.map': 'Map', 'bp.cleared': 'Level cleared!',
    'ok': 'Continue', 'cancel': 'Cancel', 'language': 'Language',
    // application mobile
    'app.settings': 'Settings', 'app.sound': 'Sound effects', 'app.removeAds': 'Remove ads', 'app.removeAdsDesc': 'One-time purchase. No more ads between levels; bonus videos stay optional.',
    'app.adsRemoved': '✓ Ads removed — thank you!', 'app.restore': 'Restore purchases', 'app.privacy': 'Privacy options', 'app.policy': 'Privacy policy',
    'app.watchMoves': '▶ Watch a video: +3 moves', 'app.watchCont': '▶ Watch a video: free hammer', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': '{n} left today',
    'app.adFail': 'No video available right now — try again later.', 'app.thanks': 'Thanks for your support!', 'app.buyFail': 'Purchase not completed.', 'app.restored': 'Purchases restored.', 'app.nothing': 'No purchase to restore.',
    'app.coinsGot': '+{n} coins', 'app.version': 'Version {v}',
  },
  fr: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modes', 'bp.modesTip': 'Modes de jeu : Aventure, défi du jour, Chrono',
    'bp.score': 'SCORE', 'bp.best': 'MEILLEUR', 'bp.restartTip': 'Recommencer', 'bp.themesTip': 'Thèmes',
    'bp.hammerTip': 'Marteau : casse une case', 'bp.bombTip': 'Bombe : efface un carré 3×3', 'bp.shuffleTip': 'Mélange : trois nouvelles pièces',
    'bp.praise': ['', 'Bien !', 'Super !', 'Génial !', 'Incroyable !', 'LÉGENDAIRE !'],
    'bp.combo': 'Combo ×{n}', 'bp.allClear': 'TABLE RASE ! +300',
    'bp.th.classic': 'Classique', 'bp.th.neon': 'Néon', 'bp.th.pastel': 'Pastel', 'bp.th.pixel': 'Pixel', 'bp.th.gold': 'Or & Obsidienne',
    'bp.equipped': '✓ équipé', 'bp.equip': 'Équiper',
    'bp.level': 'Niveau {n}', 'bp.getGems': 'Récupère {n} 💎', 'bp.clearLines': v => `Efface ${v.n} ${s(v.n, 'ligne', 'lignes')}`,
    'bp.levelWon': 'Niveau {n} réussi !', 'bp.failClose': 'Raté… presque !', 'bp.fail': 'Raté !',
    'bp.resWin': '{used} coups utilisés sur {total} · 🪙 total {coins}', 'bp.noMoves': 'Plus de coups.', 'bp.noRoom': 'Plus de place pour les pièces.',
    'bp.daily': '🎯 Défi du jour', 'bp.dailySub': '{date} · série {n}', 'bp.dailyBest': ' · meilleur {n}', 'bp.dailyStreak': ' · série {n}',
    'bp.chrono': '⏱ Chrono !', 'bp.chronoSub': '2 minutes, chaque ligne rend du temps',
    'bp.mapLines': 'lignes',
    'bp.newPieces': 'Nouvelles pièces !', 'bp.newPiecesSub': 'offertes une fois par niveau', 'bp.newPiecesChrono': 'Nouvelles pièces',
    'bp.overTitle': 'Plus de place !', 'bp.timeUp': '⏱ Temps écoulé !', 'bp.finalScore': 'Score :',
    'bp.bestChrono': '🏆 Meilleur chrono !', 'bp.rank': v => `Classé ${v.n}ᵉ de ton top 10`, 'bp.outTop': 'Hors du top 10', 'bp.noPoints': 'Aucun point : pas de classement',
    'bp.dailyEnd': v => `🎯 Défi du ${v.date} — meilleur du jour : ${v.best} · série : ${v.n} ${s(v.n, 'jour', 'jours')}`,
    'bp.newRecord': '🏆 Nouveau record !', 'bp.record': 'Record : {n}',
    'bp.hudLevel': 'NIV. {n} · COUPS', 'bp.hudDaily': '🎯 DÉFI DU JOUR', 'bp.hudGoal': 'OBJECTIF', 'bp.hudDailyBest': 'RECORD DU JOUR', 'bp.hudTime': '⏱ TEMPS', 'bp.hudScoreRec': 'SCORE · RECORD {n}',
    'bp.tuto': 'Glisse une pièce sur la grille',
    'bp.cRestartLevel': 'Recommencer le niveau {n} ?', 'bp.cRestart': 'Recommencer', 'bp.cChrono': 'Relancer le Chrono ? Le score en cours sera perdu.', 'bp.cChronoOk': 'Relancer',
    'bp.cNewGame': 'Recommencer une nouvelle partie ? Le score en cours sera perdu.',
    'bp.pickCell': 'Choisis une case', 'bp.pickCellSub': 'à casser', 'bp.plus3': '+3 coups', 'bp.lastChance': 'dernière chance !',
    'bp.contBooster': '🔨 Continuer avec un booster', 'bp.again': 'Rejouer', 'bp.modesBtn': '🗺️ Modes',
    'bp.adventure': 'Aventure', 'bp.advHelp': 'Récupère les 💎 en effaçant les lignes qui les contiennent, ou efface le nombre de lignes demandé, avant la fin des coups. Moins tu utilises de coups, plus tu gagnes d’étoiles.',
    'bp.scrollHint': '↕ 40 niveaux : fais défiler la carte', 'bp.dailyBtn': '🎯 Défi du jour', 'bp.chronoBtn': '⏱ Chrono 2 min', 'bp.chronoBtnSub': '+1,5 s par ligne effacée',
    'bp.classic': 'Partie classique (sans fin)', 'close': 'Fermer',
    'bp.themes': 'Thèmes', 'bp.themesHelp': 'Débloque des styles de blocs avec tes pièces 🪙 (gagnées en effaçant des lignes et en décrochant des étoiles).',
    'bp.more': '+3 coups · 🪙 25', 'bp.cont': '🔨 Continuer', 'bp.next': 'Suivant', 'bp.retry': 'Réessayer', 'bp.map': 'Carte', 'bp.cleared': 'Niveau réussi !',
    'ok': 'Continuer', 'cancel': 'Annuler', 'language': 'Langue',
    'app.settings': 'Réglages', 'app.sound': 'Effets sonores', 'app.removeAds': 'Supprimer les pubs', 'app.removeAdsDesc': 'Achat unique. Plus de pubs entre les niveaux ; les vidéos bonus restent facultatives.',
    'app.adsRemoved': '✓ Pubs supprimées — merci !', 'app.restore': 'Restaurer les achats', 'app.privacy': 'Options de confidentialité', 'app.policy': 'Politique de confidentialité',
    'app.watchMoves': '▶ Regarder une vidéo : +3 coups', 'app.watchCont': '▶ Regarder une vidéo : marteau offert', 'app.watchCoins': '▶ Vidéo : +{n} 🪙', 'app.videoLeft': 'encore {n} aujourd’hui',
    'app.adFail': 'Aucune vidéo disponible pour l’instant — réessaie plus tard.', 'app.thanks': 'Merci pour ton soutien !', 'app.buyFail': 'Achat non finalisé.', 'app.restored': 'Achats restaurés.', 'app.nothing': 'Aucun achat à restaurer.',
    'app.coinsGot': '+{n} pièces', 'app.version': 'Version {v}',
  },
  es: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modos', 'bp.modesTip': 'Modos de juego: Aventura, reto diario, Contrarreloj',
    'bp.score': 'PUNTOS', 'bp.best': 'MEJOR', 'bp.restartTip': 'Reiniciar', 'bp.themesTip': 'Temas',
    'bp.hammerTip': 'Martillo: rompe una casilla', 'bp.bombTip': 'Bomba: borra un cuadrado de 3×3', 'bp.shuffleTip': 'Mezcla: tres piezas nuevas',
    'bp.praise': ['', '¡Bien!', '¡Genial!', '¡Increíble!', '¡Asombroso!', '¡LEGENDARIO!'],
    'bp.combo': 'Combo ×{n}', 'bp.allClear': '¡TABLERO LIMPIO! +300',
    'bp.th.classic': 'Clásico', 'bp.th.neon': 'Neón', 'bp.th.pastel': 'Pastel', 'bp.th.pixel': 'Píxel', 'bp.th.gold': 'Oro y obsidiana',
    'bp.equipped': '✓ equipado', 'bp.equip': 'Equipar',
    'bp.level': 'Nivel {n}', 'bp.getGems': 'Consigue {n} 💎', 'bp.clearLines': v => `Borra ${v.n} ${s(v.n, 'línea', 'líneas')}`,
    'bp.levelWon': '¡Nivel {n} superado!', 'bp.failClose': '¡Casi!', 'bp.fail': 'Nivel fallido',
    'bp.resWin': '{used} de {total} movimientos · 🪙 {coins} en total', 'bp.noMoves': 'Sin movimientos.', 'bp.noRoom': 'No queda sitio para las piezas.',
    'bp.daily': '🎯 Reto diario', 'bp.dailySub': '{date} · racha {n}', 'bp.dailyBest': ' · mejor {n}', 'bp.dailyStreak': ' · racha {n}',
    'bp.chrono': '⏱ ¡Contrarreloj!', 'bp.chronoSub': '2 minutos, cada línea devuelve tiempo',
    'bp.mapLines': 'líneas',
    'bp.newPieces': '¡Piezas nuevas!', 'bp.newPiecesSub': 'gratis una vez por nivel', 'bp.newPiecesChrono': 'Piezas nuevas',
    'bp.overTitle': '¡No queda sitio!', 'bp.timeUp': '⏱ ¡Se acabó el tiempo!', 'bp.finalScore': 'Puntos:',
    'bp.bestChrono': '🏆 ¡Mejor contrarreloj!', 'bp.rank': v => `Puesto ${v.n} de tu top 10`, 'bp.outTop': 'Fuera de tu top 10', 'bp.noPoints': 'Sin puntos: sin clasificación',
    'bp.dailyEnd': v => `🎯 Reto del ${v.date} — mejor de hoy: ${v.best} · racha: ${v.n} ${s(v.n, 'día', 'días')}`,
    'bp.newRecord': '🏆 ¡Nuevo récord!', 'bp.record': 'Récord: {n}',
    'bp.hudLevel': 'NIVEL {n} · MOV.', 'bp.hudDaily': '🎯 RETO DIARIO', 'bp.hudGoal': 'OBJETIVO', 'bp.hudDailyBest': 'MEJOR DE HOY', 'bp.hudTime': '⏱ TIEMPO', 'bp.hudScoreRec': 'PUNTOS · RÉCORD {n}',
    'bp.tuto': 'Arrastra una pieza al tablero',
    'bp.cRestartLevel': '¿Reiniciar el nivel {n}?', 'bp.cRestart': 'Reiniciar', 'bp.cChrono': '¿Reiniciar la contrarreloj? Perderás la puntuación actual.', 'bp.cChronoOk': 'Reiniciar',
    'bp.cNewGame': '¿Empezar una partida nueva? Perderás la puntuación actual.',
    'bp.pickCell': 'Elige una casilla', 'bp.pickCellSub': 'para romper', 'bp.plus3': '+3 movimientos', 'bp.lastChance': '¡última oportunidad!',
    'bp.contBooster': '🔨 Continuar con un potenciador', 'bp.again': 'Jugar otra vez', 'bp.modesBtn': '🗺️ Modos',
    'bp.adventure': 'Aventura', 'bp.advHelp': 'Libera los 💎 borrando las líneas que los contienen, o borra las líneas pedidas, antes de quedarte sin movimientos. Cuantos menos uses, más estrellas ganas.',
    'bp.scrollHint': '↕ 40 niveles: desplaza el mapa', 'bp.dailyBtn': '🎯 Reto diario', 'bp.chronoBtn': '⏱ Contrarreloj 2 min', 'bp.chronoBtnSub': '+1,5 s por línea borrada',
    'bp.classic': 'Partida clásica (sin fin)', 'close': 'Cerrar',
    'bp.themes': 'Temas', 'bp.themesHelp': 'Desbloquea estilos de bloques con tus monedas 🪙 (se ganan borrando líneas y consiguiendo estrellas).',
    'bp.more': '+3 movimientos · 🪙 25', 'bp.cont': '🔨 Continuar', 'bp.next': 'Siguiente', 'bp.retry': 'Reintentar', 'bp.map': 'Mapa', 'bp.cleared': '¡Nivel superado!',
    'ok': 'Continuar', 'cancel': 'Cancelar', 'language': 'Idioma',
    'app.settings': 'Ajustes', 'app.sound': 'Efectos de sonido', 'app.removeAds': 'Quitar anuncios', 'app.removeAdsDesc': 'Compra única. Sin anuncios entre niveles; los vídeos de bonificación siguen siendo opcionales.',
    'app.adsRemoved': '✓ Anuncios eliminados — ¡gracias!', 'app.restore': 'Restaurar compras', 'app.privacy': 'Opciones de privacidad', 'app.policy': 'Política de privacidad',
    'app.watchMoves': '▶ Ver un vídeo: +3 movimientos', 'app.watchCont': '▶ Ver un vídeo: martillo gratis', 'app.watchCoins': '▶ Vídeo: +{n} 🪙', 'app.videoLeft': 'quedan {n} hoy',
    'app.adFail': 'No hay vídeos disponibles ahora — inténtalo más tarde.', 'app.thanks': '¡Gracias por tu apoyo!', 'app.buyFail': 'Compra no completada.', 'app.restored': 'Compras restauradas.', 'app.nothing': 'No hay compras que restaurar.',
    'app.coinsGot': '+{n} monedas', 'app.version': 'Versión {v}',
  },
  de: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modi', 'bp.modesTip': 'Spielmodi: Abenteuer, Tagesaufgabe, Zeitrennen',
    'bp.score': 'PUNKTE', 'bp.best': 'BESTE', 'bp.restartTip': 'Neu starten', 'bp.themesTip': 'Designs',
    'bp.hammerTip': 'Hammer: zerschlägt ein Feld', 'bp.bombTip': 'Bombe: räumt ein 3×3-Quadrat', 'bp.shuffleTip': 'Mischen: drei neue Teile',
    'bp.praise': ['', 'Gut!', 'Super!', 'Klasse!', 'Unglaublich!', 'LEGENDÄR!'],
    'bp.combo': 'Kombo ×{n}', 'bp.allClear': 'ALLES LEER! +300',
    'bp.th.classic': 'Klassisch', 'bp.th.neon': 'Neon', 'bp.th.pastel': 'Pastell', 'bp.th.pixel': 'Pixel', 'bp.th.gold': 'Gold & Obsidian',
    'bp.equipped': '✓ ausgewählt', 'bp.equip': 'Auswählen',
    'bp.level': 'Level {n}', 'bp.getGems': 'Sammle {n} 💎', 'bp.clearLines': v => `Räume ${v.n} ${s(v.n, 'Reihe', 'Reihen')}`,
    'bp.levelWon': 'Level {n} geschafft!', 'bp.failClose': 'Knapp daneben!', 'bp.fail': 'Level verloren',
    'bp.resWin': '{used} von {total} Zügen · 🪙 {coins} insgesamt', 'bp.noMoves': 'Keine Züge mehr.', 'bp.noRoom': 'Kein Platz mehr für die Teile.',
    'bp.daily': '🎯 Tagesaufgabe', 'bp.dailySub': '{date} · Serie {n}', 'bp.dailyBest': ' · Bestwert {n}', 'bp.dailyStreak': ' · Serie {n}',
    'bp.chrono': '⏱ Zeitrennen!', 'bp.chronoSub': '2 Minuten, jede Reihe bringt Zeit zurück',
    'bp.mapLines': 'Reihen',
    'bp.newPieces': 'Neue Teile!', 'bp.newPiecesSub': 'einmal pro Level gratis', 'bp.newPiecesChrono': 'Neue Teile',
    'bp.overTitle': 'Kein Platz mehr!', 'bp.timeUp': '⏱ Zeit abgelaufen!', 'bp.finalScore': 'Punkte:',
    'bp.bestChrono': '🏆 Bestes Zeitrennen!', 'bp.rank': v => `Platz ${v.n} in deinen Top 10`, 'bp.outTop': 'Nicht in deinen Top 10', 'bp.noPoints': 'Keine Punkte: keine Wertung',
    'bp.dailyEnd': v => `🎯 Aufgabe vom ${v.date} — Tagesbestwert: ${v.best} · Serie: ${v.n} ${s(v.n, 'Tag', 'Tage')}`,
    'bp.newRecord': '🏆 Neuer Rekord!', 'bp.record': 'Rekord: {n}',
    'bp.hudLevel': 'LEVEL {n} · ZÜGE', 'bp.hudDaily': '🎯 TAGESAUFGABE', 'bp.hudGoal': 'ZIEL', 'bp.hudDailyBest': 'TAGESBESTWERT', 'bp.hudTime': '⏱ ZEIT', 'bp.hudScoreRec': 'PUNKTE · REKORD {n}',
    'bp.tuto': 'Zieh ein Teil auf das Spielfeld',
    'bp.cRestartLevel': 'Level {n} neu starten?', 'bp.cRestart': 'Neu starten', 'bp.cChrono': 'Zeitrennen neu starten? Die aktuellen Punkte gehen verloren.', 'bp.cChronoOk': 'Neu starten',
    'bp.cNewGame': 'Neues Spiel beginnen? Die aktuellen Punkte gehen verloren.',
    'bp.pickCell': 'Wähle ein Feld', 'bp.pickCellSub': 'zum Zerschlagen', 'bp.plus3': '+3 Züge', 'bp.lastChance': 'letzte Chance!',
    'bp.contBooster': '🔨 Mit einem Booster weiterspielen', 'bp.again': 'Nochmal', 'bp.modesBtn': '🗺️ Modi',
    'bp.adventure': 'Abenteuer', 'bp.advHelp': 'Befreie die 💎, indem du ihre Reihen räumst, oder räume die geforderte Anzahl Reihen, bevor die Züge ausgehen. Je weniger Züge, desto mehr Sterne.',
    'bp.scrollHint': '↕ 40 Level: Karte scrollen', 'bp.dailyBtn': '🎯 Tagesaufgabe', 'bp.chronoBtn': '⏱ Zeitrennen 2 Min.', 'bp.chronoBtnSub': '+1,5 s pro geräumter Reihe',
    'bp.classic': 'Klassisches Spiel (endlos)', 'close': 'Schließen',
    'bp.themes': 'Designs', 'bp.themesHelp': 'Schalte Block-Designs mit deinen Münzen 🪙 frei (verdient durch geräumte Reihen und Sterne).',
    'bp.more': '+3 Züge · 🪙 25', 'bp.cont': '🔨 Weiter', 'bp.next': 'Weiter', 'bp.retry': 'Nochmal', 'bp.map': 'Karte', 'bp.cleared': 'Level geschafft!',
    'ok': 'Weiter', 'cancel': 'Abbrechen', 'language': 'Sprache',
    'app.settings': 'Einstellungen', 'app.sound': 'Soundeffekte', 'app.removeAds': 'Werbung entfernen', 'app.removeAdsDesc': 'Einmaliger Kauf. Keine Werbung mehr zwischen den Levels; Bonus-Videos bleiben freiwillig.',
    'app.adsRemoved': '✓ Werbung entfernt — danke!', 'app.restore': 'Käufe wiederherstellen', 'app.privacy': 'Datenschutzoptionen', 'app.policy': 'Datenschutzerklärung',
    'app.watchMoves': '▶ Video ansehen: +3 Züge', 'app.watchCont': '▶ Video ansehen: Gratis-Hammer', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': 'heute noch {n}',
    'app.adFail': 'Gerade kein Video verfügbar — versuche es später.', 'app.thanks': 'Danke für deine Unterstützung!', 'app.buyFail': 'Kauf nicht abgeschlossen.', 'app.restored': 'Käufe wiederhergestellt.', 'app.nothing': 'Keine Käufe zum Wiederherstellen.',
    'app.coinsGot': '+{n} Münzen', 'app.version': 'Version {v}',
  },
  it: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modalità', 'bp.modesTip': 'Modalità di gioco: Avventura, sfida del giorno, A tempo',
    'bp.score': 'PUNTI', 'bp.best': 'RECORD', 'bp.restartTip': 'Ricomincia', 'bp.themesTip': 'Temi',
    'bp.hammerTip': 'Martello: rompe una casella', 'bp.bombTip': 'Bomba: libera un quadrato 3×3', 'bp.shuffleTip': 'Mescola: tre pezzi nuovi',
    'bp.praise': ['', 'Bene!', 'Ottimo!', 'Fantastico!', 'Incredibile!', 'LEGGENDARIO!'],
    'bp.combo': 'Combo ×{n}', 'bp.allClear': 'TUTTO LIBERO! +300',
    'bp.th.classic': 'Classico', 'bp.th.neon': 'Neon', 'bp.th.pastel': 'Pastello', 'bp.th.pixel': 'Pixel', 'bp.th.gold': 'Oro e ossidiana',
    'bp.equipped': '✓ in uso', 'bp.equip': 'Usa',
    'bp.level': 'Livello {n}', 'bp.getGems': 'Raccogli {n} 💎', 'bp.clearLines': v => `Completa ${v.n} ${s(v.n, 'linea', 'linee')}`,
    'bp.levelWon': 'Livello {n} superato!', 'bp.failClose': 'Per un soffio!', 'bp.fail': 'Livello fallito',
    'bp.resWin': '{used} mosse su {total} · 🪙 {coins} in totale', 'bp.noMoves': 'Mosse finite.', 'bp.noRoom': 'Non c’è più spazio per i pezzi.',
    'bp.daily': '🎯 Sfida del giorno', 'bp.dailySub': '{date} · serie {n}', 'bp.dailyBest': ' · record {n}', 'bp.dailyStreak': ' · serie {n}',
    'bp.chrono': '⏱ A tempo!', 'bp.chronoSub': '2 minuti, ogni linea restituisce tempo',
    'bp.mapLines': 'linee',
    'bp.newPieces': 'Pezzi nuovi!', 'bp.newPiecesSub': 'gratis una volta per livello', 'bp.newPiecesChrono': 'Pezzi nuovi',
    'bp.overTitle': 'Niente più spazio!', 'bp.timeUp': '⏱ Tempo scaduto!', 'bp.finalScore': 'Punti:',
    'bp.bestChrono': '🏆 Miglior partita a tempo!', 'bp.rank': v => `${v.n}º nella tua top 10`, 'bp.outTop': 'Fuori dalla tua top 10', 'bp.noPoints': 'Nessun punto: nessuna classifica',
    'bp.dailyEnd': v => `🎯 Sfida del ${v.date} — record di oggi: ${v.best} · serie: ${v.n} ${s(v.n, 'giorno', 'giorni')}`,
    'bp.newRecord': '🏆 Nuovo record!', 'bp.record': 'Record: {n}',
    'bp.hudLevel': 'LIV. {n} · MOSSE', 'bp.hudDaily': '🎯 SFIDA DEL GIORNO', 'bp.hudGoal': 'OBIETTIVO', 'bp.hudDailyBest': 'RECORD DI OGGI', 'bp.hudTime': '⏱ TEMPO', 'bp.hudScoreRec': 'PUNTI · RECORD {n}',
    'bp.tuto': 'Trascina un pezzo sulla griglia',
    'bp.cRestartLevel': 'Ricominciare il livello {n}?', 'bp.cRestart': 'Ricomincia', 'bp.cChrono': 'Ricominciare la partita a tempo? Il punteggio attuale andrà perso.', 'bp.cChronoOk': 'Ricomincia',
    'bp.cNewGame': 'Iniziare una nuova partita? Il punteggio attuale andrà perso.',
    'bp.pickCell': 'Scegli una casella', 'bp.pickCellSub': 'da rompere', 'bp.plus3': '+3 mosse', 'bp.lastChance': 'ultima possibilità!',
    'bp.contBooster': '🔨 Continua con un potenziamento', 'bp.again': 'Gioca ancora', 'bp.modesBtn': '🗺️ Modalità',
    'bp.adventure': 'Avventura', 'bp.advHelp': 'Libera i 💎 completando le linee che li contengono, o completa le linee richieste, prima di finire le mosse. Meno mosse usi, più stelle guadagni.',
    'bp.scrollHint': '↕ 40 livelli: scorri la mappa', 'bp.dailyBtn': '🎯 Sfida del giorno', 'bp.chronoBtn': '⏱ A tempo 2 min', 'bp.chronoBtnSub': '+1,5 s per linea completata',
    'bp.classic': 'Partita classica (infinita)', 'close': 'Chiudi',
    'bp.themes': 'Temi', 'bp.themesHelp': 'Sblocca stili di blocchi con le tue monete 🪙 (guadagnate completando linee e ottenendo stelle).',
    'bp.more': '+3 mosse · 🪙 25', 'bp.cont': '🔨 Continua', 'bp.next': 'Avanti', 'bp.retry': 'Riprova', 'bp.map': 'Mappa', 'bp.cleared': 'Livello superato!',
    'ok': 'Continua', 'cancel': 'Annulla', 'language': 'Lingua',
    'app.settings': 'Impostazioni', 'app.sound': 'Effetti sonori', 'app.removeAds': 'Rimuovi pubblicità', 'app.removeAdsDesc': 'Acquisto una tantum. Niente più pubblicità tra i livelli; i video bonus restano facoltativi.',
    'app.adsRemoved': '✓ Pubblicità rimossa — grazie!', 'app.restore': 'Ripristina acquisti', 'app.privacy': 'Opzioni privacy', 'app.policy': 'Informativa sulla privacy',
    'app.watchMoves': '▶ Guarda un video: +3 mosse', 'app.watchCont': '▶ Guarda un video: martello gratis', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': 'ancora {n} oggi',
    'app.adFail': 'Nessun video disponibile ora — riprova più tardi.', 'app.thanks': 'Grazie per il tuo supporto!', 'app.buyFail': 'Acquisto non completato.', 'app.restored': 'Acquisti ripristinati.', 'app.nothing': 'Nessun acquisto da ripristinare.',
    'app.coinsGot': '+{n} monete', 'app.version': 'Versione {v}',
  },
  pt: {
    'bp.name': 'Block Quarry',
    'bp.modes': 'Modos', 'bp.modesTip': 'Modos de jogo: Aventura, desafio diário, Contra o tempo',
    'bp.score': 'PONTOS', 'bp.best': 'RECORDE', 'bp.restartTip': 'Recomeçar', 'bp.themesTip': 'Temas',
    'bp.hammerTip': 'Martelo: quebra uma casa', 'bp.bombTip': 'Bomba: limpa um quadrado 3×3', 'bp.shuffleTip': 'Embaralhar: três peças novas',
    'bp.praise': ['', 'Boa!', 'Ótimo!', 'Incrível!', 'Fantástico!', 'LENDÁRIO!'],
    'bp.combo': 'Combo ×{n}', 'bp.allClear': 'TABULEIRO LIMPO! +300',
    'bp.th.classic': 'Clássico', 'bp.th.neon': 'Neon', 'bp.th.pastel': 'Pastel', 'bp.th.pixel': 'Pixel', 'bp.th.gold': 'Ouro e obsidiana',
    'bp.equipped': '✓ em uso', 'bp.equip': 'Usar',
    'bp.level': 'Nível {n}', 'bp.getGems': 'Colete {n} 💎', 'bp.clearLines': v => `Limpe ${v.n} ${s(v.n, 'linha', 'linhas')}`,
    'bp.levelWon': 'Nível {n} concluído!', 'bp.failClose': 'Quase!', 'bp.fail': 'Nível perdido',
    'bp.resWin': '{used} de {total} jogadas · 🪙 {coins} no total', 'bp.noMoves': 'Sem jogadas.', 'bp.noRoom': 'Não há mais espaço para as peças.',
    'bp.daily': '🎯 Desafio diário', 'bp.dailySub': '{date} · sequência {n}', 'bp.dailyBest': ' · recorde {n}', 'bp.dailyStreak': ' · sequência {n}',
    'bp.chrono': '⏱ Contra o tempo!', 'bp.chronoSub': '2 minutos, cada linha devolve tempo',
    'bp.mapLines': 'linhas',
    'bp.newPieces': 'Peças novas!', 'bp.newPiecesSub': 'grátis uma vez por nível', 'bp.newPiecesChrono': 'Peças novas',
    'bp.overTitle': 'Sem espaço!', 'bp.timeUp': '⏱ Acabou o tempo!', 'bp.finalScore': 'Pontos:',
    'bp.bestChrono': '🏆 Melhor partida contra o tempo!', 'bp.rank': v => `${v.n}º no seu top 10`, 'bp.outTop': 'Fora do seu top 10', 'bp.noPoints': 'Sem pontos: sem classificação',
    'bp.dailyEnd': v => `🎯 Desafio de ${v.date} — recorde de hoje: ${v.best} · sequência: ${v.n} ${s(v.n, 'dia', 'dias')}`,
    'bp.newRecord': '🏆 Novo recorde!', 'bp.record': 'Recorde: {n}',
    'bp.hudLevel': 'NÍV. {n} · JOGADAS', 'bp.hudDaily': '🎯 DESAFIO DIÁRIO', 'bp.hudGoal': 'OBJETIVO', 'bp.hudDailyBest': 'RECORDE DE HOJE', 'bp.hudTime': '⏱ TEMPO', 'bp.hudScoreRec': 'PONTOS · RECORDE {n}',
    'bp.tuto': 'Arraste uma peça para o tabuleiro',
    'bp.cRestartLevel': 'Recomeçar o nível {n}?', 'bp.cRestart': 'Recomeçar', 'bp.cChrono': 'Recomeçar o contra o tempo? A pontuação atual será perdida.', 'bp.cChronoOk': 'Recomeçar',
    'bp.cNewGame': 'Começar uma nova partida? A pontuação atual será perdida.',
    'bp.pickCell': 'Escolha uma casa', 'bp.pickCellSub': 'para quebrar', 'bp.plus3': '+3 jogadas', 'bp.lastChance': 'última chance!',
    'bp.contBooster': '🔨 Continuar com um reforço', 'bp.again': 'Jogar de novo', 'bp.modesBtn': '🗺️ Modos',
    'bp.adventure': 'Aventura', 'bp.advHelp': 'Liberte os 💎 limpando as linhas que os contêm, ou limpe as linhas pedidas, antes de acabarem as jogadas. Quanto menos jogadas usar, mais estrelas ganha.',
    'bp.scrollHint': '↕ 40 níveis: role o mapa', 'bp.dailyBtn': '🎯 Desafio diário', 'bp.chronoBtn': '⏱ Contra o tempo 2 min', 'bp.chronoBtnSub': '+1,5 s por linha limpa',
    'bp.classic': 'Partida clássica (sem fim)', 'close': 'Fechar',
    'bp.themes': 'Temas', 'bp.themesHelp': 'Desbloqueie estilos de blocos com suas moedas 🪙 (ganhas limpando linhas e conquistando estrelas).',
    'bp.more': '+3 jogadas · 🪙 25', 'bp.cont': '🔨 Continuar', 'bp.next': 'Próximo', 'bp.retry': 'Tentar de novo', 'bp.map': 'Mapa', 'bp.cleared': 'Nível concluído!',
    'ok': 'Continuar', 'cancel': 'Cancelar', 'language': 'Idioma',
    'app.settings': 'Configurações', 'app.sound': 'Efeitos sonoros', 'app.removeAds': 'Remover anúncios', 'app.removeAdsDesc': 'Compra única. Sem anúncios entre os níveis; os vídeos bônus continuam opcionais.',
    'app.adsRemoved': '✓ Anúncios removidos — obrigado!', 'app.restore': 'Restaurar compras', 'app.privacy': 'Opções de privacidade', 'app.policy': 'Política de privacidade',
    'app.watchMoves': '▶ Ver um vídeo: +3 jogadas', 'app.watchCont': '▶ Ver um vídeo: martelo grátis', 'app.watchCoins': '▶ Vídeo: +{n} 🪙', 'app.videoLeft': 'restam {n} hoje',
    'app.adFail': 'Nenhum vídeo disponível agora — tente mais tarde.', 'app.thanks': 'Obrigado pelo seu apoio!', 'app.buyFail': 'Compra não concluída.', 'app.restored': 'Compras restauradas.', 'app.nothing': 'Nenhuma compra para restaurar.',
    'app.coinsGot': '+{n} moedas', 'app.version': 'Versão {v}',
  },
};

function detect() {
  try { const l = localStorage.getItem(KEY); if (l && DICT[l]) return l; } catch (e) {}
  for (const l of navigator.languages || [navigator.language || 'en']) { const b = String(l).slice(0, 2).toLowerCase(); if (DICT[b]) return b; }
  return 'en';
}
export let lang = detect();
document.documentElement.lang = lang;

export function t(key, vars = {}) {
  let v = DICT[lang][key]; if (v === undefined) v = DICT.en[key];
  if (v === undefined) return key;
  if (typeof v === 'function') return v(vars);
  if (typeof v !== 'string') return v;
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}
// nombres et dates dans la langue choisie
export const num = n => Math.round(n).toLocaleString(lang);
export const date = (d, o) => d.toLocaleDateString(lang, o);

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
}
export function setLang(l) {
  if (!DICT[l] || l === lang) return;
  lang = l; document.documentElement.lang = l;
  try { localStorage.setItem(KEY, l); } catch (e) {}
  applyI18n();
  window.dispatchEvent(new CustomEvent('pt-lang', { detail: l }));
}
// un <select> de langue prêt à l'emploi
export function langSelect(sel) {
  sel.innerHTML = LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join('');
  sel.value = lang; sel.onchange = () => setLang(sel.value);
  window.addEventListener('pt-lang', () => { sel.value = lang; });
}
window.PT_I18N = { t, setLang, get lang() { return lang; } };
