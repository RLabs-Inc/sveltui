/**
 * Terminal Renderer Implementation
 *
 * This module implements the core rendering functionality for SvelTUI,
 * with efficient reconciler integration for Svelte 5 components.
 */

import type { Component } from 'svelte'
import type { Widgets } from 'blessed'
// Import Svelte - should now resolve to client-side via config
import { mount, unmount } from 'svelte'
import { createScreen, getScreen, createRootBox } from './screen'
import { document, createElement as createDOMElement } from '../dom'
import { createElement } from '../dom/factories.js'
import type { RendererOptions } from './index.js'
import type { TerminalNode, TerminalElementNode } from '../dom/nodes.js'
import type { TerminalElement } from '../dom/elements.js'
import { getReconciler } from '../reconciler/index.js'
import { ensureTerminalElement } from '../reconciler/operations.js'
import path from 'path'
// Setup browser globals for Svelte 5 client-side compatibility
import '../utils/browser-globals'

/**
 * Information about a mounted component
 */
interface MountedComponent {
  component: Component
  root: TerminalElement
  screen: Widgets.Screen
  rootBox: Widgets.BoxElement
  instance: any
  destroy: () => void
}

/**
 * Currently mounted components
 */
const mountedComponents: MountedComponent[] = []

/**
 * Renders a Svelte component to the terminal
 *
 * @param component - The Svelte component to render
 * @param options - Renderer configuration options
 * @returns A cleanup function to destroy the component
 */
export function renderComponent(
  component: Component,
  options: RendererOptions = {}
): () => void {
  // Get reconciler for state tracking
  const reconciler = getReconciler({
    debug: options.debug,
    batchUpdates: true,
  })

  // Create or get the screen
  const screen = getScreen(options)

  // Create the root box
  const rootBox = createRootBox(screen, options)

  // Create a root DOM element for the component
  const rootNode = document.createElement('div')

  // Create a terminal element for the root node
  const rootElement = createElement('box', {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    content: '',
    border: 'line' as unknown as Widgets.Border,
    label: options.title || 'SvelTUI Component',
    style: {
      fg: 'blue',
      bg: 'black',
      border: {
        fg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      hover: {
        bg: 'blue',
      },
    },
  })

  // Connect the DOM node to the terminal element
  ;(rootNode as TerminalElementNode)._terminalElement = rootElement
  rootElement.attachToNode(rootNode as TerminalElementNode)

  // Create the blessed element for the root
  rootElement.create(rootBox)

  let instance: any = null
  let componentMounted = false

  try {
    // Use dynamic import for Svelte (ESM module)
    // This might look a bit strange since it's an async operation
    // but we're keeping the overall renderComponent function synchronous
    import('svelte')
      .then(async (svelteModule) => {
        try {
          if (options.debug) {
            console.log('[Renderer] Creating component instance')
          }

          // Check if this is a DOM component function (non-Svelte)
          if (
            typeof component === 'function' &&
            !component.__svelte_component__
          ) {
            // This might be a direct DOM component (not a Svelte component)
            try {
              if (options.debug) {
                console.log(
                  '[Renderer] Component appears to be a direct DOM function'
                )
              }

              // Call the function to get a DOM node
              const domResult = component(
                rootNode as unknown as svelteClient.ComponentInternals,
                options.props || {}
              )

              if (domResult) {
                if (options.debug) {
                  console.log('[Renderer] Component returned a DOM node')
                }

                // If the function returned a DOM node, append it to our root
                rootNode.appendChild(domResult as TerminalNode)

                // Set instance to a simple object for cleanup
                instance = {
                  _isDomComponent: true,
                  node: domResult,
                  unmount: () => {
                    try {
                      rootNode.removeChild(domResult as TerminalNode)
                    } catch (err) {
                      console.error('Error removing DOM node:', err)
                    }
                  },
                }

                // Process the resulting DOM using the reconciler
                if (options.debug) {
                  console.log('[Renderer] Processing DOM tree using reconciler')
                }

                processComponentWithReconciler(rootNode, rootElement)
                screen.render()

                // Update component mounted status
                componentMounted = true

                // Clear placeholder UI if it was created
                clearPlaceholderUI(rootElement)

                if (options.debug) {
                  console.log('[Renderer] DOM component rendered successfully')
                }

                // We've handled the component, return early
                return
              }
            } catch (domError) {
              console.error(
                '[Renderer] Error handling DOM component:',
                domError
              )
              // Continue to try Svelte mounting
            }
          }

          // Try to use Svelte mounting if the DOM approach didn't work
          if (options.debug) {
            console.log('[Renderer] Using client-side Svelte mounting')
            console.log('[Renderer] mount function available:', typeof mount)
          }

          // Handle component as a string (path) or function (component class)
          // Check if mount is available
          if (mount) {
            // Svelte 5 API with client-side mount
            if (options.debug) {
              console.log('[Renderer] Using Svelte 5 client mount API')
            }

            // If component is a string (path), import it dynamically
            const mountComponent = async () => {
              let componentToMount = component

              if (typeof component === 'string') {
                if (options.debug) {
                  console.log(
                    '[Renderer] Component is a path, importing:',
                    component
                  )
                }

                try {
                  if (options.debug) {
                    console.log(
                      '[Renderer] Loading component from path:',
                      component
                    )
                  }

                  // For paths relative to the current working directory
                  const fullPath = path.isAbsolute(component as string)
                    ? component
                    : path.resolve(process.cwd(), component)

                  if (options.debug) {
                    console.log('[Renderer] Resolved component path:', fullPath)
                  }

                  // Try to require the component synchronously first
                  try {
                    // Use require() to load the component
                    const required = require(fullPath)
                    componentToMount = required.default || required

                    if (options.debug) {
                      console.log(
                        '[Renderer] Loaded component with require:',
                        typeof componentToMount
                      )
                    }
                  } catch (requireError) {
                    console.error(
                      '[Renderer] Failed to load with require, trying import:',
                      requireError
                    )

                    // Fallback to dynamic import - use the full resolved path
                    const importPath = `file://${fullPath}`
                    if (options.debug) {
                      console.log('[Renderer] Importing from:', importPath)
                    }

                    const module = await import(/* @vite-ignore */ importPath)
                    componentToMount = module.default || module

                    if (options.debug) {
                      console.log(
                        '[Renderer] Imported component:',
                        typeof componentToMount
                      )
                    }
                  }
                } catch (importError: any) {
                  console.error(
                    '[Renderer] Failed to import component:',
                    importError
                  )
                  throw new Error(
                    `Failed to import component: ${importError.message}`
                  )
                }
              }

              if (typeof componentToMount !== 'function') {
                console.error(
                  '[Renderer] Component is not a function after import:',
                  typeof componentToMount
                )
                throw new Error(
                  'Component must be a function (component class)'
                )
              }

              // Create a mock DOM element for Svelte to mount into
              // We need to use our actual DOM element here so Svelte's operations work correctly
              const mockTargetElement = rootNode as any
              
              // Store our appendChild function to ensure it works correctly
              const terminalAppendChild = rootNode.appendChild.bind(rootNode)
              
              // Override appendChild to handle the anchor text node case
              ;(rootNode as any).appendChild = function(child: any) {
                if (options.debug) {
                  console.log('[Renderer] Mock target appendChild called with:', child)
                  console.log('[Renderer] Child nodeType:', child?.nodeType)
                }
                
                // Use our terminal appendChild, not the one from Node.prototype
                const result = terminalAppendChild(child)
                
                // After Svelte sets up its anchor, we need to process the DOM tree
                setTimeout(() => {
                  processComponentWithReconciler(rootNode, rootElement)
                  reconciler.forceFlush()
                  screen.render()
                }, 0)
                
                return result
              }

              // Mount the component using Svelte 5's client-side mount function
              try {
                if (options.debug) {
                  console.log('[Renderer] About to call mount with:')
                  console.log('  Component:', componentToMount)
                  console.log('  Target:', mockTargetElement)
                  console.log('  Props:', options.props || {})
                }
                
                const mountResult = mount(componentToMount, {
                  target: mockTargetElement,
                  props: options.props || {},
                })
                
                if (options.debug) {
                  console.log('[Renderer] Mount returned:', mountResult)
                }
                
                return mountResult
              } catch (mountError) {
                console.error('[Renderer] Mount error:', mountError)
                console.error('[Renderer] Mount error stack:', mountError.stack)
                throw mountError
              }
            }

            // Execute the mount function
            mountComponent()
              .then((mountedInstance) => {
                instance = mountedInstance

                // Process the resulting DOM using the reconciler
                if (options.debug) {
                  console.log(
                    '[Renderer] Component mounted, processing DOM tree with reconciler'
                  )
                }

                processComponentWithReconciler(rootNode, rootElement)

                // Force flush any pending operations and render the screen
                reconciler.forceFlush()
                screen.render()

                // Update component mounted status
                componentMounted = true

                // Clear placeholder UI if it was created
                clearPlaceholderUI(rootElement)

                if (options.debug) {
                  console.log('[Renderer] Component mounted successfully')
                }
              })
              .catch((mountError) => {
                console.error(
                  '[Renderer] Error mounting component:',
                  mountError
                )

                // Show error UI
                if (options.debug) {
                  showErrorUI(rootElement, mountError)
                } else {
                  // Create a placeholder UI for non-debug mode
                  createPlaceholderUI(rootElement, screen)
                }
              })

            // Return early since we're handling the mounting asynchronously
            return
          } else {
            console.error('Component:', typeof component, component)
            console.error(
              'Available Svelte exports:',
              Object.keys(svelteModule)
            )
            throw new Error(
              'Unable to mount component: Svelte 5 mount API not available'
            )
          }

          // This code is unreachable due to return statement above, but keeping it for reference
        } catch (mountError) {
          console.error('[Renderer] Error mounting component:', mountError)

          // Show error UI
          if (options.debug) {
            showErrorUI(rootElement, mountError)
          } else {
            // Create a placeholder UI for non-debug mode
            createPlaceholderUI(rootElement, screen)
          }
        }
      })
      .catch((importError) => {
        console.error('[Renderer] Error importing Svelte:', importError)

        // Show error UI
        if (options.debug) {
          showErrorUI(rootElement, importError)
        } else {
          // Create a placeholder UI for non-debug mode
          createPlaceholderUI(rootElement, screen)
        }
      })

    // Create a placeholder UI while the component is loading
    // This will be cleared once the component is mounted
    if (!componentMounted) {
      createPlaceholderUI(rootElement, screen)
    }
  } catch (error) {
    // If component fails to render, show a placeholder UI
    console.error('[Renderer] Error initializing component:', error)

    if (options.debug) {
      showErrorUI(rootElement, error)
    } else {
      // Create a placeholder UI for non-debug mode
      createPlaceholderUI(rootElement, screen)
    }
  }

  // Cleanup function for the component
  const cleanup = () => {
    try {
      // Get the reconciler to clean up operations
      const reconciler = getReconciler()

      // Use the client-side Svelte module to unmount the component
      if (instance) {
        if (unmount) {
          // Svelte 5 client-side API
          if (options.debug) {
            console.log('[Renderer] Using Svelte 5 client unmount API')
          }
          unmount(instance)
        } else if (typeof instance.unmount === 'function') {
          // Instance has unmount method
          instance.unmount()
        } else if (typeof instance.$destroy === 'function') {
          // Fallback to Svelte 4 API for compatibility
          instance.$destroy()
        }

        // Destroy the root element
        rootElement.destroy()

        // Remove from mounted components
        const index = mountedComponents.findIndex((c) => c.root === rootElement)
        if (index !== -1) {
          mountedComponents.splice(index, 1)
        }

        // Force a reconciler flush to make sure everything is cleaned up
        reconciler.forceFlush()

        if (options.debug) {
          console.log('[Renderer] Component destroyed')
        }
      } else {
        // No instance, just destroy the element
        rootElement.destroy()
        reconciler.forceFlush()

        if (options.debug) {
          console.log(
            '[Renderer] Component root element destroyed (no instance)'
          )
        }
      }
    } catch (err) {
      console.error('Error during cleanup:', err)
      // Still destroy the element to prevent memory leaks
      rootElement.destroy()
    }
  }

  // Store the mounted component
  const mounted: MountedComponent = {
    component,
    root: rootElement,
    screen,
    rootBox,
    instance,
    destroy: cleanup,
  }

  mountedComponents.push(mounted)

  // Render the screen
  screen.render()

  if (options.debug) {
    console.log('[Renderer] Component initialized (waiting for mount)')
  }

  // Return the cleanup function
  return cleanup
}

/**
 * Shows an error UI for component rendering failures
 *
 * @param rootElement - The root terminal element
 * @param error - The error that occurred
 */
function showErrorUI(rootElement: TerminalElement, error: any): void {
  // Clear existing children
  while (rootElement.children.length > 0) {
    const child = rootElement.children[0]
    rootElement.removeChild(child)
    child.destroy()
  }

  // Create a debug error box
  const errorBox = createElement('box', {
    top: 'center',
    left: 'center',
    width: '80%',
    height: '50%',
    label: ' SvelTUI Error ',
    content: `Error rendering component: ${error.message}\n\n${
      error.stack || ''
    }`,
    border: 'line' as unknown as Widgets.Border,
    style: {
      border: {
        fg: 'red',
      },
      fg: 'white',
      bg: 'red',
      hover: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
    },
  })

  rootElement.appendChild(errorBox)
  errorBox.create(rootElement.blessed as Widgets.BoxElement)
}

/**
 * Clears the placeholder UI when component is mounted
 *
 * @param rootElement - The root terminal element
 */
function clearPlaceholderUI(rootElement: TerminalElement): void {
  // Clear existing children
  while (rootElement.children.length > 0) {
    const child = rootElement.children[0]
    rootElement.removeChild(child)
    child.destroy()
  }
}

/**
 * Process a component's DOM tree using the reconciler
 * This ensures efficient updates when the component state changes
 *
 * @param node - The root of the DOM tree
 * @param parent - The parent terminal element
 */
function processComponentWithReconciler(
  node: TerminalNode,
  parent: TerminalElement
): void {
  // Get reconciler instance
  const reconciler = getReconciler()

  // For the root node, ensure the terminal element is attached
  if (node.nodeType === 1) {
    const elementNode = node as TerminalElementNode

    // If node already has a terminal element, use it
    // Otherwise, use the parent passed in
    if (!elementNode._terminalElement) {
      elementNode._terminalElement = parent
      parent.appendChild(elementNode._terminalElement)
    }
  }

  // Process all child nodes using the reconciler
  for (const child of node.childNodes) {
    // If it's an element node, ensure it has a terminal element
    if (child.nodeType === 1) {
      const elementNode = child as TerminalElementNode

      // If the element doesn't have a terminal element yet, create one
      if (!elementNode._terminalElement) {
        // This will create the terminal element and attach it to the DOM node
        ensureTerminalElement(elementNode, parent)
      }

      // Recursively process children
      processComponentWithReconciler(child, elementNode._terminalElement)
    }
    // If it's a text node, it will be handled by the parent element
    else if (child.nodeType === 3) {
      // Text nodes are handled by the reconciler operations
      // No need to do anything here
    }
  }
}

/**
 * Refreshes all mounted components
 */
export function refreshComponents(): void {
  // Get reconciler instance
  const reconciler = getReconciler()

  // Force a reconciler flush to process any pending operations
  reconciler.forceFlush()

  // Render all screens
  for (const { screen } of mountedComponents) {
    screen.render()
  }
}

/**
 * Destroys all mounted components
 */
export function destroyComponents(): void {
  while (mountedComponents.length > 0) {
    const mounted = mountedComponents.pop()!
    mounted.destroy()
  }
}

/**
 * Creates a placeholder UI for when component rendering fails
 *
 * @param rootElement - The root terminal element
 * @param screen - The blessed screen
 */
function createPlaceholderUI(
  rootElement: TerminalElement,
  screen: Widgets.Screen
): void {
  // Create a simple box with demo content
  const mainBox = createElement('box', {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'line' as unknown as Widgets.Border,
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      hover: {
        bg: 'blue',
      },
    },
    content: 'SvelTUI Demo',
    label: 'SvelTUI Demo',
  })

  rootElement.appendChild(mainBox)
  mainBox.create(rootElement.blessed as Widgets.BoxElement)

  // Add title
  const titleBox = createElement('box', {
    top: 1,
    left: 2,
    width: '50%',
    height: 3,
    content: 'Welcome to SvelTUI!',
    style: {
      fg: 'green',
      bg: 'black',
      border: {
        fg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      hover: {
        bg: 'blue',
      },
    },
  })

  mainBox.appendChild(titleBox)
  titleBox.create(mainBox.blessed as Widgets.BoxElement)

  // Add instructions
  const instructionsBox = createElement('box', {
    top: 5,
    left: 'center',
    width: '80%',
    height: 6,
    content:
      'Loading Svelte component... Please wait.\n\nIf this screen persists, the component may have failed to load or compile.',
    border: 'line' as unknown as Widgets.Border,
    style: {
      border: {
        fg: 'blue',
      },
      fg: 'white',
      bg: 'black',
      hover: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
    },
  })

  mainBox.appendChild(instructionsBox)
  instructionsBox.create(mainBox.blessed as Widgets.BoxElement)

  // Add counter
  let count = 0
  const counterBox = createElement('box', {
    top: 12,
    left: 'center',
    width: 20,
    height: 3,
    content: `Counter: ${count}`,
    border: 'line' as unknown as Widgets.Border,
    style: {
      border: {
        fg: 'yellow',
      },
      fg: 'white',
      bg: 'blue',
      hover: {
        bg: 'cyan',
      },
      focus: {
        bg: 'cyan',
      },
      scrollbar: {
        bg: 'cyan',
      },
    },
  })

  mainBox.appendChild(counterBox)
  counterBox.create(mainBox.blessed as Widgets.BoxElement)

  // Add key handlers
  screen.key(['up', '+'], () => {
    count++
    counterBox.blessed?.setContent(`Counter: ${count}`)
    screen.render()
  })

  screen.key(['down', '-'], () => {
    count--
    counterBox.blessed?.setContent(`Counter: ${count}`)
    screen.render()
  })

  // Add quit key handler
  screen.key(['q', 'C-c'], () => {
    process.exit(0)
  })

  // Add footer
  const footerBox = createElement('box', {
    bottom: 1,
    left: 'center',
    width: '90%',
    height: 1,
    content: 'Press +/- to change counter | Press q or Ctrl+C to exit',
    style: {
      fg: 'gray',
      bg: 'black',
      border: {
        fg: 'blue',
      },
      scrollbar: {
        bg: 'blue',
      },
      focus: {
        bg: 'blue',
      },
      hover: {
        bg: 'blue',
      },
    },
  })

  mainBox.appendChild(footerBox)
  footerBox.create(mainBox.blessed as Widgets.BoxElement)
}
