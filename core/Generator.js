import { DIFFICULTY, NUM_COLORS } from './constants.js';
import { Solver } from './Solver.js';

const DEV = typeof location !== 'undefined' && location.hostname === 'localhost';

export class Generator {
  /**
   * Generate a map coloring puzzle.
   * @param {{ width: number, height: number, regions: number, difficulty: string }} config
   * @returns {{ mapData: { regions, adjacency, meta }, prefills: Map<number, number> }}
   */
  static generate(config) {
    const { width, height, regions: N, difficulty } = config;

    // 1. Grid setup
    const cellSize = this._computeCellSize(width, height, N);
    const gridW = Math.floor(width / cellSize);
    const gridH = Math.floor(height / cellSize);

    // 2. Seed placement (Poisson-disk-like)
    const seeds = this._placeSeeds(gridW, gridH, N);

    // 3. BFS flood fill
    const grid = this._floodFill(gridW, gridH, seeds);

    // 4. Adjacency extraction
    const adjacency = this._extractAdjacency(grid, gridW, gridH, N);

    // 5. Boundary tracing → vertices + centroid
    const regionData = this._traceRegions(grid, gridW, gridH, N, cellSize);

    // 6. Pre-fill with progressive removal
    const diff = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;
    const prefills = this._generatePrefills(adjacency, N, diff);

    const mapData = {
      regions: regionData,
      adjacency,
      meta: { width, height, cellSize, gridW, gridH },
    };

    if (DEV) this._sanityCheck(adjacency, regionData, N);

    return { mapData, prefills };
  }

  // --- Step 1: Cell size ---
  static _computeCellSize(width, height, N) {
    // Target: total cells / N ≈ area per region, cellSize around 8-12
    const totalArea = width * height;
    const areaPerRegion = totalArea / N;
    // cellSize^2 * cellsPerRegion ≈ areaPerRegion, aim for ~40-80 cells per region
    let cellSize = Math.round(Math.sqrt(areaPerRegion / 60));
    cellSize = Math.max(6, Math.min(16, cellSize));
    return cellSize;
  }

  // --- Step 2: Seed placement ---
  static _placeSeeds(gridW, gridH, N) {
    const minDist = Math.max(3, Math.floor(Math.sqrt((gridW * gridH) / N) * 0.6));
    const seeds = [];
    const maxAttempts = N * 100;
    let attempts = 0;

    while (seeds.length < N && attempts < maxAttempts) {
      attempts++;
      const x = Math.floor(Math.random() * gridW);
      const y = Math.floor(Math.random() * gridH);

      let tooClose = false;
      for (const s of seeds) {
        const dx = x - s.x;
        const dy = y - s.y;
        if (dx * dx + dy * dy < minDist * minDist) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        seeds.push({ x, y, id: seeds.length });
      }
    }

    // If we couldn't place enough, relax distance and fill remaining
    while (seeds.length < N) {
      const x = Math.floor(Math.random() * gridW);
      const y = Math.floor(Math.random() * gridH);
      seeds.push({ x, y, id: seeds.length });
    }

    return seeds;
  }

  // --- Step 3: BFS flood fill ---
  static _floodFill(gridW, gridH, seeds) {
    const grid = new Int16Array(gridW * gridH).fill(-1);
    const queue = [];

    for (const s of seeds) {
      const idx = s.y * gridW + s.x;
      grid[idx] = s.id;
      queue.push(idx);
    }

    // BFS: each step expands all current frontier cells simultaneously
    let head = 0;
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (head < queue.length) {
      const idx = queue[head++];
      const cx = idx % gridW;
      const cy = Math.floor(idx / gridW);
      const rid = grid[idx];

      for (let d = 0; d < 4; d++) {
        const nx = cx + dx[d];
        const ny = cy + dy[d];
        if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;
        const nidx = ny * gridW + nx;
        if (grid[nidx] === -1) {
          grid[nidx] = rid;
          queue.push(nidx);
        }
      }
    }

    return grid;
  }

  // --- Step 4: Adjacency extraction ---
  static _extractAdjacency(grid, gridW, gridH, N) {
    const adjacency = new Map();
    for (let i = 0; i < N; i++) adjacency.set(i, new Set());

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const r = grid[y * gridW + x];
        if (r < 0) continue;
        // Check right
        if (x + 1 < gridW) {
          const s = grid[y * gridW + (x + 1)];
          if (s >= 0 && s !== r) {
            adjacency.get(r).add(s);
            adjacency.get(s).add(r);
          }
        }
        // Check bottom
        if (y + 1 < gridH) {
          const s = grid[(y + 1) * gridW + x];
          if (s >= 0 && s !== r) {
            adjacency.get(r).add(s);
            adjacency.get(s).add(r);
          }
        }
      }
    }

    return adjacency;
  }

  // --- Step 5: Boundary tracing ---
  static _traceRegions(grid, gridW, gridH, N, cellSize) {
    const regions = [];

    for (let rid = 0; rid < N; rid++) {
      const edges = this._collectEdges(grid, gridW, gridH, rid, cellSize);
      const loops = this._stitchLoops(edges);
      // Use the longest loop as the polygon
      let bestLoop = loops[0] || [];
      for (const loop of loops) {
        if (loop.length > bestLoop.length) bestLoop = loop;
      }
      const simplified = this._simplify(bestLoop);
      const centroid = this._computeCentroid(simplified);

      regions.push({
        id: rid,
        vertices: simplified,
        centroid,
      });
    }

    return regions;
  }

  static _collectEdges(grid, gridW, gridH, rid, cellSize) {
    const edges = [];

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (grid[y * gridW + x] !== rid) continue;

        const x0 = x * cellSize;
        const y0 = y * cellSize;
        const x1 = (x + 1) * cellSize;
        const y1 = (y + 1) * cellSize;

        // Top edge: if cell above is different or OOB
        if (y === 0 || grid[(y - 1) * gridW + x] !== rid) {
          edges.push({ ax: x0, ay: y0, bx: x1, by: y0 });
        }
        // Bottom edge
        if (y === gridH - 1 || grid[(y + 1) * gridW + x] !== rid) {
          edges.push({ ax: x1, ay: y1, bx: x0, by: y1 });
        }
        // Left edge
        if (x === 0 || grid[y * gridW + (x - 1)] !== rid) {
          edges.push({ ax: x0, ay: y1, bx: x0, by: y0 });
        }
        // Right edge
        if (x === gridW - 1 || grid[y * gridW + (x + 1)] !== rid) {
          edges.push({ ax: x1, ay: y0, bx: x1, by: y1 });
        }
      }
    }

    return edges;
  }

  static _stitchLoops(edges) {
    // Build adjacency: from point → list of {idx, edge} starting there
    const fromMap = new Map();
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const key = `${e.ax},${e.ay}`;
      if (!fromMap.has(key)) fromMap.set(key, []);
      fromMap.get(key).push({ idx: i, edge: e });
    }

    const used = new Set();
    const loops = [];

    for (let i = 0; i < edges.length; i++) {
      if (used.has(i)) continue;

      const loop = [];
      let current = edges[i];
      let currentIdx = i;

      while (!used.has(currentIdx)) {
        used.add(currentIdx);
        loop.push({ x: current.ax, y: current.ay });

        const nextKey = `${current.bx},${current.by}`;
        const candidates = fromMap.get(nextKey);
        if (!candidates) break;

        let found = false;
        for (const { idx: candIdx, edge: cand } of candidates) {
          if (!used.has(candIdx)) {
            current = cand;
            currentIdx = candIdx;
            found = true;
            break;
          }
        }
        if (!found) break;
      }

      if (loop.length > 0) loops.push(loop);
    }

    return loops;
  }

  static _simplify(vertices) {
    if (vertices.length < 3) return vertices;

    const result = [vertices[0]];
    for (let i = 1; i < vertices.length - 1; i++) {
      const prev = result[result.length - 1];
      const curr = vertices[i];
      const next = vertices[i + 1];

      // Cross product to check collinearity
      const cross = (curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x);
      if (Math.abs(cross) > 0.01) {
        result.push(curr);
      }
    }
    // Always include last vertex
    result.push(vertices[vertices.length - 1]);

    // Check if last-first-second are collinear
    if (result.length >= 3) {
      const last = result[result.length - 1];
      const first = result[0];
      const second = result[1];
      const cross = (first.x - last.x) * (second.y - last.y) - (first.y - last.y) * (second.x - last.x);
      if (Math.abs(cross) < 0.01) {
        result.shift();
      }
    }

    return result;
  }

  static _computeCentroid(vertices) {
    if (vertices.length === 0) return { x: 0, y: 0 };
    if (vertices.length < 3) {
      const sx = vertices.reduce((s, v) => s + v.x, 0);
      const sy = vertices.reduce((s, v) => s + v.y, 0);
      return { x: sx / vertices.length, y: sy / vertices.length };
    }

    let area = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
      area += cross;
      cx += (vertices[i].x + vertices[j].x) * cross;
      cy += (vertices[i].y + vertices[j].y) * cross;
    }

    area /= 2;
    if (Math.abs(area) < 0.001) {
      const sx = vertices.reduce((s, v) => s + v.x, 0);
      const sy = vertices.reduce((s, v) => s + v.y, 0);
      return { x: sx / vertices.length, y: sy / vertices.length };
    }

    cx /= (6 * area);
    cy /= (6 * area);
    return { x: cx, y: cy };
  }

  // --- Step 6: Pre-fill with progressive removal ---
  static _generatePrefills(adjacency, N, diff) {
    // First solve the full map
    const fullSolution = Solver.solve(adjacency, N);
    if (!fullSolution) {
      // Fallback: return empty prefills (shouldn't happen with 4 colors)
      return new Map();
    }

    // Start with all regions as given
    const prefills = new Map();
    for (let i = 0; i < N; i++) {
      prefills.set(i, fullSolution[i]);
    }

    // Build candidate removal order: 50% high-degree + 50% random
    const degrees = [];
    for (let i = 0; i < N; i++) {
      degrees.push({ id: i, degree: (adjacency.get(i)?.size || 0) });
    }
    degrees.sort((a, b) => b.degree - a.degree);

    const halfCount = Math.floor(N / 2);
    const highDeg = degrees.slice(0, halfCount).map(d => d.id);
    const rest = degrees.slice(halfCount).map(d => d.id);
    this._shuffleArray(rest);
    this._shuffleArray(highDeg);
    const candidates = [...highDeg, ...rest];

    const targetPrefillCount = Math.floor(N * diff.prefillRatio);

    for (const cid of candidates) {
      if (prefills.size <= targetPrefillCount) break;
      if (!prefills.has(cid)) continue;

      // Tentatively remove
      const savedColor = prefills.get(cid);
      prefills.delete(cid);

      if (diff.uniqueSolution) {
        // Build partial coloring from remaining prefills
        const partial = new Array(N).fill(null);
        for (const [id, c] of prefills) {
          partial[id] = c;
        }

        const count = Solver.countSolutions(adjacency, N, partial, 2);
        if (count > 1) {
          // Rollback — removing this clue creates ambiguity
          prefills.set(cid, savedColor);
        }
      }
    }

    return prefills;
  }

  static _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // --- Dev sanity checks ---
  static _sanityCheck(adjacency, regions, N) {
    // Bidirectional
    for (const [r, neighbors] of adjacency) {
      for (const s of neighbors) {
        if (!adjacency.get(s)?.has(r)) {
          console.warn(`Adjacency not bidirectional: ${r}-${s}`);
        }
      }
      // No self-loops
      if (neighbors.has(r)) {
        console.warn(`Self-loop on region ${r}`);
      }
    }
    // All regions have neighbors
    for (let i = 0; i < N; i++) {
      if (!adjacency.has(i) || adjacency.get(i).size === 0) {
        console.warn(`Region ${i} has no neighbors`);
      }
    }
    // Polygon closure
    for (const r of regions) {
      if (r.vertices.length < 3) {
        console.warn(`Region ${r.id} has < 3 vertices`);
      }
    }
  }
}
