/**
 * Example: Using the Browser Globals Utility
 * 
 * This example shows how to use the browser globals utility
 * independently for Node.js projects that need Svelte 5 client-side.
 */

// Import the browser globals utility
import { 
  setupBrowserGlobals, 
  isBrowserGlobalsSetup, 
  clearBrowserGlobals,
  type BrowserGlobalsOptions 
} from '../src/utils/browser-globals'

console.log('🔧 Browser Globals Utility Example')
console.log('='.repeat(40))

// Check initial state
console.log('1. Initial state:')
console.log('   Browser globals setup:', isBrowserGlobalsSetup())

// Clear globals to demonstrate setup
clearBrowserGlobals()
console.log('   After clearing:', isBrowserGlobalsSetup())

// Setup with default options
console.log('\n2. Setting up with defaults...')
setupBrowserGlobals()
console.log('   Browser globals setup:', isBrowserGlobalsSetup())
console.log('   window.navigator.userAgent:', (globalThis as any).window?.navigator?.userAgent)

// Clear and setup with custom options
console.log('\n3. Setting up with custom options...')
clearBrowserGlobals()

const customOptions: BrowserGlobalsOptions = {
  windowProps: {
    customProperty: 'Hello from custom window!',
    myTerminalApp: {
      name: 'MyApp',
      version: '1.0.0'
    }
  }
}

setupBrowserGlobals(customOptions)
console.log('   Custom window property:', (globalThis as any).window?.customProperty)
console.log('   Custom app info:', (globalThis as any).window?.myTerminalApp)

// Demonstrate that Svelte client-side import would now work
console.log('\n4. Verifying Svelte compatibility globals:')
console.log('   ✓ window:', typeof (globalThis as any).window)
console.log('   ✓ document:', typeof (globalThis as any).document)
console.log('   ✓ Element:', typeof (globalThis as any).Element)
console.log('   ✓ Node:', typeof (globalThis as any).Node)

// Show that we can access DOM methods
console.log('\n5. Testing DOM methods:')
const doc = (globalThis as any).document
const element = doc.createElement('div')
const textNode = doc.createTextNode('Hello Terminal!')
console.log('   Created element:', element.tagName || element.nodeName)
console.log('   Created text node:', textNode.nodeValue)

console.log('\n✅ Browser globals utility working correctly!')
console.log('\nNow you can safely use:')
console.log('   import { mount } from "svelte"')
console.log('   // Svelte client-side APIs work in Node.js!')