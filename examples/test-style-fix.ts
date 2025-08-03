#!/usr/bin/env bun --conditions browser

/**
 * Test style fix for SvelTUI
 */

// Ensure browser globals are set up first
import '../src/utils/browser-globals'

import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'
import BasicCounter from './basic-counter.svelte'

// Create the terminal screen
const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

// Create root element
const root = createTerminalRoot(screen)

// Set up global keyboard handler
screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

// Mount the component
console.log('Mounting component...')
const app = mount(BasicCounter, {
  target: root.domNode
})

// Focus the screen
screen.focusNext()

// Initial render
screen.render()

console.log('Component mounted, press +/- to interact, q to quit')