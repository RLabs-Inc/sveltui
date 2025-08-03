import { render } from '../src/api'
import SimpleMouseTest from './simple-mouse-test.svelte.mjs'

// Render the simple mouse test
const app = await render(SimpleMouseTest, {
  debug: false,
  title: 'Simple Mouse Test',
  props: {}
})

console.log('Simple Mouse Test is running!')
console.log('Move your mouse to see coordinates.')
console.log('Press q or Ctrl+C to quit.')