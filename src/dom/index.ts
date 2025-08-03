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

// Export positioning utilities
export * from './positioning';

// Export reactive element system
export * from './reactive-element';
export * from './reactive-bridge';

// Export DOM configuration
export * from './config';

// Export style state system
export { StyleState, createStyleState, useStyleStateEvents, type TerminalStyle, type StyleStateConfig } from './style-state.svelte.ts';
export * from './style-utils';

// Export reactive event system
export * from './reactive-events.svelte.ts';
export * from './event-bridge';

// Register element factories
import { registerElementFactories, factories, reactiveFactories } from './factories';
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