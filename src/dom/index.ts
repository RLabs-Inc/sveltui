/**
 * Terminal Virtual DOM
 * 
 * This module is the entry point for the terminal virtual DOM system.
 * It provides a minimalistic DOM-like API that Svelte 5 can interact with
 * to render UI components to the terminal.
 */

// Export node interfaces and types
export * from './nodes';

// Export element interfaces
export * from './elements';

// Export document implementation
export * from './document';

// Export element factories
export * from './factories';

// Register element factories
import { registerElementFactories, factories } from './factories';
import { registerElement } from './elements';

// Register all element factories
for (const [type, factory] of Object.entries(factories)) {
  registerElement(type, factory);
}

// Export the global document instance for external use
import { document, createElement, createTextNode, createComment, createDocumentFragment } from './document';

// Re-export convenience methods
export { 
  document,
  createElement,
  createTextNode,
  createComment,
  createDocumentFragment
};