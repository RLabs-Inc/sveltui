#!/usr/bin/env bun
/**
 * Test blessed directly to confirm it works
 */
import blessed from 'blessed'

// Force terminal size
process.stdout.columns = 80
process.stdout.rows = 24

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Blessed Direct Test'
})

// Create a box with border
const box = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  }
})

// Create text inside box
const text = blessed.text({
  parent: box,
  top: 1,
  left: 'center',
  content: 'Hello from Blessed!',
  style: {
    fg: 'yellow'
  }
})

// Render
screen.render()

// Exit on q
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

console.log('Direct blessed test - press q to quit')