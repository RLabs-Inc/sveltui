/**
 * SvelTUI Demo Application Entry Point
 */

import { render } from '../src/renderer'
// Use the compiled version with proper path
const App = 'examples/demo-app.svelte.mjs'

// Initial props for the demo
const initialProps = {
  title: 'SvelTUI Interactive Demo',
}

// Enable debug mode
const DEBUG = true

// Wrap the demo in an async IIFE to handle any async operations
;(async () => {
  try {
    console.log('Starting SvelTUI Demo...')

    // Render the demo application to the terminal
    const cleanup = render(App, {
      title: 'SvelTUI Demo',
      fullscreen: true,
      debug: DEBUG,
      props: initialProps,
      // Additional blessed config to help with terminal issues
      blessed: {
        fullUnicode: false, // Disable Unicode to avoid issues
        smartCSR: true, // Enable smart CSR for better rendering
        fastCSR: true, // Use fast CSR mode
        forceUnicode: false, // Don't force Unicode
        useBCE: true, // Use BCE for drawing
        cursor: {
          artificial: true, // Use artificial cursor
          shape: 'block', // Block cursor shape
          blink: true, // Enable cursor blinking
        },
      },
    })

    // Handle clean exit
    process.on('SIGINT', () => {
      console.log('Received SIGINT, cleaning up...')
      try {
        cleanup()
      } catch (err) {
        console.error('Error during cleanup:', err)
      }
      process.exit(0)
    })

    // Gracefully handle errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error)
      try {
        cleanup()
      } catch (err) {
        console.error('Error during cleanup:', err)
      }
      process.exit(1)
    })

    // For debugging
    console.log('SvelTUI Demo started. Press q or Ctrl+C to exit.')
  } catch (error) {
    console.error('Error starting SvelTUI Demo:', error)
    process.exit(1)
  }
})()
