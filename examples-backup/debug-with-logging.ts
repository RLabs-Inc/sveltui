#!/usr/bin/env bun
/**
 * Debug render test that logs to file
 */
import blessed from 'blessed'
import { happyDomToTerminal } from '../src/renderer/bridge'
import { createElement } from '../src/dom/factories'
import fs from 'fs'

// Setup browser globals
import '../src/utils/browser-globals'

// Create log file
const logFile = fs.createWriteStream('debug-render.log', { flags: 'w' })
const log = (msg: any) => {
  logFile.write(msg + '\n')
  console.log(msg)
}

log('Starting debug render test...')

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Test'
})

log('Screen created')

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

log('Root element created: ' + rootElement.type)

// Create blessed element
rootElement.create(screen)
log('Root blessed element created')

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

log('Happy DOM structure created')

// Convert to terminal
const terminalBox = happyDomToTerminal(happyBox, rootElement)
log('Converted to terminal')

// Check blessed elements
if (terminalBox && terminalBox.blessed) {
  log('Terminal box has blessed element')
  log('Box content: ' + terminalBox.blessed.content)
  
  if (terminalBox.children.length > 0) {
    const textChild = terminalBox.children[0]
    log('Text child type: ' + textChild.type)
    log('Text child props content: ' + textChild.props.content)
    
    if (textChild.blessed) {
      log('Text child has blessed element')
      log('Text blessed content: ' + textChild.blessed.content)
      log('Text blessed getText: ' + (textChild.blessed as any).getText?.())
    } else {
      log('Text child has NO blessed element!')
    }
  }
} else {
  log('Terminal box has NO blessed element!')
}

// Force render
screen.render()
log('Screen rendered')

// Check what's actually on screen after render
setTimeout(() => {
  log('\n=== After render check ===')
  if (terminalBox && terminalBox.children.length > 0) {
    const textChild = terminalBox.children[0]
    if (textChild.blessed) {
      log('Text blessed content after render: ' + textChild.blessed.content)
      const lines = screen.lines
      log('Screen lines count: ' + lines.length)
      // Log first few lines of actual screen content
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        log(`Line ${i}: ${JSON.stringify(lines[i])}`)
      }
    }
  }
  
  // Exit after logging
  setTimeout(() => {
    logFile.end()
    process.exit(0)
  }, 100)
}, 500)

// Quit on q
screen.key(['q', 'C-c'], () => {
  logFile.end()
  process.exit(0)
})