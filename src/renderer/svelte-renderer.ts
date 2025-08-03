/**
 * SvelTUI Svelte Component Renderer
 *
 * This module provides the core functionality for rendering Svelte components
 * to the terminal UI. It connects Svelte's runtime with our terminal DOM implementation.
 */

// Ensure browser globals are set up before anything else
import '../utils/browser-globals'

import type { Component, ComponentConstructorOptions } from 'svelte'
import blessed, { type Widgets } from 'blessed'
import { getScreen, createRootBox, getRenderStats } from './screen'
// Using global document (Happy DOM) instead of our custom DOM
// import { document } from '../dom'
import type { TerminalNode, TerminalElementNode } from '../dom/nodes'
import type { TerminalElement } from '../dom/elements'
import { getReconciler } from '../reconciler'
import { setDOMConfig } from '../dom/config'
import type { RenderScheduler } from './render-scheduler'
import { happyDomToTerminal, observeHappyDom, setupKeyboardEvents, setupGlobalKeyboardHandler } from './bridge'
import { setupReactiveSync } from './dom-sync'

/**
 * Options for rendering a Svelte component
 */
export interface ComponentRenderOptions {
  /** Target DOM node to mount to (defaults to document.body) */
  target?: TerminalNode

  /** Component props */
  props?: Record<string, any>

  /** Screen options */
  screen?: {
    /** Terminal window title */
    title?: string

    /** Whether to enable fullscreen mode */
    fullscreen?: boolean

    /** Whether to enable mouse support */
    mouse?: boolean

    /** Additional blessed screen options */
    options?: Record<string, any>
  }

  /** Whether to enable debug mode */
  debug?: boolean
  
  /** Whether to enable reactive elements (uses Svelte's fine-grained reactivity) */
  reactive?: boolean
  
  /** Terminal window title (shorthand for screen.title) */
  title?: string
  
  /** Whether to use fullscreen mode (shorthand for screen.fullscreen) */
  fullscreen?: boolean
  
  /** Whether to use the render scheduler (default: true) */
  useScheduler?: boolean
  
  /** Custom render scheduler instance */
  scheduler?: RenderScheduler
  
  /** Maximum FPS for render scheduling (default: 60) */
  maxFPS?: number
  
  /** Enable performance monitoring */
  performanceMonitoring?: boolean
}

/**
 * Result of rendering a component
 */
export interface RenderResult {
  /** Component instance */
  component: any

  /** Root blessed element */
  element: Widgets.BlessedElement

  /** Blessed screen */
  screen: Widgets.Screen

  /** Function to destroy the component */
  destroy: () => void
}

/**
 * Renders a Svelte component to the terminal
 *
 * @param Component - Svelte component constructor or function
 * @param options - Component render options
 * @returns Render result with destroy function
 */
export async function renderComponent(
  Component: any,
  options: ComponentRenderOptions = {}
): Promise<RenderResult> {
  // Configure DOM for reactive elements if requested
  if (options.reactive) {
    setDOMConfig({ reactive: true, debug: options.debug || false })
  }
  
  // Initialize the reconciler
  const reconciler = getReconciler({
    debug: options.debug,
    batchUpdates: true, // Re-enable batching - might help with performance
  })

  // Get or create the screen
  const screen = getScreen({
    title: options.title || options.screen?.title,
    fullscreen: options.fullscreen ?? options.screen?.fullscreen,
    useScheduler: true, // Re-enable scheduler but with high FPS
    scheduler: options.scheduler,
    maxFPS: 120, // Increase FPS for better responsiveness
    performanceMonitoring: options.performanceMonitoring,
    debug: options.debug,
    ...options.screen?.options,
  })

  // Create the root box
  const rootBox = createRootBox(screen, {
    debug: options.debug,
  })
  
  // Set up global keyboard handler BEFORE bridging elements
  setupGlobalKeyboardHandler(screen)

  // Create a Happy DOM target element for mounting (not our custom DOM)
  const happyDomTarget = document.createElement('div')
  document.body.appendChild(happyDomTarget)

  try {
    // Check if Svelte 5 module is available
    let instance: any
    const props = options.props || {}

    // Try to dynamically import Svelte directly
    try {
      // Load Svelte module synchronously
      let svelte
      try {
        // Try to load the client-side version of Svelte explicitly first
        try {
          svelte = require('svelte/src/index-client.js')

          if (options.debug) {
            console.log('[Renderer] Using Svelte client-side API')
          }
        } catch (clientErr) {
          // Fall back to regular Svelte import
          svelte = require('svelte')

          if (options.debug) {
            console.log('[Renderer] Using Svelte default import')
          }
        }
      } catch (e: any) {
        throw new Error(
          'Could not load Svelte module. Make sure svelte is installed: ' +
            e.message
        )
      }

      // Use Svelte 5's mount/unmount APIs if available
      if (typeof svelte.mount === 'function') {
        if (options.debug) {
          console.log('[Renderer] Using Svelte 5 mount API')
        }

        try {
          // Process the Component if it's a path string
          if (typeof Component === 'string') {
            // For string components, we need to load the module
            if (options.debug) {
              console.log('[Renderer] Loading component from path:', Component)
            }

            // Try to require the component directly
            // This assumes the component has been pre-compiled
            Component = require(Component).default
          }

          // For Svelte 5 functional components - mount to Happy DOM
          instance = svelte.mount(Component, {
            target: happyDomTarget,
            props,
          })
        } catch (mountError) {
          console.error('[Renderer] Svelte mount error:', mountError)

          // Try alternate approach - treat Component as a direct function
          if (typeof Component === 'function') {
            if (options.debug) {
              console.log('[Renderer] Trying direct function approach')
            }

            // Call the function with target and props
            instance = Component(happyDomTarget, props)
          } else {
            throw mountError
          }
        }
      } else {
        // Fallback to traditional class-based components
        if (options.debug) {
          console.log('[Renderer] Using Svelte class component API')
        }

        // Create the component with the target and props
        const componentOptions: ComponentConstructorOptions = {
          target: happyDomTarget,
          props,
        }

        // Create the component instance (legacy approach)
        instance = new Component(componentOptions)
      }
    } catch (error) {
      console.error('[Renderer] Error creating component:', error)
      throw error
    }

    // After Svelte mounts successfully, bridge Happy DOM to terminal elements
    const bridgeHappyDomToTerminal = () => {
      if (options.debug) {
        console.log('[Renderer] Component mounted, bridging Happy DOM to Terminal')
        console.log('[Renderer] Happy DOM content:', happyDomTarget.innerHTML)
      }

      // Create a terminal root element
      const { createElement } = require('../dom/factories')
      const terminalRoot = createElement('box', {
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        content: '',
        style: {
          fg: 'white',
          bg: undefined,
          transparent: true
        },
      })

      // Create the blessed element for the root
      terminalRoot.create(rootBox)

      // Convert Happy DOM to Terminal elements
      for (const child of happyDomTarget.childNodes) {
        const terminalChild = happyDomToTerminal(child, terminalRoot)
        // Set up keyboard events for interactive elements
        if (terminalChild && child instanceof Element) {
          setupKeyboardForElement(child, terminalChild, screen)
        }
      }

      // Set up observer for reactive updates
      if (options.debug) {
        console.log('[Renderer] Setting up observer - element type:', happyDomTarget.constructor.name)
        console.log('[Renderer] Element has observeMutations:', typeof (happyDomTarget as any)[Symbol.for('happy-dom.observeMutations')])
      }
      const observer = observeHappyDom(happyDomTarget, terminalRoot, screen)

      // Set up reactive synchronization for Svelte updates
      const cleanupSync = setupReactiveSync(happyDomTarget, terminalRoot, screen)

      // Helper to recursively set up keyboard events
      function setupKeyboardForElement(domEl: Element, termEl: TerminalElement, screen: any) {
        // Check if this is an interactive element
        const tagName = domEl.tagName.toLowerCase()
        if (tagName === 'box' || tagName === 'text' || tagName === 'button' || tagName === 'input') {
          // Check if it has focus-related props or keyboard events
          if (domEl.hasAttribute('focused') || domEl.hasAttribute('onfocus') || domEl.hasAttribute('onblur') || domEl.hasAttribute('onkeydown')) {
            setupKeyboardEvents(domEl, termEl, screen)
            // If it has focused=true, focus it
            if (domEl.getAttribute('focused') === 'true' || domEl.getAttribute('focused') === '') {
              termEl.blessed?.focus()
            }
          }
        }

        // Process children
        const domChildren = Array.from(domEl.children)
        termEl.children.forEach((termChild, index) => {
          if (domChildren[index]) {
            setupKeyboardForElement(domChildren[index], termChild, screen)
          }
        })
      }

      return terminalRoot
    }

    // Call the bridge function immediately using queueMicrotask for instant response
    // This ensures Svelte has rendered without adding artificial delay
    let rootElement: any = null
    queueMicrotask(() => {
      rootElement = bridgeHappyDomToTerminal()
      
      // Force screen render
      screen.render()
    })

    // Debug: Check if root box has children
    if (options.debug) {
      console.log('[Renderer] Root box blessed:', !!rootBox)
      console.log('[Renderer] Root box children:', rootBox.children?.length || 0)
      console.log('[Renderer] Happy DOM target children:', happyDomTarget.childNodes.length)
    }
    
    // Render the screen
    screen.render()
    
    if (options.debug) {
      console.log('[Renderer] Screen rendered')
    }

    // Return the render result with destroy function
    return {
      component: instance,
      element: rootElement as Widgets.BlessedElement,
      screen,
      destroy: () => {
        try {
          // Use synchronous require instead of dynamic import
          const svelte = require('svelte')

          // Use Svelte 5's unmount function if available
          if (typeof svelte.unmount === 'function' && instance) {
            if (options.debug) {
              console.log('[Renderer] Using Svelte 5 unmount API')
            }
            svelte.unmount(instance)
          } else if (instance && typeof instance.$destroy === 'function') {
            // Legacy Svelte destroy
            instance.$destroy()
          } else if (instance && typeof instance.destroy === 'function') {
            // Custom destroy method for direct function components
            instance.destroy()
          }
        } catch (error) {
          console.error('[Renderer] Error during component cleanup:', error)
        }

        // Remove the component's DOM elements from Happy DOM
        while (happyDomTarget.firstChild) {
          happyDomTarget.removeChild(happyDomTarget.firstChild)
        }
        
        // Remove from document body
        if (happyDomTarget.parentNode) {
          happyDomTarget.parentNode.removeChild(happyDomTarget)
        }
        
        // Clean up the root element if it exists
        if (rootElement && rootElement.destroy) {
          rootElement.destroy()
        }

        // Refresh the screen
        screen.render()
      },
    }
  } catch (error) {
    console.error('Error rendering component:', error)

    // Create a simple error display
    const errorBox = blessed.box({
      parent: rootBox,
      top: 'center',
      left: 'center',
      width: '80%',
      height: '50%',
      content: `Error rendering component: ${error.message}`,
      border: 'line',
      style: {
        border: {
          fg: 'red',
        },
        fg: 'red',
      },
    })

    // Render the screen
    screen.render()

    // Return a result with a destroy function
    return {
      component: null,
      element: errorBox,
      screen,
      destroy: () => {
        errorBox.destroy()
        screen.render()
      },
    }
  }
}

/**
 * Creates a component renderer
 *
 * @param options - Default render options
 * @returns A renderer object with mount and unmount methods
 */
export function createRenderer(options: ComponentRenderOptions = {}) {
  let currentResult: RenderResult | null = null
  
  return {
    /**
     * Mount a component
     * @returns A promise that resolves to a cleanup function
     */
    async mount(Component: Component | any, props?: Record<string, any>) {
      // Unmount any existing component synchronously
      if (currentResult) {
        currentResult.destroy()
      }
      
      // Render the new component and wait for it
      try {
        const result = await renderComponent(Component, {
          ...options,
          props: props || options.props
        })
        currentResult = result
        
        // Return cleanup function
        return () => {
          if (currentResult) {
            currentResult.destroy()
            currentResult = null
          }
        }
      } catch (error) {
        console.error('Failed to mount component:', error)
        throw error
      }
    },
    
    /**
     * Unmount the current component
     */
    unmount(): void {
      if (currentResult) {
        currentResult.destroy()
        currentResult = null
      }
    },
    
    /**
     * Get the current screen
     */
    get screen() {
      return currentResult?.screen
    },
    
    /**
     * Get the current component instance
     */
    get component() {
      return currentResult?.component
    },
    
    /**
     * Get render performance statistics
     */
    getRenderStats() {
      return getRenderStats()
    }
  }
}

/**
 * Default renderer instance
 */
export const render = createRenderer()
