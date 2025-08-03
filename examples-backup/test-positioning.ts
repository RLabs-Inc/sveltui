/**
 * Direct test of blessed-compatible positioning
 * Tests the position utilities without Svelte components
 */

import blessed from 'blessed'
import { calculateElementPosition } from '../src/dom/position-utils'

// Create a screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'SvelTUI Positioning Test'
})

// Test 1: Center positioning
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

// Test 2: Percentage positioning
const percentage = blessed.box({
  ...calculateElementPosition(
    { left: '25%', top: 3, width: '50%', height: 4 },
    screen
  ),
  border: 'line',
  content: '50% Width\nleft="25%" width="50%"',
  style: { border: { fg: 'green' } }
})
screen.append(percentage)

// Test 3: Relative offsets
const offset = blessed.box({
  ...calculateElementPosition(
    { left: '50%-15', top: '50%+3', width: 30, height: 4 },
    screen
  ),
  border: 'line',
  content: 'Offset Position\nleft="50%-15" top="50%+3"',
  style: { border: { fg: 'yellow' } }
})
screen.append(offset)

// Test 4: Right/Bottom positioning
const bottomRight = blessed.box({
  ...calculateElementPosition(
    { right: 2, bottom: 2, width: 25, height: 4 },
    screen
  ),
  border: 'line',
  content: 'Bottom Right\nright=2 bottom=2',
  style: { border: { fg: 'magenta' } }
})
screen.append(bottomRight)

// Test 5: Width from constraints
const constraint = blessed.box({
  ...calculateElementPosition(
    { left: 2, right: '50%+2', top: '75%', height: 4 },
    screen
  ),
  border: 'line',
  content: 'Constraint Width\nleft=2 right="50%+2"',
  style: { border: { fg: 'blue' } }
})
screen.append(constraint)

// Test 6: Full width minus
const fullMinus = blessed.box({
  ...calculateElementPosition(
    { left: 2, top: 8, width: '100%-4', height: 3 },
    screen
  ),
  border: 'line',
  content: 'width="100%-4" (full width minus 4 chars)',
  style: { border: { fg: 'red' } }
})
screen.append(fullMinus)

// Test 7: Shrink (with content size)
const shrink = blessed.box({
  ...calculateElementPosition(
    { left: 2, bottom: 8, width: 'shrink', height: 'shrink' },
    screen,
    { width: 28, height: 3 } // Content size
  ),
  border: 'line',
  content: 'This box shrinks to content',
  style: { border: { fg: 'white' } }
})
screen.append(shrink)

// Title
const title = blessed.text({
  ...calculateElementPosition(
    { left: 'center', top: 0, width: 'shrink', height: 1 },
    screen,
    { width: 24, height: 1 }
  ),
  content: 'SvelTUI Positioning Test',
  style: { fg: 'yellow', bold: true }
})
screen.append(title)

// Exit instructions
const exitText = blessed.text({
  ...calculateElementPosition(
    { left: 'center', bottom: 0, width: 'shrink', height: 1 },
    screen,
    { width: 25, height: 1 }
  ),
  content: 'Press q or Ctrl+C to quit',
  style: { fg: 'gray' }
})
screen.append(exitText)

// Exit on q or Ctrl+C
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

// Focus and render
screen.render()

console.log('Positioning test started. Press q or Ctrl+C to quit.')