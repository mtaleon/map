import { IRenderer } from '../../platform/IRenderer.js';
import { PALETTES, DEFAULT_PALETTE, UNFILLED_COLOR } from '../../core/constants.js';

export class WebRenderer extends IRenderer {
  constructor() {
    super();
    this.svg = document.getElementById('map-svg');
    this.timerEl = document.getElementById('timer');
    this.movesEl = document.getElementById('moves');
    this.remainingEl = document.getElementById('remaining');
    this.palette = PALETTES[DEFAULT_PALETTE];
    this.fillGroup = null;
    this.borderGroup = null;
    this.lastHighlight = null;
  }

  renderMap(regions, adjacency) {
    this.svg.innerHTML = '';
    if (regions.length === 0) return;

    // Compute bounding box from all vertices
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of regions) {
      for (const v of r.vertices) {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      }
    }
    const pad = 2;
    this.svg.setAttribute('viewBox', `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`);

    // Fill group (below borders)
    this.fillGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.fillGroup.setAttribute('class', 'fill-group');
    this.svg.appendChild(this.fillGroup);

    // Border group (on top)
    this.borderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.borderGroup.setAttribute('class', 'border-group');
    this.svg.appendChild(this.borderGroup);

    for (const region of regions) {
      const d = this._pathData(region.vertices);

      // Fill path
      const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      fillPath.setAttribute('d', d);
      fillPath.setAttribute('data-region-id', region.id);
      fillPath.setAttribute('class', 'region-fill');
      fillPath.setAttribute('fill', this._getFill(region));
      if (region.given) fillPath.classList.add('given');
      this.fillGroup.appendChild(fillPath);

      // Border path
      const borderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      borderPath.setAttribute('d', d);
      borderPath.setAttribute('data-region-id', region.id);
      borderPath.setAttribute('class', 'region-border');
      borderPath.setAttribute('fill', 'none');
      this.borderGroup.appendChild(borderPath);
    }
  }

  updateRegion(regionId, region) {
    const fillPath = this.fillGroup?.querySelector(`[data-region-id="${regionId}"]`);
    if (!fillPath) return;
    fillPath.setAttribute('fill', this._getFill(region));
    fillPath.classList.toggle('given', region.given);
  }

  applyHighlights(hl) {
    if (!this.borderGroup) return;

    // Clear previous highlights
    if (this.lastHighlight) {
      this._clearHighlightClasses(this.lastHighlight);
    }

    // Apply new highlights (priority order: conflict > preview-conflict > neighbor > selected)
    if (hl.selected !== null && hl.selected !== undefined) {
      this._addRegionClass(hl.selected, 'selected');
    }
    if (hl.neighbors) {
      for (const id of hl.neighbors) {
        this._addRegionClass(id, 'neighbor');
      }
    }
    if (hl.previewConflicts) {
      for (const id of hl.previewConflicts) {
        // Override neighbor with preview-conflict
        this._removeRegionClass(id, 'neighbor');
        this._addRegionClass(id, 'preview-conflict');
      }
    }
    if (hl.conflicts) {
      for (const id of hl.conflicts) {
        this._addRegionClass(id, 'conflict');
      }
    }

    this.lastHighlight = hl;
  }

  updateColorPalette(selectedColor) {
    const buttons = document.querySelectorAll('.palette-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.color) === selectedColor);
    });
  }

  updateTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    this.timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  updateMoves(moves) {
    this.movesEl.textContent = moves;
  }

  updateRemaining(count) {
    this.remainingEl.textContent = count;
  }

  showCompletionModal(data) {
    const modal = document.getElementById('completion-modal');
    document.getElementById('completion-time').textContent = data.time;
    document.getElementById('completion-moves').textContent = data.moves;
    modal.classList.add('visible');
  }

  showToast(message, kind = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${kind}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  _getFill(region) {
    if (region.color !== null && region.color !== undefined) {
      return this.palette[region.color];
    }
    return UNFILLED_COLOR;
  }

  _pathData(vertices) {
    if (!vertices || vertices.length === 0) return '';
    let d = `M${vertices[0].x} ${vertices[0].y}`;
    for (let i = 1; i < vertices.length; i++) {
      d += ` L${vertices[i].x} ${vertices[i].y}`;
    }
    d += ' Z';
    return d;
  }

  _addRegionClass(id, cls) {
    const border = this.borderGroup?.querySelector(`[data-region-id="${id}"]`);
    if (border) border.classList.add(cls);
    const fill = this.fillGroup?.querySelector(`[data-region-id="${id}"]`);
    if (fill) fill.classList.add(cls);
  }

  _removeRegionClass(id, cls) {
    const border = this.borderGroup?.querySelector(`[data-region-id="${id}"]`);
    if (border) border.classList.remove(cls);
    const fill = this.fillGroup?.querySelector(`[data-region-id="${id}"]`);
    if (fill) fill.classList.remove(cls);
  }

  _clearHighlightClasses(hl) {
    const classes = ['selected', 'neighbor', 'preview-conflict', 'conflict'];
    const allIds = new Set();
    if (hl.selected !== null && hl.selected !== undefined) allIds.add(hl.selected);
    if (hl.neighbors) for (const id of hl.neighbors) allIds.add(id);
    if (hl.previewConflicts) for (const id of hl.previewConflicts) allIds.add(id);
    if (hl.conflicts) for (const id of hl.conflicts) allIds.add(id);

    for (const id of allIds) {
      for (const cls of classes) {
        this._removeRegionClass(id, cls);
      }
    }
  }
}
