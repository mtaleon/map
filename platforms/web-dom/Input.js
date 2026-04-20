import { IInput } from '../../platform/IInput.js';

export class WebInput extends IInput {
  constructor() {
    super();
    this._regionClickCb = null;
    this._regionHoverCb = null;
    this._colorSelectCb = null;
    this._newGameCb = null;
    this._undoCb = null;
    this._redoCb = null;
    this._hintCb = null;
    this._restartCb = null;
    this._isTouch = false;
  }

  initialize() {
    const svg = document.getElementById('map-svg');

    // Detect touch device
    this._isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // SVG click — works for both mouse and touch
    svg.addEventListener('pointerup', (e) => {
      const target = e.target.closest('[data-region-id]');
      if (target && this._regionClickCb) {
        const id = parseInt(target.dataset.regionId);
        this._regionClickCb(id, this._isTouch);
      }
    });

    // SVG hover (desktop only)
    if (!this._isTouch) {
      svg.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-region-id]');
        if (target && this._regionHoverCb) {
          this._regionHoverCb(parseInt(target.dataset.regionId));
        }
      });
      svg.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-region-id]');
        if (target && this._regionHoverCb) {
          this._regionHoverCb(null);
        }
      });
    }

    // Palette buttons
    document.getElementById('palette').addEventListener('click', (e) => {
      const btn = e.target.closest('.palette-btn');
      if (btn && this._colorSelectCb) {
        this._colorSelectCb(parseInt(btn.dataset.color));
      }
    });

    // Control buttons
    document.getElementById('new-btn').addEventListener('click', () => {
      this._newGameCb?.();
    });
    document.getElementById('hint-btn').addEventListener('click', () => {
      this._hintCb?.();
    });
    document.getElementById('undo-btn').addEventListener('click', () => {
      this._undoCb?.();
    });
    document.getElementById('redo-btn').addEventListener('click', () => {
      this._redoCb?.();
    });
    document.getElementById('restart-btn').addEventListener('click', () => {
      this._restartCb?.();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ignore when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      const key = e.key;
      if (key >= '1' && key <= '4') {
        this._colorSelectCb?.(parseInt(key) - 1);
      } else if (key === 'u' || key === 'z') {
        this._undoCb?.();
      } else if (key === 'y') {
        this._redoCb?.();
      } else if (key === 'n') {
        this._newGameCb?.();
      } else if (key === '?') {
        this._hintCb?.();
      } else if (key === 'r') {
        this._restartCb?.();
      }
    });

    // Menu dropdown toggle
    const menuType = document.getElementById('menu-type');
    const menuBtn = menuType.querySelector('.menu-btn');
    const dropdown = document.getElementById('type-dropdown');

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  onRegionClick(cb) { this._regionClickCb = cb; }
  onRegionHover(cb) { this._regionHoverCb = cb; }
  onColorSelect(cb) { this._colorSelectCb = cb; }
  onNewGame(cb) { this._newGameCb = cb; }
  onUndo(cb) { this._undoCb = cb; }
  onRedo(cb) { this._redoCb = cb; }
  onHint(cb) { this._hintCb = cb; }
  onRestart(cb) { this._restartCb = cb; }
}
