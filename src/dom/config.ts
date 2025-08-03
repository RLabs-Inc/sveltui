/**
 * DOM Configuration
 * 
 * This module provides global configuration for the terminal DOM,
 * including the ability to enable reactive elements.
 */

/**
 * Global DOM configuration
 */
export interface DOMConfig {
  /** Whether to use reactive elements by default */
  reactive: boolean
  /** Debug mode */
  debug: boolean
}

/**
 * Current DOM configuration
 */
let config: DOMConfig = {
  reactive: false,
  debug: false
}

/**
 * Sets the DOM configuration
 */
export function setDOMConfig(newConfig: Partial<DOMConfig>): void {
  config = { ...config, ...newConfig }
}

/**
 * Gets the current DOM configuration
 */
export function getDOMConfig(): DOMConfig {
  return { ...config }
}

/**
 * Checks if reactive elements are enabled
 */
export function isReactiveEnabled(): boolean {
  return config.reactive
}