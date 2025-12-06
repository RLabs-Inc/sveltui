// ============================================================================
// SVELTUI V2 - DEBUG PANEL
// Floating debug panel that shows keyboard and state info
// ============================================================================

import { getEngine } from '../core/state/engine.svelte.ts'

const engine = getEngine()

// Debug state
let debugVisible = $state(false) // Start hidden, toggle with Ctrl+P
let lastKey = $state('')
let lastRawKey = $state('')
let keyHistory = $state<string[]>([])

// Panel component indices
let panelBoxIndex = -1
let panelTitleIndex = -1
let panelKeyIndex = -1
let panelFocusIndex = -1
let panelStatsIndex = -1
let panelHistoryIndex = -1

export function toggleDebugPanel() {
  debugVisible = !debugVisible

  if (debugVisible) {
    createDebugPanel()
  } else {
    destroyDebugPanel()
  }
}

export function updateDebugKey(key: string, raw: string) {
  lastKey = key
  lastRawKey = raw

  // Convert raw to hex for better display
  const hexRaw = Array.from(raw)
    .map((c) => {
      const code = c.charCodeAt(0)
      return `0x${code.toString(16).padStart(2, '0')}`
    })
    .join(' ')

  // Add to history (keep last 5)
  keyHistory = [...keyHistory.slice(-4), `${key} (${hexRaw})`]

  // Update display if panel is visible
  if (debugVisible && panelKeyIndex >= 0) {
    engine().texts[
      panelKeyIndex
    ] = `Key: "${key}" | Raw: ${hexRaw} | JSON: ${JSON.stringify(raw)}`
    engine().texts[panelFocusIndex] = `Focus: ${
      engine().focus.index
    } | Focusables: ${engine().focusableCount}`
    engine().texts[panelStatsIndex] = `Active: ${
      engine().activeCount
    } | Visible: ${engine().visibleComponents.length}`
    engine().texts[panelHistoryIndex] = `History: ${keyHistory
      .slice(-3)
      .join(' > ')}`
  }
}

function createDebugPanel() {
  const width = 60
  const height = 8
  const x = engine().terminalSize.width - width - 2
  const y = 2

  // Create box
  const boxId = 'debug-panel-box'
  panelBoxIndex = engine().allocateIndex(boxId)
  engine().componentType[panelBoxIndex] = 1 // BOX
  engine().positions[panelBoxIndex * 4] = x
  engine().positions[panelBoxIndex * 4 + 1] = y
  engine().positions[panelBoxIndex * 4 + 2] = width
  engine().positions[panelBoxIndex * 4 + 3] = height
  engine().borderStyles[panelBoxIndex] = 2 // double border
  engine().borderColors[panelBoxIndex * 2] = 0xff00ff // Magenta
  engine().colors[panelBoxIndex * 2 + 1] = 0x000033 // Dark blue bg
  engine().visibility[panelBoxIndex] = true
  engine().zIndex[panelBoxIndex] = 9999 // Always on top

  // Title
  const titleId = 'debug-panel-title'
  panelTitleIndex = engine().allocateIndex(titleId)
  engine().componentType[panelTitleIndex] = 0 // TEXT
  engine().positions[panelTitleIndex * 4] = x + 2
  engine().positions[panelTitleIndex * 4 + 1] = y + 1
  engine().positions[panelTitleIndex * 4 + 2] = width - 4
  engine().positions[panelTitleIndex * 4 + 3] = 1
  engine().texts[panelTitleIndex] = '=== DEBUG PANEL (Ctrl+P to toggle) ==='
  engine().colors[panelTitleIndex * 2] = 0x00ffff // Cyan
  engine().visibility[panelTitleIndex] = true
  engine().zIndex[panelTitleIndex] = 10000

  // Key info
  const keyId = 'debug-panel-key'
  panelKeyIndex = engine().allocateIndex(keyId)
  engine().componentType[panelKeyIndex] = 0 // TEXT
  engine().positions[panelKeyIndex * 4] = x + 2
  engine().positions[panelKeyIndex * 4 + 1] = y + 2
  engine().positions[panelKeyIndex * 4 + 2] = width - 4
  engine().positions[panelKeyIndex * 4 + 3] = 1
  engine().texts[panelKeyIndex] = `Key: "${lastKey}" | Raw: ${JSON.stringify(
    lastRawKey
  )}`
  engine().colors[panelKeyIndex * 2] = 0xffff00 // Yellow
  engine().visibility[panelKeyIndex] = true
  engine().zIndex[panelKeyIndex] = 10000

  // Focus info
  const focusId = 'debug-panel-focus'
  panelFocusIndex = engine().allocateIndex(focusId)
  engine().componentType[panelFocusIndex] = 0 // TEXT
  engine().positions[panelFocusIndex * 4] = x + 2
  engine().positions[panelFocusIndex * 4 + 1] = y + 3
  engine().positions[panelFocusIndex * 4 + 2] = width - 4
  engine().positions[panelFocusIndex * 4 + 3] = 1
  engine().texts[panelFocusIndex] = `Focus: ${
    engine().focus.index
  } | Focusables: ${engine().focusableCount}`
  engine().colors[panelFocusIndex * 2] = 0x00ff00 // Green
  engine().visibility[panelFocusIndex] = true
  engine().zIndex[panelFocusIndex] = 10000

  // Stats
  const statsId = 'debug-panel-stats'
  panelStatsIndex = engine().allocateIndex(statsId)
  engine().componentType[panelStatsIndex] = 0 // TEXT
  engine().positions[panelStatsIndex * 4] = x + 2
  engine().positions[panelStatsIndex * 4 + 1] = y + 4
  engine().positions[panelStatsIndex * 4 + 2] = width - 4
  engine().positions[panelStatsIndex * 4 + 3] = 1
  engine().texts[panelStatsIndex] = `Active: ${
    engine().activeCount
  } | Visible: ${engine().visibleComponents.length}`
  engine().colors[panelStatsIndex * 2] = 0x8888ff // Light blue
  engine().visibility[panelStatsIndex] = true
  engine().zIndex[panelStatsIndex] = 10000

  // History
  const historyId = 'debug-panel-history'
  panelHistoryIndex = engine().allocateIndex(historyId)
  engine().componentType[panelHistoryIndex] = 0 // TEXT
  engine().positions[panelHistoryIndex * 4] = x + 2
  engine().positions[panelHistoryIndex * 4 + 1] = y + 5
  engine().positions[panelHistoryIndex * 4 + 2] = width - 4
  engine().positions[panelHistoryIndex * 4 + 3] = 1
  engine().texts[panelHistoryIndex] = `History: ${keyHistory
    .slice(-3)
    .join(' > ')}`
  engine().colors[panelHistoryIndex * 2] = 0x808080 // Gray
  engine().visibility[panelHistoryIndex] = true
  engine().zIndex[panelHistoryIndex] = 10000
}

function destroyDebugPanel() {
  if (panelBoxIndex >= 0) {
    engine().releaseIndex('debug-panel-box')
    panelBoxIndex = -1
  }
  if (panelTitleIndex >= 0) {
    engine().releaseIndex('debug-panel-title')
    panelTitleIndex = -1
  }
  if (panelKeyIndex >= 0) {
    engine().releaseIndex('debug-panel-key')
    panelKeyIndex = -1
  }
  if (panelFocusIndex >= 0) {
    engine().releaseIndex('debug-panel-focus')
    panelFocusIndex = -1
  }
  if (panelStatsIndex >= 0) {
    engine().releaseIndex('debug-panel-stats')
    panelStatsIndex = -1
  }
  if (panelHistoryIndex >= 0) {
    engine().releaseIndex('debug-panel-history')
    panelHistoryIndex = -1
  }
}

export function getDebugPanel() {
  return () => ({
    visible: debugVisible,
    toggle: toggleDebugPanel,
    updateKey: updateDebugKey,
    lastKey,
    lastRawKey,
    keyHistory,
  })
}
