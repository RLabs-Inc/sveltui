#!/usr/bin/env bun
/**
 * Direct render test with debug logging
 */
import blessed from 'blessed'
import { happyDomToTerminal } from '../src/renderer/bridge'
import { createElement } from '../src/dom/factories'

// Setup browser globals
import '../src/utils/browser-globals'

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Test'
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

console.log('Happy DOM structure:')
console.log('Box innerHTML:', happyBox.innerHTML)
console.log('Box outerHTML:', happyBox.outerHTML)
console.log('Text content attribute:', happyText.getAttribute('content'))
console.log('Text innerHTML:', happyText.innerHTML)
console.log('Text textContent:', happyText.textContent)

// Convert to terminal
console.log('\nConverting to terminal...')
const terminalBox = happyDomToTerminal(happyBox, rootElement)

console.log('\nTerminal structure:')
console.log('Terminal box:', terminalBox?.type, terminalBox?.props)
if (terminalBox?.children) {
  console.log('Children count:', terminalBox.children.length)
  terminalBox.children.forEach((child, i) => {
    console.log(`Child ${i}:`, child.type, child.props)
  })
}

// Render
screen.render()

// Quit on q
screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

console.log('\nPress q to quit.')