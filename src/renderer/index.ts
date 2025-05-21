/**
 * SvelTUI Renderer
 *
 * This module provides the core rendering interface for SvelTUI.
 * It serves as the bridge between the Svelte component system and the terminal.
 */

import type { Component } from 'svelte'
import { renderComponent, refreshComponents, destroyComponents } from './render'
import { getScreen, destroyScreen } from './screen'
import { document } from '../dom'

export interface RendererOptions {
  /** Title for the terminal window */
  title?: string
  /** Whether to use fullscreen mode */
  fullscreen?: boolean
  /** Whether to automatically focus the first focusable element */
  autofocus?: boolean
  /** Whether to enable debug mode with additional logging */
  debug?: boolean
  /** Component props */
  props?: Record<string, any>
  /** Custom blessed configuration options */
  blessed?: Record<string, any>
}

/**
 * Renders a Svelte component to the terminal
 *
 * @param component - The Svelte component to render
 * @param options - Renderer configuration options
 * @returns A cleanup function to destroy the component
 *
 * @example
 * ```ts
 * import { render } from 'sveltui';
 * import App from './App.svelte';
 *
 * const cleanup = render(App, {
 *   title: 'My Terminal App',
 *   fullscreen: true,
 * });
 *
 * // Later, to clean up
 * cleanup();
 * ```
 */
export function render(
  component: Component | string,
  options: RendererOptions = {}
): () => void {
  console.log('Rendering component with options:', options)
  
  // Log component type for debugging
  console.log('Component type:', typeof component)

  // Render the component
  return renderComponent(component as any, options)
}

/**
 * Creates a new terminal root node for rendering
 * Currently used internally by the renderer
 */
export function createTerminalRoot(
  options: RendererOptions = {}
): typeof document {
  return document
}

/**
 * Updates the terminal display
 * Used to manually trigger a refresh when necessary
 */
export function refresh(): void {
  refreshComponents()
}

/**
 * Exit the application gracefully
 */
export function exit(code = 0): never {
  // Clean up
  destroyComponents()
  destroyScreen()

  // Exit
  process.exit(code)
}
