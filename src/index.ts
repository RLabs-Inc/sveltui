// ============================================================================
// SVELTUI - PUBLIC API
// Framework exports
// ============================================================================

// SVELTUI INITIALIZATION
// Sets up the environment before any components load
// Register Happy DOM globals immediately when sveltui is imported
// This ensures DOM is available for all Svelte operations
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

// Ensure we have what Svelte needs
if (!global.document || !global.window) {
  throw new Error('SvelTUI: Failed to initialize Happy DOM environment')
}

// Mount function
export { mount, type MountOptions } from './mount.svelte.ts'

// Keyboard - clean event emitter API
export { keyboard, type KeyboardEvent } from './input/keyboard.svelte.ts'

// Components - export the actual Svelte components
export { default as Text } from './components/Text.svelte'
export { default as Box } from './components/Box.svelte'
