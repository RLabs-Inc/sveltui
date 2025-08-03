#!/usr/bin/env bun
/**
 * Debug with forced screen size
 */
import blessed from 'blessed'
import { happyDomToTerminal } from '../src/renderer/bridge'
import { createElement } from '../src/dom/factories'

// Setup browser globals
import '../src/utils/browser-globals'

console.log('Creating screen with forced size...')

// Force terminal size
process.stdout.columns = 80
process.stdout.rows = 24

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Test',
  width: 80,
  height: 24,
  // Force a size
  forceUnicode: false
})

console.log('Screen created with size:', screen.width + 'x' + screen.height)

// Create root element
const rootElement = createElement('box', {
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  content: '',
  style: {
    fg: 'white',
    bg: undefined
  }
})

// Create blessed element
rootElement.create(screen)

// Create Happy DOM elements
const happyBox = document.createElement('box')
happyBox.setAttribute('width', '100%')
happyBox.setAttribute('height', '100%')
happyBox.setAttribute('border', JSON.stringify({ type: 'line' }))
happyBox.setAttribute('style', JSON.stringify({ border: { fg: 'cyan' } }))

const happyText = document.createElement('text')
happyText.setAttribute('top', '1')
happyText.setAttribute('left', 'center')
happyText.setAttribute('content', 'Hello from Debug Test!')
happyText.setAttribute('style', JSON.stringify({ fg: 'yellow' }))

// Add text to box
happyBox.appendChild(happyText)

// Convert to terminal
const terminalBox = happyDomToTerminal(happyBox, rootElement)

console.log('Rendering...')

// Force a resize event
screen.emit('resize')

// Render
screen.render()

// Quit on q
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

console.log('Press q to quit.')