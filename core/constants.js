export const PALETTES = {
  classic: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'],
  earth:   ['#b5654a', '#6b8e4e', '#4a7a3b', '#c9a84c'],
};

export const DEFAULT_PALETTE = 'classic';
export const NUM_COLORS = 4;
export const UNFILLED_COLOR = '#1B2230';  // Dark surface tone for Octile Universe integration

export const PRESETS = [
  { label: '20×15, 30 regions, Easy',         width: 800,  height: 600,  regions: 30, difficulty: 'EASY' },
  { label: '20×15, 30 regions, Normal',        width: 800,  height: 600,  regions: 30, difficulty: 'NORMAL' },
  { label: '20×15, 30 regions, Hard',          width: 800,  height: 600,  regions: 30, difficulty: 'HARD' },
  { label: '20×15, 30 regions, Unreasonable',  width: 800,  height: 600,  regions: 30, difficulty: 'UNREASONABLE' },
  { label: '30×25, 75 regions, Normal',        width: 1200, height: 1000, regions: 75, difficulty: 'NORMAL' },
  { label: '30×25, 75 regions, Hard',          width: 1200, height: 1000, regions: 75, difficulty: 'HARD' },
];

export const DIFFICULTY = {
  EASY:         { prefillRatio: 0.60, name: 'Easy',         uniqueSolution: true  },
  NORMAL:       { prefillRatio: 0.45, name: 'Normal',       uniqueSolution: true  },
  HARD:         { prefillRatio: 0.30, name: 'Hard',         uniqueSolution: false },
  UNREASONABLE: { prefillRatio: 0.15, name: 'Unreasonable', uniqueSolution: false },
};

export const EVENTS = {
  GAME_STARTED:        'game:started',
  BOARD_CHANGED:       'board:changed',
  HIGHLIGHT_CHANGED:   'highlight:changed',
  COLOR_SELECTED:      'color:selected',
  VALIDATION_CHANGED:  'validation:changed',
  GAME_COMPLETED:      'game:completed',
  GAME_SAVED:          'game:saved',
  GAME_LOADED:         'game:loaded',
  TOAST:               'toast',
};
