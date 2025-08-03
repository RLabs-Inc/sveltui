/**
 * Focus Management Demo Launcher
 * 
 * This launcher demonstrates the focus context system with tab navigation,
 * focus traps, and visual indicators.
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { render } from '../src/renderer'
import { mount } from 'svelte'

// Set up browser globals for Svelte 5
setupBrowserGlobals()

// Import compiled component
import FocusManagementDemo from './focus-management-demo.svelte.mjs'

// Create the app with the focus management demo
const screen = render(() => {
  const app = mount(FocusManagementDemo, {
    target: document.body
  })
  
  return app
})

// Handle exit
if (screen && screen.key) {
  screen.key(['q', 'C-c'], () => {
    process.exit(0)
  })
} else {
  // Fallback for when screen.key is not available
  setTimeout(() => {
    const s = (global as any).screen
    if (s && s.key) {
      s.key(['q', 'C-c'], () => {
        process.exit(0)
      })
    }
  }, 100)
}

console.log('Focus Management Demo')
console.log('=====================')
console.log('Tab: Navigate forward')
console.log('Shift+Tab: Navigate backward')
console.log('Enter: Activate buttons')
console.log('Escape: Close modal')
console.log('q or Ctrl+C: Exit')