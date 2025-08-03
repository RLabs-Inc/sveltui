/**
 * Debug test of blessed-compatible positioning
 * Tests the position utilities with debug output
 */

import blessed from 'blessed'
import { calculateElementPosition } from '../src/dom/position-utils'

// Create a screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'SvelTUI Positioning Test',
  debug: true,
  log: './positioning-debug.log'
})

// Log screen dimensions
screen.debug(`Screen dimensions: ${screen.cols}x${screen.rows}`)

// Test calculations
const tests = [
  {
    name: 'Center',
    props: { left: 'center', top: 'center', width: 30, height: 5 },
    contentSize: { width: 30, height: 5 }
  },
  {
    name: 'Percentage',
    props: { left: '25%', top: 3, width: '50%', height: 4 }
  },
  {
    name: 'Offset',
    props: { left: '50%-15', top: '50%+3', width: 30, height: 4 }
  },
  {
    name: 'Bottom Right',
    props: { right: 2, bottom: 2, width: 25, height: 4 }
  },
  {
    name: 'Constraint',
    props: { left: 2, right: '50%+2', top: '75%', height: 4 }
  },
  {
    name: 'Full Minus',
    props: { left: 2, top: 8, width: '100%-4', height: 3 }
  }
]

// Calculate and log positions
tests.forEach(test => {
  const calculated = calculateElementPosition(test.props, screen, test.contentSize)
  screen.debug(`${test.name}: ${JSON.stringify(calculated)}`)
})

// Create boxes with calculated positions
const centered = blessed.box({
  ...calculateElementPosition(
    { left: 'center', top: 'center', width: 30, height: 5 },
    screen,
    { width: 30, height: 5 }
  ),
  border: 'line',
  content: 'Centered Box\nleft="center" top="center"',
  style: { border: { fg: 'cyan' } }
})
screen.append(centered)

// Exit on q or Ctrl+C
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

// Focus and render
screen.render()

// Keep process alive
setInterval(() => {
  screen.render()
}, 100)