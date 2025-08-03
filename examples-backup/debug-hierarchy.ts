#!/usr/bin/env bun
/**
 * Debug blessed hierarchy
 */
import blessed from 'blessed'
import fs from 'fs'

// Create log file
const logFile = fs.createWriteStream('debug-hierarchy.log', { flags: 'w' })
const log = (msg: any) => {
  logFile.write(msg + '\n')
  console.log(msg)
}

log('Creating blessed elements directly...')

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Hierarchy Test'
})

// Create box directly with blessed
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

log('Box created and attached to screen')

// Create text directly with blessed
const text = blessed.text({
  parent: box,
  top: 1,
  left: 'center',
  content: 'Direct Blessed Text!',
  style: {
    fg: 'yellow'
  }
})

log('Text created and attached to box')
log('Text content: ' + text.content)
log('Text parent: ' + (text.parent === box))
log('Box children count: ' + box.children.length)

// Render
screen.render()
log('Screen rendered')

// Check hierarchy
setTimeout(() => {
  log('\n=== Hierarchy Check ===')
  log('Screen children: ' + screen.children.length)
  log('Box parent: ' + (box.parent === screen))
  log('Box position: top=' + box.top + ', left=' + box.left)
  log('Box dimensions: width=' + box.width + ', height=' + box.height)
  log('Text position: top=' + text.top + ', left=' + text.left)
  log('Text visible: ' + text.visible)
  log('Text hidden: ' + text.hidden)
  
  // Check actual screen content
  const lines = screen.lines
  log('\nScreen lines: ' + lines.length)
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
}, 500)

// Quit on q
screen.key(['q', 'C-c'], () => {
  logFile.end()
  process.exit(0)
})