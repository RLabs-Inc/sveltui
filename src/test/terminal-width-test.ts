#!/usr/bin/env bun

// Test to debug terminal width reporting vs actual drawable width
console.log('Terminal Width Debug:')
console.log('=====================')
console.log(`process.stdout.columns: ${process.stdout.columns}`)
console.log(`process.stdout.rows: ${process.stdout.rows}`)
console.log(`process.stdout.isTTY: ${process.stdout.isTTY}`)

// Test writing to the last column
const width = process.stdout.columns || 80
console.log(`\nTesting width ${width}:`)

// Clear line and write a line of exactly terminal width
process.stdout.write('\x1b[2K') // Clear line
process.stdout.write('\x1b[1G') // Move to column 1

// Write exactly width characters
for (let i = 0; i < width; i++) {
  process.stdout.write((i % 10).toString())
}

console.log('\n\nAbove should show 0-9 repeating to fill the width')
console.log('If the last digit is cut off, terminal reports wrong width')

// Test with borders
console.log('\n\nBorder test:')
process.stdout.write('\x1b[2K\x1b[1G') // Clear and move to start

// Top border
process.stdout.write('┌')
for (let i = 0; i < width - 2; i++) {
  process.stdout.write('─')
}
process.stdout.write('┐')

console.log('\n\nIf the right corner ┐ is missing, the width is wrong')

// Test ANSI positioning at last column
console.log('\n\nANSI position test:')
process.stdout.write('\x1b[2K') // Clear line
process.stdout.write(`\x1b[${width}G`) // Move to last column (1-based)
process.stdout.write('X')

console.log('\n\nIf X is not visible at the right edge, ANSI positioning fails at reported width')

// Create a visual ruler
console.log('\n\nVisual ruler:')
let ruler1 = ''
let ruler2 = ''
for (let i = 0; i < width; i++) {
  if (i % 10 === 0) {
    ruler1 += Math.floor(i / 10).toString()
    ruler2 += '0'
  } else {
    ruler1 += ' '
    ruler2 += (i % 10).toString()
  }
}
console.log(ruler1)
console.log(ruler2)

console.log('\n\nThe ruler should reach the right edge of your terminal')
console.log('Check if the last number is visible')