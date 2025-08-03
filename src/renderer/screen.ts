/**
 * Terminal Screen
 *
 * This module manages the blessed screen instance and provides
 * utilities for screen creation and management.
 */

import blessed from 'blessed'
import type { Widgets } from 'blessed'
import type { RendererOptions } from './index'
import { RenderScheduler, globalScheduler } from './render-scheduler'
import type { RenderPriority } from './render-queue'

/**
 * The global screen instance
 */
let globalScreen: Widgets.Screen | null = null

/**
 * Render scheduler instance
 */
let scheduler: RenderScheduler | null = null

/**
 * Performance monitoring
 */
let performanceMonitor = {
  renderCount: 0,
  totalRenderTime: 0,
  lastRenderTime: 0,
  enabled: false
}

/**
 * Creates a blessed screen instance
 * @param options - Screen options
 * @returns The blessed screen instance
 */
export function createScreen(options: RendererOptions = {}): Widgets.Screen {
  // If a screen already exists, return it
  if (globalScreen) {
    return globalScreen
  }

  // Force terminal size if not detected properly
  if (!process.stdout.columns || process.stdout.columns === 1 || !process.stdout.rows || process.stdout.rows === 1) {
    process.stdout.columns = 80;
    process.stdout.rows = 24;
  }

  // Create a blessed screen with merged options
  const screenOptions = {
    smartCSR: true,
    title: options.title || 'SvelTUI Terminal App',
    // Disable Unicode to avoid character processing issues
    fullUnicode: false,
    dockBorders: true,
    autoPadding: true,
    fastCSR: true,
    // Fullscreen mode if specified
    fullscreen: options.fullscreen === true,
    // Input handling
    input: process.stdin,
    // Essential for key handling
    keys: true,
    // Mouse support
    mouse: true,
    // Use BCE (Background Color Erase) for better rendering
    useBCE: true,
    // Force dimensions if needed
    width: process.stdout.columns,
    height: process.stdout.rows,
    // Merge in blessed options from renderer options
    ...options.blessed,
  }

  if (options.debug) {
    // console.log('[Screen] Creating screen with options: [object]');
  }

  globalScreen = blessed.screen(screenOptions)

  // Force initial render to establish screen dimensions
  globalScreen.render()

  // Set up key bindings for quit - only specific keys should exit
  globalScreen.key(['q', 'C-c'], () => {
    process.exit(0)
  })

  // Remove the escape key handler to prevent accidental exits
  // Also, handle other key events but don't exit
  globalScreen.on('keypress', (ch, key) => {
    // Only log in debug mode
    if (options.debug) {
      // console.log('[Screen] Key pressed:', key?.name || ch);
    }
  })

  // Enable mouse
  globalScreen.enableMouse()

  // Keep the process alive by resuming stdin
  // This prevents Node.js from exiting when the main script finishes
  process.stdin.resume()

  // Set raw mode if we're in a TTY
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  // Focus the screen to ensure it receives input
  if (typeof globalScreen.focus === 'function') {
    globalScreen.focus()
  }

  // Initialize render scheduler
  scheduler = options.useScheduler !== false ? 
    (options.scheduler || globalScheduler) : 
    null;
    
  if (scheduler) {
    scheduler.setRenderCallback((elementIds) => {
      if (globalScreen) {
        const startTime = performanceMonitor.enabled ? performance.now() : 0;
        globalScreen.render();
        
        if (performanceMonitor.enabled) {
          const renderTime = performance.now() - startTime;
          performanceMonitor.renderCount++;
          performanceMonitor.totalRenderTime += renderTime;
          performanceMonitor.lastRenderTime = renderTime;
        }
      }
    });
    
    // Configure scheduler based on options
    if (options.maxFPS) {
      scheduler.setMaxFPS(options.maxFPS);
    }
  }

  // Enable performance monitoring if requested
  performanceMonitor.enabled = options.debug || options.performanceMonitoring || false;

  if (options.debug) {
    // console.log('[Terminal] Screen created, stdin resumed');
  }

  return globalScreen
}

/**
 * Gets the global screen instance, creating it if necessary
 * @param options - Screen options
 * @returns The blessed screen instance
 */
export function getScreen(options: RendererOptions = {}): Widgets.Screen {
  return globalScreen || createScreen(options)
}

/**
 * Renders the screen
 * @param priority - Render priority (when using scheduler)
 * @param elementId - Optional element ID for targeted rendering
 */
export function renderScreen(priority?: RenderPriority, elementId?: string): void {
  if (!globalScreen) return;
  
  if (scheduler) {
    // Use scheduler for batched rendering
    if (elementId) {
      scheduler.scheduleRender(elementId, priority || 'normal');
    } else {
      // Schedule full screen render
      scheduler.scheduleRender('__screen__', priority || 'normal');
    }
  } else {
    // Direct render without scheduler
    const startTime = performanceMonitor.enabled ? performance.now() : 0;
    globalScreen.render();
    
    if (performanceMonitor.enabled) {
      const renderTime = performance.now() - startTime;
      performanceMonitor.renderCount++;
      performanceMonitor.totalRenderTime += renderTime;
      performanceMonitor.lastRenderTime = renderTime;
    }
  }
}

/**
 * Force immediate render (bypasses scheduler)
 */
export function renderImmediate(): void {
  if (globalScreen) {
    if (scheduler) {
      scheduler.renderImmediate();
    } else {
      globalScreen.render();
    }
  }
}

/**
 * Get render performance statistics
 */
export function getRenderStats() {
  const schedulerStats = scheduler ? scheduler.stats : null;
  
  return {
    screen: {
      renderCount: performanceMonitor.renderCount,
      averageRenderTime: performanceMonitor.renderCount > 0 ? 
        performanceMonitor.totalRenderTime / performanceMonitor.renderCount : 0,
      lastRenderTime: performanceMonitor.lastRenderTime,
      totalRenderTime: performanceMonitor.totalRenderTime
    },
    scheduler: schedulerStats
  };
}

/**
 * Pause rendering (when using scheduler)
 */
export function pauseRendering(): void {
  if (scheduler) {
    scheduler.pause();
  }
}

/**
 * Resume rendering (when using scheduler)
 */
export function resumeRendering(): void {
  if (scheduler) {
    scheduler.resume();
  }
}

/**
 * Destroys the screen
 */
export function destroyScreen(): void {
  if (globalScreen) {
    globalScreen.destroy()
    globalScreen = null
  }
  if (scheduler) {
    scheduler.clear();
    scheduler = null;
  }
  performanceMonitor = {
    renderCount: 0,
    totalRenderTime: 0,
    lastRenderTime: 0,
    enabled: false
  };
}

/**
 * Creates a root box for the application
 * @param screen - The blessed screen
 * @param options - Root box options
 * @returns The root box
 */
export function createRootBox(
  screen: Widgets.Screen,
  options: RendererOptions = {}
): Widgets.BoxElement {
  // Create the root box
  const root = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Don't shrink - keep full screen
    shrink: false,
    style: {
      fg: 'white',
      bg: 'black',
    },
  })

  return root
}
