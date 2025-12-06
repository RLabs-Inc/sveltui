// ============================================================================
// SVELTUI MOUNT FUNCTION
// Sets up terminal, input, layout, and rendering
// ============================================================================

import { terminalSize, setTerminalSize } from './core/state/engine.svelte.ts'
import { initializeSimpleLayout } from './core/layout/layout-simple.svelte.ts'
import { initializeRenderer } from './core/render/renderer.svelte.ts'
import { keyboard } from './input/keyboard.svelte.ts'
import * as ANSI from './utils/ansi-codes.ts'

export type MountOptions = {
  fullscreen?: boolean
}

// ============================================================================
// MOUNT FUNCTION
// ============================================================================

export function mount(rootComponent: any, options: MountOptions = {}) {
  // Setup terminal dimensions
  const cols = process.stdout.columns || 80
  const rows = process.stdout.rows || 24

  setTerminalSize(cols, rows)
  terminalSize.fullscreen = options.fullscreen || false

  // Enter fullscreen if requested
  if (options.fullscreen) {
    process.stdout.write(ANSI.ENTER_ALT_SCREEN)
    process.stdout.write(ANSI.CLEAR_SCREEN)
  }

  // Hide cursor during rendering
  process.stdout.write(ANSI.HIDE_CURSOR)

  process.stdout.write(ANSI.ENABLE_MOUSE)

  // Set up keyboard - using the existing keyboard module
  keyboard.initialize()
  keyboard.onKey('Tab', () => keyboard.focusNext())
  keyboard.onKey('Shift+Tab', () => keyboard.focusPrevious())
  keyboard.onKey('Escape', () => keyboard.clearFocus())

  // Error handling
  // Error handling with detailed output
  const handleError = (error: Error) => {
    // Exit fullscreen mode first
    if (options?.fullscreen) {
      process.stdout.write(ANSI.EXIT_ALT_SCREEN)
    }
    // Show cursor
    process.stdout.write(ANSI.SHOW_CURSOR)
    process.stdout.write(ANSI.CLEAR_SCREEN)
    process.stdout.write(ANSI.DISABLE_MOUSE)
    process.stdout.write(ANSI.RESET)

    // Clear screen for clean error display
    console.clear()

    // Display error message
    console.error('\x1b[41m\x1b[37m\x1b[1m SVELTUI RUNTIME ERROR \x1b[0m\n')
    console.error(
      '\x1b[31m\x1b[1mError:\x1b[0m \x1b[37m' + error.message + '\x1b[0m\n'
    )

    // Show stack trace with formatting
    if (error.stack) {
      console.error('\x1b[33m\x1b[1mStack Trace:\x1b[0m')
      const stackLines = error.stack.split('\n').slice(1) // Skip first line (error message)
      stackLines.forEach((line) => {
        if (line.includes('node_modules')) {
          // Dim lines from node_modules
          console.error('\x1b[90m' + line + '\x1b[0m')
        } else if (line.includes('at ')) {
          // Highlight app code
          console.error('\x1b[36m' + line + '\x1b[0m')
        } else {
          console.error(line)
        }
      })
    }

    console.error('\n\x1b[33m💡 Tips:\x1b[0m')
    console.error('  • Check that all components are imported correctly')
    console.error('  • Ensure Happy DOM is registered before Svelte imports')
    console.error("  • Verify you're using Svelte 5 rune syntax")
    console.error('\n─'.repeat(60) + '\n')

    process.exit(1)
  }

  process.on('uncaughtException', handleError)
  process.on('unhandledRejection', handleError)

  // Initialize systems inside effect root
  const effectCleanup = $effect.root(() => {
    // Initialize simplified layout system (calculates positions)
    const layoutCleanup = initializeSimpleLayout()

    // Initialize our new optimized renderer
    const rendererCleanup = initializeRenderer()

    rootComponent()

    // Handle resize
    const handleResize = () => {
      const newCols = process.stdout.columns || 80
      const newRows = process.stdout.rows || 24
      setTerminalSize(newCols, newRows)
    }

    process.stdout.on('resize', handleResize)

    // Return cleanup
    return () => {
      process.stdout.off('resize', handleResize)
      process.off('SIGINT', handleExit)
      process.off('SIGTERM', handleExit)
      process.off('uncaughtException', handleError)
      process.off('unhandledRejection', handleError)
      rendererCleanup()
      layoutCleanup()
    }
  })

  // Cleanup function
  const cleanup = () => {
    effectCleanup()
    keyboard.cleanup()
    process.stdout.write(ANSI.DISABLE_MOUSE)
    if (options.fullscreen) {
      process.stdout.write(ANSI.EXIT_ALT_SCREEN)
    }
    process.stdout.write(ANSI.SHOW_CURSOR)
    process.stdout.write(ANSI.RESET)
  }

  // Handle exit
  const handleExit = () => {
    cleanup()
    process.exit(0)
  }

  process.on('SIGINT', handleExit)
  process.on('SIGTERM', handleExit)

  // Return cleanup for manual unmount
  return {
    cleanup,
    unmount: cleanup,
  }
}
