#!/usr/bin/env bun --conditions browser

import { render } from '../src/api'

console.log('Testing simple component...')

try {
  const cleanup = render('examples/simple-test.svelte.mjs', {
    debug: true,
    title: 'Simple Test',
    fullscreen: true,
  })
  
  console.log('Component rendered successfully!')
} catch (error) {
  console.error('Failed to render:', error)
}