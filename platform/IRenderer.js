export class IRenderer {
  renderMap(regions, adjacency) { throw new Error('Not implemented'); }
  updateRegion(regionId, region) { throw new Error('Not implemented'); }
  applyHighlights(highlightState) { throw new Error('Not implemented'); }
  updateColorPalette(selectedColor) { throw new Error('Not implemented'); }
  updateTimer(seconds) { throw new Error('Not implemented'); }
  updateMoves(moves) { throw new Error('Not implemented'); }
  updateRemaining(count) { throw new Error('Not implemented'); }
  showCompletionModal(data) { throw new Error('Not implemented'); }
  showToast(message, kind) { throw new Error('Not implemented'); }
}
