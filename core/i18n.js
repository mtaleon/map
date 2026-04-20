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
    'help.objective': 'Use 4 colors to fill every region on the map,\nensuring no adjacent regions share the same color.',
    'help.section.controls': 'Operating Instructions',
    'help.controls.1': 'Select a color from the palette below the map',
    'help.controls.2': 'Click a region to apply the selected color',
    'help.controls.3': 'Gray regions: not yet filled',
    'help.controls.4': 'Darker regions: pre-filled, cannot be changed',
    'help.controls.5': 'Red-highlighted regions: color conflicts with adjacent region, needs adjustment',
    'help.section.mobile': 'Mobile Device Tips',
    'help.mobile.1': 'First tap: select region',
    'help.mobile.2': 'Second tap: place currently selected color',
    'help.section.approach': 'A Note on Approach',
    'help.approach': 'Take time to consider how regions relate to each other.\nSometimes a different color arrangement makes the whole map suddenly clearer.',
    'help.close': 'Close',

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
    'help.title': '\u904a\u6232\u65b9\u5f0f',
    'help.objective': '\u4f7f\u7528 4 \u7a2e\u984f\u8272 \u70ba\u5730\u5716\u4e0a\u7684\u6bcf\u500b\u5340\u57df\u4e0a\u8272\uff0c\n\u78ba\u4fdd \u6c92\u6709\u76f8\u9130\u7684\u5340\u57df\u4f7f\u7528\u76f8\u540c\u7684\u984f\u8272\u3002',
    'help.section.controls': '\u64cd\u4f5c\u8aaa\u660e',
    'help.controls.1': '\u5f9e\u5730\u5716\u4e0b\u65b9\u7684 \u8abf\u8272\u76e4 \u9078\u64c7\u4e00\u7a2e\u984f\u8272',
    'help.controls.2': '\u9ede\u64ca\u5730\u5716\u4e0a\u7684\u5340\u57df\uff0c\u5c07\u9078\u64c7\u7684\u984f\u8272\u586b\u5165',
    'help.controls.3': '\u7070\u8272\u5340\u57df\uff1a\u5c1a\u672a\u586b\u8272',
    'help.controls.4': '\u6df1\u8272\u5340\u57df\uff1a\u9810\u5148\u7d66\u5b9a\u3001\u4e0d\u53ef\u66f4\u6539',
    'help.controls.5': '\u7d05\u8272\u9ad8\u4eae\u5340\u57df\uff1a\u984f\u8272\u8207\u76f8\u9130\u5340\u57df\u885d\u7a81\uff0c\u9700\u8981\u8abf\u6574',
    'help.section.mobile': '\u884c\u52d5\u88dd\u7f6e\u64cd\u4f5c\u63d0\u793a',
    'help.mobile.1': '\u7b2c\u4e00\u6b21\u9ede\u64ca\uff1a\u9078\u53d6\u5340\u57df',
    'help.mobile.2': '\u518d\u6b21\u9ede\u64ca\uff1a\u653e\u7f6e\u76ee\u524d\u9078\u64c7\u7684\u984f\u8272',
    'help.section.approach': '\u5c0f\u63d0\u793a\uff08\u53ef\u9078\uff09',
    'help.approach': '\u6162\u6162\u601d\u8003\u6bcf\u500b\u5340\u57df\u7684\u95dc\u4fc2\uff0c\n\u6709\u6642\u63db\u4e00\u7a2e\u984f\u8272\u914d\u7f6e\uff0c\u6574\u500b\u5730\u5716\u6703\u7a81\u7136\u8b8a\u5f97\u6e05\u695a\u3002',
    'help.close': '\u95dc\u9589',

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
