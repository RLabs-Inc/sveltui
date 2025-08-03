#!/usr/bin/env bun --conditions browser
import { createRenderer } from '../src/renderer/svelte-renderer.js'
import PerformanceCounter from './performance-counter.svelte.mjs'

const renderer = createRenderer({
  title: 'SvelTUI - Performance Counter Demo',
  debug: false
})

console.log('🚀 Performance Counter Demo - Testing Keyboard Responsiveness!')
console.log('Press +/- rapidly to test response time - target is <16ms')

renderer.mount(PerformanceCounter)