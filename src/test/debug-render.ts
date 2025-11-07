#!/usr/bin/env bun

// Debug script to check rendering dimensions
import { mount } from '../index.ts'
import { mount as mountComponent } from 'svelte'
import { terminalSize, contentHeight } from '../core/state/engine.svelte.ts'
import ComplexScrollDemo from './ComplexScrollDemo.svelte'

console.log('Starting debug render...')
console.log(`Terminal: ${process.stdout.columns}x${process.stdout.rows}`)

mount(
  () => {
    mountComponent(ComplexScrollDemo, {
      target: document.body,
    })

    // After mounting, check dimensions
    setTimeout(() => {
      console.log('\n\nDimensions after mount:')
      console.log(`Terminal size in engine: ${terminalSize.width}x${terminalSize.height}`)
      console.log(`Content height: ${contentHeight.value}`)
      console.log(`Fullscreen mode: ${terminalSize.fullscreen}`)
    }, 100)
  },
  { fullscreen: false }
)