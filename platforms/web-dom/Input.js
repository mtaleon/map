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
    this._dragColorCb = null;
    this._isTouch = false;
    this._dragging = false;
  }

  initialize() {
    const svg = document.getElementById('map-svg');

    // Detect touch device
    this._isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // SVG click — works for both mouse and touch
    svg.addEventListener('pointerup', (e) => {
      if (this._dragging) return;
      const target = e.target.closest('[data-region-id]');
      if (target && this._regionClickCb) {
        const id = parseInt(target.dataset.regionId);
        this._regionClickCb(id, this._isTouch);
      }
    });

    // Drag-and-drop color application
    this._initDrag(svg);

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
  onDragColor(cb) { this._dragColorCb = cb; }

  _initDrag(svg) {
    const THRESHOLD = 5;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let dragColor = null;
    let ghost = null;

    const palette = document.getElementById('palette');

    const onPointerDown = (e) => {
      // Determine drag source color
      const colorSource = this._getDragSourceColor(e.target, svg);
      if (colorSource === null) return;

      dragging = false;
      dragColor = colorSource;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (dragColor === null) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging && (dx * dx + dy * dy) >= THRESHOLD * THRESHOLD) {
        dragging = true;
        ghost = this._createGhost(dragColor);
        document.body.classList.add('dragging');
      }

      if (dragging && ghost) {
        ghost.style.left = e.clientX + 'px';
        ghost.style.top = e.clientY + 'px';
      }
    };

    const onPointerUp = (e) => {
      if (dragging) {
        this._dragging = true;
        e.stopPropagation();

        // Hide ghost to find element underneath
        if (ghost) ghost.style.display = 'none';
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
        if (ghost) ghost.remove();
        ghost = null;

        document.body.classList.remove('dragging');

        // Find region under drop point
        const regionEl = dropTarget?.closest('[data-region-id]');
        if (regionEl && this._dragColorCb) {
          const regionId = parseInt(regionEl.dataset.regionId);
          this._dragColorCb(regionId, dragColor);
        }

        // Reset flag asynchronously so the current event cycle's click is suppressed
        setTimeout(() => { this._dragging = false; }, 0);
      }

      dragging = false;
      dragColor = null;
    };

    svg.addEventListener('pointerdown', onPointerDown);
    palette.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  _getDragSourceColor(target, svg) {
    // From palette button
    const btn = target.closest('.palette-btn');
    if (btn) {
      return parseInt(btn.dataset.color);
    }

    // From a colored region on the map
    const regionEl = target.closest('[data-region-id]');
    if (regionEl && svg.contains(regionEl)) {
      const fill = regionEl.getAttribute('fill');
      if (fill && fill !== '#f0f0f0') {
        return this._normalizeColor(fill);
      }
    }

    return null;
  }

  _normalizeColor(color) {
    // Convert rgb(r, g, b) or hex to palette index
    const paletteBtns = document.querySelectorAll('.palette-btn');
    const hex = this._toHex(color);

    for (const btn of paletteBtns) {
      const btnHex = this._toHex(btn.style.backgroundColor);
      if (btnHex === hex) {
        return parseInt(btn.dataset.color);
      }
    }
    return null;
  }

  _toHex(color) {
    if (!color) return null;
    // Already hex
    if (color.startsWith('#')) return color.toLowerCase();
    // rgb(r, g, b)
    const match = color.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return color;
  }

  _createGhost(colorIndex) {
    const btn = document.querySelector(`.palette-btn[data-color="${colorIndex}"]`);
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.backgroundColor = btn ? btn.style.backgroundColor : '#999';
    document.body.appendChild(ghost);
    return ghost;
  }
}
