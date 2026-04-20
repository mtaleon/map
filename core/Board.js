export class Board {
  /**
   * @param {Array<{id:number, vertices:Array<{x:number,y:number}>, centroid:{x:number,y:number}}>} regions
   * @param {Map<number, Set<number>>} adjacency
   */
  constructor(regions, adjacency) {
    this.regions = regions.map(r => ({
      id: r.id,
      vertices: r.vertices,
      centroid: r.centroid,
      color: null,
      given: false,
      conflict: false,
    }));
    // Ensure adjacency is Map<number, Set<number>>
    this.adjacency = new Map();
    for (const [k, v] of adjacency) {
      this.adjacency.set(Number(k), new Set(v));
    }
  }

  getRegion(id) {
    return this.regions[id];
  }

  getNeighbors(id) {
    return this.adjacency.get(id) || new Set();
  }

  remainingCount() {
    let count = 0;
    for (const r of this.regions) {
      if (r.color === null && !r.given) count++;
    }
    return count;
  }

  /**
   * Set color on a region. Returns false if region is given.
   */
  setColor(id, colorIdx) {
    const region = this.regions[id];
    if (!region || region.given) return false;
    region.color = colorIdx;
    return true;
  }

  /**
   * Validate a region and its neighbors. Updates .conflict on all affected.
   * Returns Set of regionIds whose conflict state changed.
   */
  validateRegion(id) {
    const dirty = new Set();
    const toCheck = new Set([id, ...this.getNeighbors(id)]);

    for (const rid of toCheck) {
      const region = this.regions[rid];
      if (!region) continue;
      const oldConflict = region.conflict;
      region.conflict = this._hasConflict(rid);
      if (region.conflict !== oldConflict) {
        dirty.add(rid);
      }
    }
    return dirty;
  }

  /**
   * Full validation scan. Returns Set of all conflict regionIds.
   */
  validateAll() {
    const conflicts = new Set();
    for (const r of this.regions) {
      r.conflict = this._hasConflict(r.id);
      if (r.conflict) conflicts.add(r.id);
    }
    return conflicts;
  }

  /**
   * Check if all regions are colored and no conflicts exist.
   */
  isComplete() {
    for (const r of this.regions) {
      if (r.color === null) return false;
    }
    return this.validateAll().size === 0;
  }

  _hasConflict(id) {
    const region = this.regions[id];
    if (region.color === null) return false;
    for (const nid of this.getNeighbors(id)) {
      const neighbor = this.regions[nid];
      if (neighbor && neighbor.color === region.color) return true;
    }
    return false;
  }
}
