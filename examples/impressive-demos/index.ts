/**
 * SvelTUI Impressive Demos Launcher
 * 
 * This showcases the breakthrough achievement of Svelte 5 client-side mounting
 * working in a Node.js terminal environment with full reactivity!
 * 
 * Features demonstrated:
 * - Svelte 5 Runes ($state, $derived, $effect)
 * - Reactive theme system with live switching
 * - Complex component interactions
 * - Real-time updates and animations
 * - Terminal-optimized layouts
 * - Browser globals compatibility
 */

import { render } from '../../src/renderer'

console.log('🚀 Starting SvelTUI Impressive Demos...')
console.log('🎉 Showcasing Svelte 5 + Terminal UI breakthrough!')

// Launch the demo launcher with full options
render('examples/impressive-demos/demo-launcher.svelte.mjs', {
  title: 'SvelTUI Demos - Svelte 5 Terminal Breakthrough!',
  fullscreen: true,
  debug: false, // Clean experience for demos
  props: {
    title: 'SvelTUI Interactive Demonstrations'
  },
  blessed: {
    // Optimized settings for smooth demo experience
    fullUnicode: true,
    smartCSR: true,
    fastCSR: true,
    forceUnicode: false,
    useBCE: true,
    cursor: {
      artificial: true,
      shape: 'block',
      blink: true
    },
    // Enable mouse support for interactive demos
    mouse: true,
    keys: true
  }
})

console.log('✨ SvelTUI Demos loaded successfully!')
console.log('🎮 Use arrow keys and Enter to navigate demos')
console.log('🎨 Each demo showcases different aspects of Svelte 5 + Terminal UI')
console.log('🌈 Try the theme showcase to see dynamic theming in action!')
console.log('')
console.log('Press q or Ctrl+C to exit demos')