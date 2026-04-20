import { NUM_COLORS } from './constants.js';

const DEFAULT_MAX_NODES = 100_000;

export class Solver {
  /**
   * Solve a graph coloring problem using backtracking + MRV heuristic.
   * @param {Map<number, Set<number>>} adjacency
   * @param {number} numRegions
   * @param {Array<number|null>} [partialColoring] - existing partial coloring
   * @param {number} [maxNodes] - budget
   * @returns {Array<number>|null} full coloring or null if unsolvable/budget exceeded
   */
  static solve(adjacency, numRegions, partialColoring = null, maxNodes = DEFAULT_MAX_NODES) {
    const colors = new Array(numRegions);
    for (let i = 0; i < numRegions; i++) {
      colors[i] = partialColoring ? partialColoring[i] : null;
    }

    const budget = { remaining: maxNodes };
    if (this._backtrack(colors, adjacency, numRegions, budget)) {
      return colors;
    }
    return null;
  }

  /**
   * Count solutions up to limit, with budget.
   * Returns actual count, or limit if budget exceeded (treat as unknown).
   */
  static countSolutions(adjacency, numRegions, partial, limit = 2, maxNodes = DEFAULT_MAX_NODES) {
    const colors = new Array(numRegions);
    for (let i = 0; i < numRegions; i++) {
      colors[i] = partial ? partial[i] : null;
    }

    const budget = { remaining: maxNodes };
    const result = { count: 0 };
    this._countBacktrack(colors, adjacency, numRegions, limit, budget, result);
    if (budget.remaining <= 0) return limit; // budget exceeded, treat as unknown
    return result.count;
  }

  /**
   * Validate a coloring. Returns Set of conflicting region IDs.
   */
  static validate(colors, adjacency) {
    const conflicts = new Set();
    for (const [id, neighbors] of adjacency) {
      if (colors[id] === null) continue;
      for (const nid of neighbors) {
        if (colors[nid] === colors[id]) {
          conflicts.add(id);
          conflicts.add(nid);
        }
      }
    }
    return conflicts;
  }

  /**
   * Get a hint: find an unfilled non-given region and return what color it should be.
   */
  static getHint(adjacency, regions) {
    const numRegions = regions.length;
    const partial = new Array(numRegions);
    for (let i = 0; i < numRegions; i++) {
      partial[i] = regions[i].color;
    }

    const solution = this.solve(adjacency, numRegions, partial);
    if (!solution) return null;

    // Find first unfilled non-given region
    for (let i = 0; i < numRegions; i++) {
      if (!regions[i].given && regions[i].color === null) {
        return { regionId: i, color: solution[i] };
      }
    }
    return null;
  }

  static _backtrack(colors, adjacency, numRegions, budget) {
    if (budget.remaining-- <= 0) return false;

    // MRV: pick uncolored region with fewest valid colors
    let best = -1;
    let bestCount = NUM_COLORS + 1;
    for (let i = 0; i < numRegions; i++) {
      if (colors[i] !== null) continue;
      const valid = this._validColors(i, colors, adjacency);
      if (valid.length === 0) return false;
      if (valid.length < bestCount) {
        bestCount = valid.length;
        best = i;
      }
    }

    if (best === -1) return true; // all colored

    const valid = this._validColors(best, colors, adjacency);
    // Shuffle for randomness in generation
    this._shuffle(valid);
    for (const c of valid) {
      colors[best] = c;
      if (this._backtrack(colors, adjacency, numRegions, budget)) return true;
      colors[best] = null;
    }
    return false;
  }

  static _countBacktrack(colors, adjacency, numRegions, limit, budget, result) {
    if (budget.remaining-- <= 0) return;
    if (result.count >= limit) return;

    let best = -1;
    let bestCount = NUM_COLORS + 1;
    for (let i = 0; i < numRegions; i++) {
      if (colors[i] !== null) continue;
      const valid = this._validColors(i, colors, adjacency);
      if (valid.length === 0) return;
      if (valid.length < bestCount) {
        bestCount = valid.length;
        best = i;
      }
    }

    if (best === -1) {
      result.count++;
      return;
    }

    const valid = this._validColors(best, colors, adjacency);
    for (const c of valid) {
      colors[best] = c;
      this._countBacktrack(colors, adjacency, numRegions, limit, budget, result);
      colors[best] = null;
      if (result.count >= limit || budget.remaining <= 0) return;
    }
  }

  static _validColors(regionId, colors, adjacency) {
    const used = new Set();
    const neighbors = adjacency.get(regionId);
    if (neighbors) {
      for (const nid of neighbors) {
        if (colors[nid] !== null) used.add(colors[nid]);
      }
    }
    const valid = [];
    for (let c = 0; c < NUM_COLORS; c++) {
      if (!used.has(c)) valid.push(c);
    }
    return valid;
  }

  static _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
