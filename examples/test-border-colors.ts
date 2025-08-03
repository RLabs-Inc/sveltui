#!/usr/bin/env bun --conditions browser
import { createRenderer } from '../src/renderer/svelte-renderer.js'
import ManualCounter from './manual-counter.svelte.mjs'

const renderer = createRenderer({
  title: 'SvelTUI - Border Color Test',
  debug: false
})

console.log('✅ Testing Border Colors - Fixed!')
console.log('Press + to increment and watch border color change from green → red at count > 5')
console.log('Current colors should be:')
console.log('- Main box: Cyan')
console.log('- Counter box: Green (changes to red when count > 5)')
console.log('- Instructions box: Blue')
console.log('🎯 Demo running! Press + multiple times to see border color change green → red')

renderer.mount(ManualCounter)