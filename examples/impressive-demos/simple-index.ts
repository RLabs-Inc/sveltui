/**
 * Simple SvelTUI Demo - Svelte 5 Breakthrough
 * 
 * This is a simplified version to showcase the core breakthrough
 */

import { render } from '../../src/renderer'

console.log('🚀 Starting Simple SvelTUI Demo...')
console.log('🎉 Showcasing Svelte 5 reactivity in terminal!')

// Launch the simple demo
render('examples/impressive-demos/simple-demo.svelte.mjs', {
  title: 'SvelTUI Simple Demo - Svelte 5 Working!',
  fullscreen: true,
  debug: true, // Enable debug to see what's happening
  props: {},
  blessed: {
    smartCSR: true,
    fastCSR: true,
    mouse: true,
    keys: true
  }
})

console.log('✨ Simple demo launched!')
console.log('You should see Svelte 5 reactivity working with auto-incrementing counter!')
console.log('Press q or Ctrl+C to exit')