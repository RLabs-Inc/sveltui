/**
 * Direct comparison of blessed positioning vs our calculations
 */

import blessed from 'blessed'
import { calculateElementPosition, getParentDimensions } from '../src/dom/position-utils'

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Position Comparison'
})

// Create a parent box to test child positioning
const parent = blessed.box({
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  border: 'line',
  style: {
    border: { fg: 'white' }
  }
})
screen.append(parent)

// After render, get actual dimensions
screen.render()

console.log('Screen dimensions:', screen.width, 'x', screen.height)
console.log('Screen cols/rows:', screen.cols, 'x', screen.rows)
console.log('Parent dimensions:', parent.width, 'x', parent.height)

// Test our calculations
const parentDims = getParentDimensions(parent)
console.log('Calculated parent dims:', parentDims)

// Test center calculation
const centerCalc = calculateElementPosition(
  { left: 'center', top: 'center', width: 30, height: 5 },
  parent,
  { width: 30, height: 5 }
)
console.log('Center calculation:', centerCalc)

// Create centered box with blessed native
const centered = blessed.box({
  parent: parent,
  left: 'center',
  top: 'center',
  width: 30,
  height: 5,
  border: 'line',
  content: 'Native Blessed Center',
  style: { border: { fg: 'cyan' } }
})

// Render and check actual position
screen.render()
console.log('Blessed centered position:', {
  left: centered.left,
  top: centered.top,
  width: centered.width,
  height: centered.height,
  aleft: centered.aleft,
  atop: centered.atop
})

// Test percentage
const percentCalc = calculateElementPosition(
  { left: '25%', width: '50%', top: 2, height: 3 },
  parent
)
console.log('Percentage calculation:', percentCalc)

process.exit(0)