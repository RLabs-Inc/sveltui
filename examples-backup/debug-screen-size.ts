#!/usr/bin/env bun
/**
 * Debug screen sizing issue
 */
import blessed from 'blessed'
import fs from 'fs'

// Create log file
const logFile = fs.createWriteStream('debug-screen-size.log', { flags: 'w' })
const log = (msg: any) => {
  logFile.write(msg + '\n')
  console.log(msg)
}

log('Creating screen...')

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Screen Size'
})

log('Screen dimensions: ' + screen.width + 'x' + screen.height)

// Create box
const box = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: { type: 'line' },
  style: {
    border: { fg: 'cyan' }
  }
})

log('Box created')
log('Box dimensions before render: ' + box.width + 'x' + box.height)

// Render once
screen.render()

log('First render complete')
log('Screen dimensions after render: ' + screen.width + 'x' + screen.height)
log('Box dimensions after render: ' + box.width + 'x' + box.height)

// Now add text
const text = blessed.text({
  parent: box,
  top: 1,
  left: 'center',
  content: 'Hello Screen Size Test!',
  style: {
    fg: 'yellow'
  }
})

log('Text created')

// Render again
screen.render()

log('Second render complete')
log('Final box dimensions: ' + box.width + 'x' + box.height)
log('Text dimensions: ' + text.width + 'x' + text.height)
log('Text position: top=' + text.top + ', left=' + text.left)

// Check content
setTimeout(() => {
  const lines = screen.lines
  log('\nScreen content:')
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i] && lines[i].length > 0) {
      const lineText = lines[i].map((cell: any) => {
        if (Array.isArray(cell) && cell.length >= 2) {
          return cell[1] || ' ';
        }
        return ' ';
      }).join('');
      log(`Line ${i}: "${lineText}"`);
    }
  }
  
  logFile.end()
  process.exit(0)
}, 100)

// Quit on q
screen.key(['q', 'C-c'], () => {
  logFile.end()
  process.exit(0)
})