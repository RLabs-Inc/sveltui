/**
 * SvelTUI Svelte Component Renderer
 *
 * This module provides the core functionality for rendering Svelte components
 * to the terminal UI. It connects Svelte's runtime with our terminal DOM implementation.
 */

import type { Component, ComponentConstructorOptions } from 'svelte'
import type { Widgets } from 'blessed'
import { getScreen, createRootBox } from './screen'
import { document } from '../dom'
import type { TerminalNode, TerminalElementNode } from '../dom/nodes'
import type { TerminalElement } from '../dom/elements'
import { getReconciler } from '../reconciler'

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
export function renderComponent(
  Component: any,
  options: ComponentRenderOptions = {}
): RenderResult {
  // Initialize the reconciler
  const reconciler = getReconciler({
    debug: options.debug,
    batchUpdates: true,
  })

  // Get or create the screen
  const screen = getScreen({
    title: options.screen?.title,
    fullscreen: options.screen?.fullscreen,
    ...options.screen?.options,
  })

  // Create the root box
  const rootBox = createRootBox(screen, {
    debug: options.debug,
  })

  // Create a target element if not provided
  const target = options.target || document.createElement('div')
  if (target.nodeType !== 1) {
    throw new Error('Target must be an element node')
  }

  try {
    // Check if Svelte 5 module is available
    let instance: any
    const props = options.props || {}
    const targetEl = target as any

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

          // For Svelte 5 functional components
          instance = svelte.mount(Component, {
            target: targetEl,
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
            instance = Component(targetEl, props)
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
          target: targetEl,
          props,
        }

        // Create the component instance (legacy approach)
        instance = new Component(componentOptions)
      }
    } catch (error) {
      console.error('[Renderer] Error creating component:', error)
      throw error
    }

    // Create and connect DOM elements directly to terminal
    const connectDOMToTerminal = (
      domNode: TerminalElementNode,
      parent: Widgets.Node
    ): Widgets.Node => {
      // Skip non-element nodes
      if (domNode.nodeType !== 1) return parent

      // Get element node properties
      const tagName = domNode.tagName.toLowerCase()
      const attributes = domNode.attributes || {}

      // Convert DOM attributes to terminal properties
      const props: Record<string, any> = {}
      for (const [name, value] of Object.entries(attributes)) {
        // Convert from DOM naming convention to terminal naming convention
        const propName = name.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        )
        props[propName] = value
      }

      // Create the terminal element based on the tag
      const element = domNode._terminalElement

      if (!element) {
        console.warn(
          `[Renderer] Element ${tagName} has no associated terminal element`
        )
        return parent
      }

      // Create the blessed element
      if (!element.blessed) {
        element.create(parent)
      }

      // Recursively process child nodes
      for (const child of domNode.childNodes) {
        if (child.nodeType === 1) {
          connectDOMToTerminal(child as TerminalElementNode, element.blessed!)
        } else if (child.nodeType === 3) {
          // Handle text nodes by setting content on parent
          const text = (child as any).nodeValue || ''
          if (text.trim() && element.props.content === undefined) {
            element.setProps({ ...element.props, content: text })
          }
        }
      }

      return element.blessed!
    }

    // Connect the DOM tree to the terminal
    const rootElement = connectDOMToTerminal(
      target as TerminalElementNode,
      rootBox
    )

    // Render the screen
    screen.render()

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

        // Remove the component's DOM elements
        while (target.firstChild) {
          target.removeChild(target.firstChild)
        }

        // Refresh the screen
        screen.render()
      },
    }
  } catch (error) {
    console.error('Error rendering component:', error)

    // Create a simple error display
    const errorBox = rootBox.box({
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
 * @returns A function to render components
 */
export function createRenderer(options: ComponentRenderOptions = {}) {
  return function render(
    Component: Component,
    componentOptions: ComponentRenderOptions = {}
  ): RenderResult {
    // Merge default options with component-specific options
    const mergedOptions: ComponentRenderOptions = {
      ...options,
      ...componentOptions,
      screen: {
        ...options.screen,
        ...componentOptions.screen,
      },
      props: {
        ...options.props,
        ...componentOptions.props,
      },
    }

    // Render the component
    return renderComponent(Component, mergedOptions)
  }
}

/**
 * Default renderer instance
 */
export const render = createRenderer()
