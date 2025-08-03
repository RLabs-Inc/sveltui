#!/usr/bin/env bun --conditions browser
import { createRenderer } from '../src/renderer/svelte-renderer.js'
import ManualCounter from './manual-counter.svelte.mjs'

const renderer = createRenderer({
  title: 'SvelTUI - Manual Counter Demo',
  debug: false
})

console.log('✅ Manual Counter Demo is running!')
console.log('Control the counter yourself - no auto-increment!')
console.log('Watch the text color change: Even=Green, Odd=Yellow')

renderer.mount(ManualCounter)