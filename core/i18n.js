// Octile Universe Guideline: Avoid exclamation marks in all UI copy.
// Tone should be calm, restrained, and respectful.

const translations = {
  en: {
    // Nav
    'nav.map': 'Map',
    'nav.help': 'Help',
    'nav.presets': 'Presets',

    // Info bar
    'info.moves': 'Moves',
    'info.left': 'Left',

    // Controls
    'ctrl.new': 'New Map',
    'ctrl.hint': 'Hint',
    'ctrl.undo': 'Undo',
    'ctrl.redo': 'Redo',
    'ctrl.restart': 'Restart',

    // Difficulty
    'diff.easy': 'Easy',
    'diff.normal': 'Normal',
    'diff.hard': 'Hard',
    'diff.unreasonable': 'Unreasonable',

    // Preset descriptions
    'preset.0': '20\u00d715, 30 regions, Easy',
    'preset.1': '20\u00d715, 30 regions, Normal',
    'preset.2': '20\u00d715, 30 regions, Hard',
    'preset.3': '20\u00d715, 30 regions, Unreasonable',
    'preset.4': '30\u00d725, 75 regions, Normal',
    'preset.5': '30\u00d725, 75 regions, Hard',
    'preset.custom': 'Custom\u2026',

    // Custom modal
    'custom.title': 'Custom Map',
    'custom.width': 'Width (px):',
    'custom.height': 'Height (px):',
    'custom.regions': 'Regions:',
    'custom.difficulty': 'Difficulty:',
    'custom.generate': 'Generate',
    'custom.cancel': 'Cancel',

    // Help modal
    'help.title': 'How to Play',
    'help.desc': 'Color every region on the map using 4 colors so that no two adjacent regions share the same color.',
    'help.li1': 'Select a color from the palette below the map',
    'help.li2': 'Click a region to fill it with that color',
    'help.li3': 'Gray regions are unfilled; shaded regions are pre-filled (given)',
    'help.li4': 'Red-highlighted regions have conflicts (same color as a neighbor)',
    'help.li5': 'On mobile: tap to select, tap again to place',
    'help.shortcuts': 'Keyboard Shortcuts',
    'help.key.color': 'Select color',
    'help.key.undo': 'Undo',
    'help.key.redo': 'Redo',
    'help.key.new': 'New map',
    'help.key.hint': 'Hint',
    'help.key.restart': 'Restart',
    'help.ok': 'OK',

    // Completion modal
    'complete.title': 'Map completed',
    'complete.time': 'Time:',
    'complete.moves': 'Moves:',
    'complete.new': 'New Map',
    'complete.octile': 'Looking for deeper puzzles? Octile explores this style further.',

    // Toasts
    'toast.generating': 'Generating map...',
    'toast.genFailed': 'Generation failed, retrying...',
    'toast.genFailedFinal': 'Generation failed. Try different settings.',
    'toast.noUndo': 'Nothing to undo',
    'toast.noRedo': 'Nothing to redo',
    'toast.noHint': 'No hint available',
    'toast.hintApplied': 'Hint applied',
    'toast.restarted': 'Game restarted',

    // Lang toggle
    'lang.toggle': '\u4e2d\u6587',
  },

  zh: {
    // Nav
    'nav.map': '\u5730\u5716',
    'nav.help': '\u8aaa\u660e',
    'nav.presets': '\u9810\u8a2d',

    // Info bar
    'info.moves': '\u6b65\u6578',
    'info.left': '\u5269\u9918',

    // Controls
    'ctrl.new': '\u65b0\u5730\u5716',
    'ctrl.hint': '\u63d0\u793a',
    'ctrl.undo': '\u5fa9\u539f',
    'ctrl.redo': '\u91cd\u505a',
    'ctrl.restart': '\u91cd\u65b0\u958b\u59cb',

    // Difficulty
    'diff.easy': '\u7c21\u55ae',
    'diff.normal': '\u666e\u901a',
    'diff.hard': '\u56f0\u96e3',
    'diff.unreasonable': '\u6975\u96e3',

    // Preset descriptions
    'preset.0': '20\u00d715\uff0c30 \u5340\u57df\uff0c\u7c21\u55ae',
    'preset.1': '20\u00d715\uff0c30 \u5340\u57df\uff0c\u666e\u901a',
    'preset.2': '20\u00d715\uff0c30 \u5340\u57df\uff0c\u56f0\u96e3',
    'preset.3': '20\u00d715\uff0c30 \u5340\u57df\uff0c\u6975\u96e3',
    'preset.4': '30\u00d725\uff0c75 \u5340\u57df\uff0c\u666e\u901a',
    'preset.5': '30\u00d725\uff0c75 \u5340\u57df\uff0c\u56f0\u96e3',
    'preset.custom': '\u81ea\u8a02\u2026',

    // Custom modal
    'custom.title': '\u81ea\u8a02\u5730\u5716',
    'custom.width': '\u5bec\u5ea6 (px)\uff1a',
    'custom.height': '\u9ad8\u5ea6 (px)\uff1a',
    'custom.regions': '\u5340\u57df\u6578\uff1a',
    'custom.difficulty': '\u96e3\u5ea6\uff1a',
    'custom.generate': '\u7522\u751f',
    'custom.cancel': '\u53d6\u6d88',

    // Help modal
    'help.title': '\u904a\u6232\u8aaa\u660e',
    'help.desc': '\u4f7f\u7528 4 \u7a2e\u984f\u8272\u70ba\u5730\u5716\u4e0a\u7684\u6bcf\u500b\u5340\u57df\u4e0a\u8272\uff0c\u4f7f\u76f8\u9130\u5340\u57df\u984f\u8272\u4e0d\u540c\u3002',
    'help.li1': '\u5f9e\u5730\u5716\u4e0b\u65b9\u7684\u8abf\u8272\u76e4\u9078\u64c7\u984f\u8272',
    'help.li2': '\u9ede\u64ca\u5340\u57df\u4ee5\u586b\u5145\u8a72\u984f\u8272',
    'help.li3': '\u7070\u8272\u5340\u57df\u672a\u586b\u8272\uff1b\u6df1\u8272\u5340\u57df\u70ba\u9810\u586b\uff08\u5df2\u7d66\u5b9a\uff09',
    'help.li4': '\u7d05\u8272\u9ad8\u4eae\u5340\u57df\u6709\u885d\u7a81\uff08\u8207\u76f8\u9130\u5340\u57df\u540c\u8272\uff09',
    'help.li5': '\u624b\u6a5f\uff1a\u9ede\u64ca\u9078\u53d6\uff0c\u518d\u6b21\u9ede\u64ca\u653e\u7f6e',
    'help.shortcuts': '\u9375\u76e4\u5feb\u6377\u9375',
    'help.key.color': '\u9078\u64c7\u984f\u8272',
    'help.key.undo': '\u5fa9\u539f',
    'help.key.redo': '\u91cd\u505a',
    'help.key.new': '\u65b0\u5730\u5716',
    'help.key.hint': '\u63d0\u793a',
    'help.key.restart': '\u91cd\u65b0\u958b\u59cb',
    'help.ok': '\u78ba\u5b9a',

    // Completion modal
    'complete.title': '\u5730\u5716\u5b8c\u6210',
    'complete.time': '\u6642\u9593\uff1a',
    'complete.moves': '\u6b65\u6578\uff1a',
    'complete.new': '\u65b0\u5730\u5716',
    'complete.octile': '\u5c0b\u627e\u66f4\u6df1\u5165\u7684\u8b0e\u984c\uff1fOctile \u9032\u4e00\u6b65\u63a2\u7d22\u9019\u7a2e\u98a8\u683c\u3002',

    // Toasts
    'toast.generating': '\u6b63\u5728\u7522\u751f\u5730\u5716\u2026',
    'toast.genFailed': '\u7522\u751f\u5931\u6557\uff0c\u91cd\u8a66\u4e2d\u2026',
    'toast.genFailedFinal': '\u7522\u751f\u5931\u6557\uff0c\u8acb\u8a66\u5176\u4ed6\u8a2d\u5b9a\u3002',
    'toast.noUndo': '\u7121\u53ef\u5fa9\u539f\u7684\u64cd\u4f5c',
    'toast.noRedo': '\u7121\u53ef\u91cd\u505a\u7684\u64cd\u4f5c',
    'toast.noHint': '\u7121\u53ef\u7528\u63d0\u793a',
    'toast.hintApplied': '\u5df2\u5957\u7528\u63d0\u793a',
    'toast.restarted': '\u904a\u6232\u5df2\u91cd\u65b0\u958b\u59cb',

    // Lang toggle
    'lang.toggle': 'EN',
  },
};

const STORAGE_KEY = 'map-lang';
let currentLang = 'en';

export function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  currentLang = (saved === 'zh') ? 'zh' : 'en';
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = (lang === 'zh') ? 'zh' : 'en';
  localStorage.setItem(STORAGE_KEY, currentLang);
}

export function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}
