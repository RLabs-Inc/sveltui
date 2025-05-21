/**
 * Terminal Screen
 * 
 * This module manages the blessed screen instance and provides
 * utilities for screen creation and management.
 */

import blessed from 'blessed';
import type { Widgets } from 'blessed';
import type { RendererOptions } from './index';

/**
 * The global screen instance
 */
let globalScreen: Widgets.Screen | null = null;

/**
 * Creates a blessed screen instance
 * @param options - Screen options
 * @returns The blessed screen instance
 */
export function createScreen(options: RendererOptions = {}): Widgets.Screen {
  // If a screen already exists, return it
  if (globalScreen) {
    return globalScreen;
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
    // Merge in blessed options from renderer options
    ...options.blessed,
  };

  if (options.debug) {
    console.log('[Screen] Creating screen with options:', screenOptions);
  }

  globalScreen = blessed.screen(screenOptions);
  
  // Set up key bindings for quit - only specific keys should exit
  globalScreen.key(['q', 'C-c'], () => {
    process.exit(0);
  });
  
  // Remove the escape key handler to prevent accidental exits
  // Also, handle other key events but don't exit
  globalScreen.on('keypress', (ch, key) => {
    // Only log in debug mode
    if (options.debug) {
      console.log('[Screen] Key pressed:', key?.name || ch);
    }
  });
  
  // Enable mouse
  globalScreen.enableMouse();
  
  if (options.debug) {
    console.log('[Terminal] Screen created');
  }
  
  return globalScreen;
}

/**
 * Gets the global screen instance, creating it if necessary
 * @param options - Screen options
 * @returns The blessed screen instance
 */
export function getScreen(options: RendererOptions = {}): Widgets.Screen {
  return globalScreen || createScreen(options);
}

/**
 * Renders the screen
 */
export function renderScreen(): void {
  if (globalScreen) {
    globalScreen.render();
  }
}

/**
 * Destroys the screen
 */
export function destroyScreen(): void {
  if (globalScreen) {
    globalScreen.destroy();
    globalScreen = null;
  }
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
    style: {
      fg: 'white',
      bg: 'black',
    },
  });
  
  return root;
}