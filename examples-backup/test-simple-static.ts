#!/usr/bin/env bun
/**
 * Simple static test using the fixed rendering pipeline
 */
import { happyDomToTerminal } from '../src/renderer/bridge'
import { createElement } from '../src/dom/factories'
import { createScreen } from '../src/renderer/screen'

// Setup browser globals
import '../src/utils/browser-globals'

// Create screen
const screen = createScreen({
  title: 'Simple Static Test'
})

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

// Create blessed element - screen is a blessed box, so we can use it as parent
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
happyText.setAttribute('content', 'SvelTUI is working!')
happyText.setAttribute('style', JSON.stringify({ fg: 'yellow' }))

// Add another text element
const happyText2 = document.createElement('text')
happyText2.setAttribute('top', '3')
happyText2.setAttribute('left', 'center')
happyText2.setAttribute('content', 'Press q to quit')
happyText2.setAttribute('style', JSON.stringify({ fg: 'green' }))

// Build DOM tree
happyBox.appendChild(happyText)
happyBox.appendChild(happyText2)

// Convert to terminal
happyDomToTerminal(happyBox, rootElement)

// Render
screen.render()

// Exit on q
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})