import { EventBus } from './core/events.js';
import { Game } from './core/Game.js';
import { Generator } from './core/Generator.js';
import { EVENTS, PRESETS, PALETTES, DEFAULT_PALETTE } from './core/constants.js';
import { WebRenderer } from './platforms/web-dom/Renderer.js';
import { WebInput } from './platforms/web-dom/Input.js';
import { WebStorage } from './platforms/web-dom/Storage.js';
import { init as i18nInit, t, getLang, setLang } from './core/i18n.js';

// Initialize i18n
i18nInit();

const eventBus = new EventBus();
const renderer = new WebRenderer();
const input = new WebInput();
const storage = new WebStorage();
const game = new Game(eventBus, storage);

// Set palette button colors
const palette = PALETTES[DEFAULT_PALETTE];
document.querySelectorAll('.palette-btn').forEach((btn, i) => {
  btn.style.backgroundColor = palette[i];
});

// --- Wire events → renderer ---

eventBus.on(EVENTS.GAME_STARTED, ({ regions, adjacency }) => {
  renderer.renderMap(regions, adjacency);
  renderer.updateColorPalette(game.selectedColor);
  renderer.updateRemaining(game.board.remainingCount());
  renderer.updateMoves(game.moves);
  renderer.updateTimer(game.elapsed);
});

eventBus.on(EVENTS.BOARD_CHANGED, ({ regionId, region }) => {
  renderer.updateRegion(regionId, region);
});

eventBus.on(EVENTS.HIGHLIGHT_CHANGED, (highlightState) => {
  renderer.applyHighlights(highlightState);
});

eventBus.on(EVENTS.COLOR_SELECTED, ({ color }) => {
  renderer.updateColorPalette(color);
});

eventBus.on(EVENTS.VALIDATION_CHANGED, ({ remaining, moves }) => {
  renderer.updateRemaining(remaining);
  renderer.updateMoves(moves);
});

eventBus.on(EVENTS.GAME_COMPLETED, (data) => {
  renderer.showCompletionModal(data);
});

eventBus.on(EVENTS.TOAST, ({ message, kind }) => {
  renderer.showToast(message, kind);
});

// --- Wire input → game ---

input.initialize();

input.onRegionClick((regionId, isTouch) => {
  game.colorRegion(regionId, isTouch);
});

input.onRegionHover((regionId) => {
  game.selectRegion(regionId);
});

input.onColorSelect((colorIndex) => {
  game.selectColor(colorIndex);
});

input.onUndo(() => {
  if (game.undoStack.length === 0) {
    renderer.showToast(t('toast.noUndo'), 'warning');
  } else {
    game.undo();
  }
});

input.onRedo(() => {
  if (game.redoStack.length === 0) {
    renderer.showToast(t('toast.noRedo'), 'warning');
  } else {
    game.redo();
  }
});

input.onHint(() => {
  game.getHint();
});

input.onRestart(() => {
  game.restart();
});

input.onNewGame(() => {
  // Open dropdown
  document.getElementById('type-dropdown').classList.add('open');
});

// --- Preset buttons ---
document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.preset);
    const preset = PRESETS[idx];
    if (!preset) return;

    document.getElementById('type-dropdown').classList.remove('open');
    startNewGame(preset);
  });
});

// --- Custom dialog ---
const customModal = document.getElementById('custom-modal');
document.getElementById('custom-btn').addEventListener('click', () => {
  document.getElementById('type-dropdown').classList.remove('open');
  customModal.classList.add('visible');
});
document.getElementById('custom-cancel').addEventListener('click', () => {
  customModal.classList.remove('visible');
});
document.getElementById('custom-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const config = {
    width: parseInt(document.getElementById('custom-width').value),
    height: parseInt(document.getElementById('custom-height').value),
    regions: parseInt(document.getElementById('custom-regions').value),
    difficulty: document.getElementById('custom-difficulty').value,
  };
  customModal.classList.remove('visible');
  startNewGame(config);
});

// --- Help modal ---
document.getElementById('help-btn').addEventListener('click', () => {
  document.getElementById('help-modal').classList.add('visible');
});
document.getElementById('help-close').addEventListener('click', () => {
  document.getElementById('help-modal').classList.remove('visible');
});

// --- Completion modal ---
document.getElementById('completion-new').addEventListener('click', () => {
  document.getElementById('completion-modal').classList.remove('visible');
  startNewGame(PRESETS[1]); // default Normal
});

// --- Timer display update ---
setInterval(() => {
  if (game.startTime) {
    renderer.updateTimer(game.elapsed);
  }
}, 1000);

// --- Start a new game ---
function startNewGame(config) {
  renderer.showToast(t('toast.generating'), 'info');
  // Use setTimeout to let toast render before blocking generation
  setTimeout(() => {
    try {
      const { mapData, prefills } = Generator.generate(config);
      game.startGame(mapData, prefills);
    } catch (e) {
      console.error('Generation failed:', e);
      renderer.showToast(t('toast.genFailed'), 'error');
      // Retry once
      try {
        const { mapData, prefills } = Generator.generate(config);
        game.startGame(mapData, prefills);
      } catch (e2) {
        renderer.showToast(t('toast.genFailedFinal'), 'error');
      }
    }
  }, 50);
}

// --- i18n ---
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Update dynamic info bar text
  const movesEl = document.getElementById('moves');
  const remainingEl = document.getElementById('remaining');
  if (game.board) {
    movesEl.textContent = t('info.moves') + ': ' + game.moves;
    remainingEl.textContent = t('info.left') + ': ' + game.board.remainingCount();
  } else {
    movesEl.textContent = t('info.moves') + ': 0';
    remainingEl.textContent = t('info.left') + ': 0';
  }
  // Update lang button text
  document.getElementById('lang-btn').textContent = t('lang.toggle');
}

document.getElementById('lang-btn').addEventListener('click', () => {
  setLang(getLang() === 'en' ? 'zh' : 'en');
  applyTranslations();
});

// Override renderer info updates to use translated labels
renderer.updateMoves = (moves) => {
  document.getElementById('moves').textContent = t('info.moves') + ': ' + moves;
};
renderer.updateRemaining = (count) => {
  document.getElementById('remaining').textContent = t('info.left') + ': ' + count;
};

// Apply translations on load
applyTranslations();

// --- Startup ---
if (!game.loadSavedGame()) {
  // Default: 20×15, 30 regions, Normal
  startNewGame(PRESETS[1]);
}

// Debug
window.game = game;
