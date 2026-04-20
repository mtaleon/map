import { Board } from './Board.js';
import { Solver } from './Solver.js';
import { EVENTS } from './constants.js';
import { t } from './i18n.js';

const SAVE_KEY = 'map-coloring-save';

export class Game {
  constructor(eventBus, storage) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.board = null;
    this.selectedColor = 0;
    this.selectedRegion = null;
    this.undoStack = [];
    this.redoStack = [];
    this.moves = 0;
    this.startTime = null;
    this.elapsed = 0;
    this._timerInterval = null;
    this._completed = false;
    this._saveTimeout = null;

    // Saved originals for restart / serialize
    this.originalMapData = null;
    this.originalPrefills = null;
  }

  startGame(mapData, prefills) {
    this._stopTimer();
    this.originalMapData = mapData;
    this.originalPrefills = prefills;

    this.board = new Board(mapData.regions, mapData.adjacency);

    // Apply prefills as given
    for (const [id, colorIdx] of prefills) {
      const region = this.board.regions[id];
      region.color = colorIdx;
      region.given = true;
    }
    this.board.validateAll();

    this.selectedColor = 0;
    this.selectedRegion = null;
    this.undoStack = [];
    this.redoStack = [];
    this.moves = 0;
    this.elapsed = 0;
    this._completed = false;

    this._startTimer();

    this.eventBus.emit(EVENTS.GAME_STARTED, {
      regions: this.board.regions,
      adjacency: this.board.adjacency,
    });
    this.eventBus.emit(EVENTS.COLOR_SELECTED, { color: this.selectedColor });
    this._emitHighlight();
    this._emitStats();
  }

  selectColor(colorIndex) {
    this.selectedColor = colorIndex;
    this.eventBus.emit(EVENTS.COLOR_SELECTED, { color: colorIndex });
    this._emitHighlight();
  }

  /**
   * Select a region (for preview on touch / hover).
   */
  selectRegion(regionId) {
    this.selectedRegion = regionId;
    this._emitHighlight();
  }

  /**
   * Primary action: color a region.
   * On touch: two-step (select then confirm). On desktop: immediate.
   */
  colorRegion(regionId, isTouch = false) {
    if (this._completed) return;
    const region = this.board.regions[regionId];
    if (!region || region.given) return;

    // Two-step touch: first tap selects, second tap places
    if (isTouch && this.selectedRegion !== regionId) {
      this.selectRegion(regionId);
      return;
    }

    const prevColor = region.color;
    // Toggle: if same color, clear
    const nextColor = (prevColor === this.selectedColor) ? null : this.selectedColor;

    if (!this.board.setColor(regionId, nextColor)) return;

    this.undoStack.push({ regionId, prevColor, nextColor });
    this.redoStack = [];
    this.moves++;

    const dirty = this.board.validateRegion(regionId);
    this._emitBoardChanges(regionId, dirty);
    this._emitHighlight();
    this._emitStats();

    if (nextColor !== null && this.board.isComplete()) {
      this._onComplete();
    }

    this._scheduleSave();
  }

  undo() {
    if (this.undoStack.length === 0 || this._completed) return;
    const action = this.undoStack.pop();
    this.redoStack.push(action);

    const region = this.board.regions[action.regionId];
    region.color = action.prevColor;

    const dirty = this.board.validateRegion(action.regionId);
    this._emitBoardChanges(action.regionId, dirty);
    this._emitHighlight();
    this._emitStats();
    this._scheduleSave();
  }

  redo() {
    if (this.redoStack.length === 0 || this._completed) return;
    const action = this.redoStack.pop();
    this.undoStack.push(action);

    const region = this.board.regions[action.regionId];
    region.color = action.nextColor;

    const dirty = this.board.validateRegion(action.regionId);
    this._emitBoardChanges(action.regionId, dirty);
    this._emitHighlight();
    this._emitStats();
    this._scheduleSave();
  }

  getHint() {
    if (this._completed) return;
    const hint = Solver.getHint(this.board.adjacency, this.board.regions);
    if (!hint) {
      this.eventBus.emit(EVENTS.TOAST, { message: t('toast.noHint'), kind: 'warning' });
      return;
    }

    const region = this.board.regions[hint.regionId];
    const prevColor = region.color;
    region.color = hint.color;

    this.undoStack.push({ regionId: hint.regionId, prevColor, nextColor: hint.color });
    this.redoStack = [];
    this.moves++;

    const dirty = this.board.validateRegion(hint.regionId);
    this._emitBoardChanges(hint.regionId, dirty);
    this._emitHighlight();
    this._emitStats();

    this.eventBus.emit(EVENTS.TOAST, { message: t('toast.hintApplied'), kind: 'info' });

    if (this.board.isComplete()) {
      this._onComplete();
    }

    this._scheduleSave();
  }

  restart() {
    if (!this.originalMapData || !this.originalPrefills) return;
    this.startGame(this.originalMapData, this.originalPrefills);
    this.eventBus.emit(EVENTS.TOAST, { message: t('toast.restarted'), kind: 'info' });
  }

  // --- Save / Load ---

  serialize() {
    if (!this.board) return null;
    const colors = this.board.regions.map(r => r.color);
    // Convert adjacency Map<number, Set<number>> to array of [key, [...values]]
    const adjEntries = [];
    for (const [k, v] of this.board.adjacency) {
      adjEntries.push([k, [...v]]);
    }
    return {
      version: 1,
      timestamp: Date.now(),
      mapData: {
        regions: this.originalMapData.regions,
        adjacency: adjEntries,
        meta: this.originalMapData.meta,
      },
      prefills: [...this.originalPrefills],
      colors,
      elapsed: this.elapsed,
      moves: this.moves,
      selectedColor: this.selectedColor,
    };
  }

  hydrate(data) {
    if (!data || data.version !== 1) return false;
    try {
      // Rebuild adjacency from entries
      const adjacency = new Map();
      for (const [k, v] of data.mapData.adjacency) {
        adjacency.set(Number(k), new Set(v));
      }
      const mapData = {
        regions: data.mapData.regions,
        adjacency,
        meta: data.mapData.meta,
      };
      const prefills = new Map(data.prefills);

      this.originalMapData = mapData;
      this.originalPrefills = prefills;

      this.board = new Board(mapData.regions, adjacency);

      // Apply prefills as given
      for (const [id, colorIdx] of prefills) {
        const region = this.board.regions[id];
        region.color = colorIdx;
        region.given = true;
      }

      // Apply saved colors (non-given regions)
      for (let i = 0; i < data.colors.length; i++) {
        if (!this.board.regions[i].given && data.colors[i] !== null) {
          this.board.regions[i].color = data.colors[i];
        }
      }

      this.board.validateAll();
      this.elapsed = data.elapsed || 0;
      this.moves = data.moves || 0;
      this.selectedColor = data.selectedColor ?? 0;
      this.undoStack = [];
      this.redoStack = [];
      this._completed = false;

      this._startTimer();

      this.eventBus.emit(EVENTS.GAME_STARTED, {
        regions: this.board.regions,
        adjacency: this.board.adjacency,
      });
      this.eventBus.emit(EVENTS.COLOR_SELECTED, { color: this.selectedColor });
      this._emitHighlight();
      this._emitStats();
      this.eventBus.emit(EVENTS.GAME_LOADED, {});
      return true;
    } catch (e) {
      console.error('Hydrate failed:', e);
      return false;
    }
  }

  save() {
    const data = this.serialize();
    if (data) {
      this.storage.set(SAVE_KEY, data);
    }
  }

  loadSavedGame() {
    const data = this.storage.get(SAVE_KEY);
    if (!data) return false;
    return this.hydrate(data);
  }

  clearSave() {
    this.storage.remove(SAVE_KEY);
  }

  // --- Private ---

  _onComplete() {
    this._completed = true;
    this._stopTimer();
    this.clearSave();

    const m = Math.floor(this.elapsed / 60);
    const s = this.elapsed % 60;
    this.eventBus.emit(EVENTS.GAME_COMPLETED, {
      time: `${m}:${String(s).padStart(2, '0')}`,
      moves: this.moves,
    });
  }

  _computeHighlightState() {
    const hl = {
      selected: this.selectedRegion,
      neighbors: new Set(),
      previewConflicts: new Set(),
      conflicts: new Set(),
    };

    if (this.selectedRegion !== null && this.selectedRegion !== undefined) {
      const neighbors = this.board.getNeighbors(this.selectedRegion);
      hl.neighbors = new Set(neighbors);

      // Preview conflicts: neighbors that have the selectedColor
      for (const nid of neighbors) {
        const nr = this.board.regions[nid];
        if (nr && nr.color === this.selectedColor) {
          hl.previewConflicts.add(nid);
        }
      }
    }

    // Actual placed conflicts
    for (const r of this.board.regions) {
      if (r.conflict) hl.conflicts.add(r.id);
    }

    return hl;
  }

  _emitHighlight() {
    if (!this.board) return;
    this.eventBus.emit(EVENTS.HIGHLIGHT_CHANGED, this._computeHighlightState());
  }

  _emitBoardChanges(primaryId, dirtySet) {
    // Always emit the primary region
    this.eventBus.emit(EVENTS.BOARD_CHANGED, {
      regionId: primaryId,
      region: this.board.regions[primaryId],
    });
    // Emit dirty regions (conflict state changed)
    for (const id of dirtySet) {
      if (id !== primaryId) {
        this.eventBus.emit(EVENTS.BOARD_CHANGED, {
          regionId: id,
          region: this.board.regions[id],
        });
      }
    }
  }

  _emitStats() {
    if (!this.board) return;
    this.eventBus.emit(EVENTS.VALIDATION_CHANGED, {
      remaining: this.board.remainingCount(),
      moves: this.moves,
    });
  }

  _startTimer() {
    this._stopTimer();
    this.startTime = Date.now() - this.elapsed * 1000;
    this._timerInterval = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  _scheduleSave() {
    if (this._saveTimeout) return;
    this._saveTimeout = setTimeout(() => {
      this._saveTimeout = null;
      this.save();
    }, 10000);
  }
}
