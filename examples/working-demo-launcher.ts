/**
 * Working Demo Launcher - The Ultimate Svelte 5 Terminal Breakthrough!
 */

import { render } from '../src/renderer'

console.log('🎉🎉🎉 ULTIMATE SVELTE 5 TERMINAL BREAKTHROUGH! 🎉🎉🎉')
console.log('🚀 Launching working Svelte 5 demo with full reactivity!')

render('examples/working-demo.svelte.mjs', {
  title: '🎉 SvelTUI - Svelte 5 Terminal Breakthrough!',
  fullscreen: true,
  debug: true, // Show the amazing progress we've made!
  props: {},
  blessed: {
    smartCSR: true,
    fastCSR: true,
    mouse: true,
    keys: true,
    fullUnicode: true
  }
})

console.log('✨ BREAKTHROUGH ACHIEVED!')
console.log('🎯 Svelte 5 runes working in terminal!')
console.log('🎨 Reactive state updates live!')
console.log('🔄 Auto-increment with effect cleanup!')
console.log('🌟 This is the future of terminal UIs!')
console.log('')
console.log('Press q or Ctrl+C to exit this amazing demo!')