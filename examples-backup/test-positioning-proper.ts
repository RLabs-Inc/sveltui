/**
 * Proper test of blessed-compatible positioning
 * Tests both blessed native positioning and our position utilities
 */

import blessed from 'blessed'

// Create a screen with proper initialization
const screen = blessed.screen({
  smartCSR: true,
  title: 'SvelTUI Positioning Test',
  fullUnicode: true,
  forceUnicode: true,
  terminal: 'xterm-256color',
  warnings: true
})

// Title
screen.append(blessed.text({
  left: 'center',
  top: 0,
  content: '{yellow-fg}{bold}SvelTUI Positioning Test{/}',
  tags: true
}))

// Test 1: Native blessed center positioning
screen.append(blessed.box({
  left: 'center',
  top: 'center',
  width: 30,
  height: 5,
  border: 'line',
  content: '{center}Blessed Native Center\nleft="center" top="center"{/center}',
  tags: true,
  style: { 
    border: { fg: 'cyan' },
    fg: 'white'
  }
}))

// Test 2: Percentage positioning
screen.append(blessed.box({
  left: '25%',
  top: 3,
  width: '50%',
  height: 4,
  border: 'line',
  content: '50% Width\nleft="25%" width="50%"',
  style: { 
    border: { fg: 'green' },
    fg: 'white'
  }
}))

// Test 3: Relative offsets
screen.append(blessed.box({
  left: '50%-15',
  top: '50%+3',
  width: 30,
  height: 4,
  border: 'line',
  content: 'Offset Position\nleft="50%-15" top="50%+3"',
  style: { 
    border: { fg: 'yellow' },
    fg: 'white'
  }
}))

// Test 4: Right/Bottom positioning
screen.append(blessed.box({
  right: 2,
  bottom: 2,
  width: 25,
  height: 4,
  border: 'line',
  content: 'Bottom Right\nright=2 bottom=2',
  style: { 
    border: { fg: 'magenta' },
    fg: 'white'
  }
}))

// Test 5: Width from constraints
screen.append(blessed.box({
  left: 2,
  right: '50%+2',
  top: '75%',
  height: 4,
  border: 'line',
  content: 'Constraint Width\nleft=2 right="50%+2"',
  style: { 
    border: { fg: 'blue' },
    fg: 'white'
  }
}))

// Test 6: Full width minus
screen.append(blessed.box({
  left: 2,
  top: 8,
  width: '100%-4',
  height: 3,
  border: 'line',
  content: 'width="100%-4" (full width minus 4 chars)',
  style: { 
    border: { fg: 'red' },
    fg: 'white'
  }
}))

// Test 7: Shrink sizing
screen.append(blessed.box({
  left: 2,
  bottom: 8,
  width: 'shrink',
  height: 'shrink',
  border: 'line',
  content: 'This box shrinks to content',
  style: { 
    border: { fg: 'white' },
    fg: 'white'
  }
}))

// Exit instructions
screen.append(blessed.text({
  left: 'center',
  bottom: 0,
  content: '{gray-fg}Press q or Ctrl+C to quit{/}',
  tags: true
}))

// Exit on q or Ctrl+C
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

// Initial render
screen.render()

console.log('Positioning test started. Press q or Ctrl+C to quit.')