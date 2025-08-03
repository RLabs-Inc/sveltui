import { render } from '../src/api'
import MouseTrackingDemo from './mouse-tracking-demo.svelte.mjs'

// Render the mouse tracking demo
const app = await render(MouseTrackingDemo, {
  debug: false,
  title: 'SvelTUI Mouse Tracking Demo',
  props: {}
})

console.log('Mouse Tracking Demo is running! Move your mouse around.')
console.log('Press q or Ctrl+C to quit.')