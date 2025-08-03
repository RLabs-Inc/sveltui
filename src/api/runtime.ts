/**
 * Runtime DOM Connector
 * 
 * This module provides connectors between the Svelte runtime and our terminal DOM.
 * It serves as the bridge that Svelte's compiler-generated code can call into.
 */

import {
  document,
  type TerminalNode,
  type TerminalElementNode,
  type TerminalTextNode,
  type TerminalDocumentNode,
} from '../dom';
import { refresh } from '../renderer';
import { getReconciler } from '../reconciler';
import { setupBinding, cleanupBindings } from '../dom/binding-bridge';
import { hasFocusContext, getFocusContext } from '../dom/focus-context.svelte.ts';
import { isFocusable } from '../dom/focus-manager';

// DOM operations that will be called by the compiler-generated code

/**
 * Creates an element
 * @param name - Element type
 * @returns The created element
 */
export function createElement(name: string): TerminalElementNode {
  return document.createElement(name.toLowerCase());
}

/**
 * Creates a text node
 * @param text - Text content
 * @returns The created text node
 */
export function createText(text: string): TerminalTextNode {
  return document.createTextNode(text);
}

/**
 * Creates a comment node
 * @param text - Comment text
 * @returns The created comment node
 */
export function createComment(text: string): TerminalNode {
  return document.createComment(text);
}

/**
 * Creates a document fragment
 * @returns The created document fragment
 */
export function createFragment(): TerminalNode {
  return document.createDocumentFragment();
}

/**
 * Inserts a node before another
 * @param parent - Parent node
 * @param node - Node to insert
 * @param anchor - Reference node
 */
export function insertNode(
  parent: TerminalNode,
  node: TerminalNode,
  anchor: TerminalNode | null
): void {
  parent.insertBefore(node, anchor);
  
  // Register with focus context if focusable
  if (node.nodeType === 1 && hasFocusContext()) {
    const element = node as TerminalElementNode;
    if (isFocusable(element)) {
      const focusContext = getFocusContext();
      focusContext.registerElement(element);
    }
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Appends a child node
 * @param parent - Parent node
 * @param child - Child node
 */
export function appendChild(parent: TerminalNode, child: TerminalNode): void {
  parent.appendChild(child);
  
  // Register with focus context if focusable
  if (child.nodeType === 1 && hasFocusContext()) {
    const element = child as TerminalElementNode;
    if (isFocusable(element)) {
      const focusContext = getFocusContext();
      focusContext.registerElement(element);
    }
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Removes a child node
 * @param parent - Parent node
 * @param child - Child node
 */
export function removeChild(parent: TerminalNode, child: TerminalNode): void {
  parent.removeChild(child);
  
  // Unregister from focus context if focusable
  if (child.nodeType === 1 && hasFocusContext()) {
    const element = child as TerminalElementNode;
    const focusContext = getFocusContext();
    focusContext.unregisterElement(element);
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Sets an element's attribute
 * @param node - Element node
 * @param name - Attribute name
 * @param value - Attribute value
 */
export function setAttribute(
  node: TerminalElementNode,
  name: string,
  value: any
): void {
  // Update the DOM node
  node.setAttribute(name, value);
  
  // Update the terminal element if it has been created
  if (node._terminalElement) {
    // Convert attribute name to props key (e.g., class-name to className)
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Special cases for common attributes
    let propValue = value;
    
    // Handle boolean attributes
    if (value === '' || value === name) {
      propValue = true;
    }
    
    // For style attribute, parse it into an object and convert to blessed format
    if (name === 'style' && typeof value === 'string') {
      const cssStyles = parseStyleAttribute(value);
      propValue = convertCssToBlessed(cssStyles);
    }
    
    // For class attribute, use className
    if (name === 'class') {
      node._terminalElement.setProps({
        ...node._terminalElement.props,
        className: value,
      });
    } else {
      // Update the terminal element's props
      node._terminalElement.setProps({
        ...node._terminalElement.props,
        [propName]: propValue,
      });
    }
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Parse a CSS style string into an object
 * @param styleStr - CSS style string
 * @returns Style object
 */
function parseStyleAttribute(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const styles = styleStr.split(';');
  
  for (const style of styles) {
    const [key, value] = style.split(':').map(s => s.trim());
    if (key && value) {
      // Convert kebab-case to camelCase
      const propName = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      result[propName] = value;
    }
  }
  
  return result;
}

/**
 * Convert CSS styles to blessed-compatible styles
 * @param cssStyles - Object with CSS properties
 * @returns Blessed-compatible style object
 */
function convertCssToBlessed(cssStyles: Record<string, string>): Record<string, any> {
  const blessedStyle: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(cssStyles)) {
    switch (key) {
      // Colors
      case 'color':
        blessedStyle.fg = value;
        break;
      case 'backgroundColor':
      case 'background':
        blessedStyle.bg = value;
        break;
      
      // Font styles
      case 'fontWeight':
        if (value === 'bold' || value === '700' || value === '800' || value === '900') {
          blessedStyle.bold = true;
        }
        break;
      case 'textDecoration':
        if (value.includes('underline')) {
          blessedStyle.underline = true;
        }
        break;
      case 'fontStyle':
        if (value === 'italic') {
          // Blessed doesn't support italic, but we can note it
          blessedStyle.italic = true;
        }
        break;
      
      // Border styles
      case 'border':
        // Simple border parsing (e.g., "2px solid #00ff00")
        const borderParts = value.split(' ');
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: 'line',
            fg: borderParts[2] || 'white'
          };
        }
        break;
      case 'borderColor':
        if (!blessedStyle.border) {
          blessedStyle.border = { type: 'line' };
        }
        blessedStyle.border.fg = value;
        break;
      
      // Spacing - blessed doesn't support these directly
      case 'padding':
      case 'margin':
      case 'marginTop':
      case 'marginRight':
      case 'marginBottom':
      case 'marginLeft':
        // These could be parsed but blessed handles them differently
        break;
      
      // Size and positioning are handled separately in blessed
      case 'width':
      case 'height':
      case 'top':
      case 'left':
      case 'right':
      case 'bottom':
        // These are element properties, not style properties in blessed
        break;
      
      // Text visibility
      case 'visibility':
        if (value === 'hidden') {
          blessedStyle.invisible = true;
        }
        break;
      
      // Other CSS properties that don't map to blessed
      default:
        // Ignore or log unhandled properties
        break;
    }
  }
  
  return blessedStyle;
}

/**
 * Removes an element's attribute
 * @param node - Element node
 * @param name - Attribute name
 */
export function removeAttribute(node: TerminalElementNode, name: string): void {
  // Update the DOM node
  node.removeAttribute(name);
  
  // Update the terminal element if it has been created
  if (node._terminalElement) {
    // Convert attribute name to props key (e.g., class-name to className)
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Create a copy of props without the attribute
    const props = { ...node._terminalElement.props };
    delete props[propName];
    
    // Special case for class attribute
    if (name === 'class') {
      delete props['className'];
    }
    
    // Update the terminal element's props
    node._terminalElement.setProps(props);
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Sets a node's text content
 * @param node - Text node
 * @param text - Text content
 */
export function setText(node: TerminalTextNode, text: string): void {
  // Update the DOM node
  node.nodeValue = text;
  
  // Update parent if it's a terminal element
  const parent = node.parentNode;
  if (parent && parent.nodeType === 1) {
    const parentElement = (parent as TerminalElementNode)._terminalElement;
    
    if (parentElement) {
      // For certain element types, update the content
      if (
        parentElement.type === 'text' ||
        parentElement.type === 'button' ||
        parentElement.type === 'box'
      ) {
        parentElement.setProps({
          ...parentElement.props,
          content: text,
        });
      }
    }
  }
  
  // Force a reconciler flush to ensure the terminal is updated
  const reconciler = getReconciler();
  reconciler.forceFlush();
  
  // Refresh the terminal display
  refresh();
}

/**
 * Sets element properties
 * @param node - Element node
 * @param props - Properties to set
 */
export function setElementProps(
  node: TerminalElementNode,
  props: Record<string, any>
): void {
  // Set attributes
  for (const [name, value] of Object.entries(props)) {
    if (value !== undefined && value !== null) {
      setAttribute(node, name, value);
    } else {
      removeAttribute(node, name);
    }
  }
}

/**
 * Event handlers for nodes
 */
const nodeEventHandlers = new WeakMap<TerminalElementNode, Record<string, (event: any) => void>>();

/**
 * Adds an event listener
 * @param node - Element node
 * @param event - Event name
 * @param handler - Event handler
 */
export function addEventListener(
  node: TerminalElementNode,
  event: string,
  handler: (event: any) => void
): void {
  // Get or create event handlers for the node
  let handlers = nodeEventHandlers.get(node);
  if (!handlers) {
    handlers = {};
    nodeEventHandlers.set(node, handlers);
  }
  
  // Store the handler
  handlers[event] = handler;
  
  // If the terminal element exists, add the handler
  if (node._terminalElement && node._terminalElement.blessed) {
    // Map event names to blessed events
    const blessedEvent = mapEventToBlessedEvent(event);
    
    // For certain events, we need special handling
    if (event === 'click' || event === 'mousedown' || event === 'mouseup') {
      node._terminalElement.blessed.on('mouse', (data: any) => {
        if (data.action === blessedEvent) {
          // Create a synthetic event
          const syntheticEvent = {
            type: event,
            target: node,
            currentTarget: node,
            preventDefault: () => {},
            stopPropagation: () => {},
            bubbles: true,
            data
          };
          
          // Call the handler
          handler(syntheticEvent);
        }
      });
    } else if (event === 'keydown' || event === 'keyup' || event === 'keypress') {
      node._terminalElement.blessed.on('keypress', (ch: string, key: any) => {
        // Create a synthetic event
        const syntheticEvent = {
          type: event,
          target: node,
          currentTarget: node,
          preventDefault: () => {},
          stopPropagation: () => {},
          bubbles: true,
          key: key.name,
          keyCode: key.charCodeAt(0),
          char: ch,
          originalEvent: key
        };
        
        // Call the handler
        handler(syntheticEvent);
      });
    } else {
      // Standard event
      node._terminalElement.blessed.on(blessedEvent, (data: any) => {
        // Create a synthetic event
        const syntheticEvent = {
          type: event,
          target: node,
          currentTarget: node,
          preventDefault: () => {},
          stopPropagation: () => {},
          bubbles: true,
          data
        };
        
        // Call the handler
        handler(syntheticEvent);
      });
    }
  }
}

/**
 * Removes an event listener
 * @param node - Element node
 * @param event - Event name
 */
export function removeEventListener(
  node: TerminalElementNode,
  event: string
): void {
  // Remove the handler from the node
  const handlers = nodeEventHandlers.get(node);
  if (handlers) {
    delete handlers[event];
  }
  
  // If the terminal element exists, remove the handler
  if (node._terminalElement && node._terminalElement.blessed) {
    // Map event names to blessed events
    const blessedEvent = mapEventToBlessedEvent(event);
    
    // For certain events, we need special handling
    if (event === 'click' || event === 'mousedown' || event === 'mouseup') {
      node._terminalElement.blessed.removeAllListeners('mouse');
    } else if (event === 'keydown' || event === 'keyup' || event === 'keypress') {
      node._terminalElement.blessed.removeAllListeners('keypress');
    } else {
      // Standard event
      node._terminalElement.blessed.removeAllListeners(blessedEvent);
    }
  }
}

/**
 * Maps a DOM event name to a blessed event name
 * @param event - DOM event name
 * @returns Blessed event name
 */
function mapEventToBlessedEvent(event: string): string {
  // Map common DOM events to blessed events
  switch (event) {
    case 'click':
      return 'click';
    case 'mousedown':
      return 'mousedown';
    case 'mouseup':
      return 'mouseup';
    case 'mouseover':
      return 'mouseover';
    case 'mouseout':
      return 'mouseout';
    case 'keydown':
      return 'keypress';
    case 'keyup':
      return 'key';
    case 'keypress':
      return 'keypress';
    case 'focus':
      return 'focus';
    case 'blur':
      return 'blur';
    case 'submit':
      return 'submit';
    case 'change':
      return 'action';
    case 'input':
      return 'value';
    case 'select':
      return 'select';
    default:
      return event;
  }
}

// These functions will be called by Svelte's runtime via the compiler plugin

/**
 * Creates a new DOM element
 * @param tag - Element tag
 * @returns The created element
 */
export function __sveltui_createElement(tag: string): TerminalNode {
  return createElement(tag);
}

/**
 * Creates a new text node
 * @param text - Text content
 * @returns The created text node
 */
export function __sveltui_createTextNode(text: string): TerminalTextNode {
  return createText(text);
}

/**
 * Creates a new comment node
 * @param text - Comment text
 * @returns The created comment node
 */
export function __sveltui_createComment(text: string): TerminalNode {
  return createComment(text);
}

/**
 * Appends a child to a parent
 * @param parent - Parent node
 * @param child - Child node
 */
export function __sveltui_appendChild(
  parent: TerminalNode,
  child: TerminalNode
): void {
  appendChild(parent, child);
}

/**
 * Inserts a node before another
 * @param parent - Parent node
 * @param node - Node to insert
 * @param anchor - Reference node
 */
export function __sveltui_insertBefore(
  parent: TerminalNode,
  node: TerminalNode,
  anchor: TerminalNode | null
): void {
  parent.insertBefore(node, anchor);
  refresh();
}

/**
 * Removes a child node
 * @param parent - Parent node
 * @param child - Child node
 */
export function __sveltui_removeChild(
  parent: TerminalNode,
  child: TerminalNode
): void {
  removeChild(parent, child);
}

/**
 * Sets an attribute on a node
 * @param node - Element node
 * @param attr - Attribute name
 * @param value - Attribute value
 */
export function __sveltui_setAttribute(
  node: TerminalElementNode,
  attr: string,
  value: any
): void {
  setAttribute(node, attr, value);
}

/**
 * Removes an attribute from a node
 * @param node - Element node
 * @param attr - Attribute name
 */
export function __sveltui_removeAttribute(
  node: TerminalElementNode,
  attr: string
): void {
  removeAttribute(node, attr);
}

/**
 * Sets text content on a node
 * @param node - Text node
 * @param text - Text content
 */
export function __sveltui_setText(node: TerminalTextNode, text: string): void {
  setText(node, text);
}

/**
 * Adds an event listener to a node
 * @param node - Element node
 * @param event - Event name
 * @param handler - Event handler
 */
export function __sveltui_addEventListener(
  node: TerminalElementNode,
  event: string,
  handler: (event: any) => void
): void {
  addEventListener(node, event, handler);
}

/**
 * Removes an event listener from a node
 * @param node - Element node
 * @param event - Event name
 */
export function __sveltui_removeEventListener(
  node: TerminalElementNode,
  event: string
): void {
  removeEventListener(node, event);
}

/**
 * The global document object
 */
export const __sveltui_document = document;

/**
 * The global window object
 * This is a minimal implementation for Svelte's runtime
 */
export const __sveltui_window = {
  document: __sveltui_document,
  addEventListener: (event: string, handler: () => void) => {
    // Map global window events to terminal events
    if (event === 'keydown' || event === 'keypress') {
      // Get the screen from the document
      const screen = (document as any).screen;
      if (screen) {
        screen.on('keypress', (ch: string, key: any) => {
          // Create a synthetic event
          const syntheticEvent = {
            type: event,
            target: window,
            currentTarget: window,
            preventDefault: () => {},
            stopPropagation: () => {},
            key: key.name,
            keyCode: key.charCodeAt(0),
            char: ch,
            originalEvent: key
          };
          
          // Call the handler
          handler();
        });
      }
    }
  },
  removeEventListener: (event: string, handler: () => void) => {
    // No window implementation in terminal
  },
  location: {
    href: 'sveltui://terminal',
    origin: 'sveltui://terminal',
    protocol: 'sveltui:',
    host: 'terminal',
    hostname: 'terminal',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
  },
  navigator: {
    userAgent: 'SvelTUI Terminal',
  },
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,
  requestAnimationFrame: (callback: () => void) => {
    // Use setTimeout as a fallback for requestAnimationFrame
    return setTimeout(callback, 16); // approx 60fps
  },
  cancelAnimationFrame: (id: number) => {
    clearTimeout(id);
  }
};

/**
 * The root element for the terminal
 */
export const __sveltui_root = document.createElement('div');

/**
 * Setup binding for a property
 * Called when a bindable property is created
 * @param node - Element node
 * @param propName - Property name
 * @param getValue - Function to get current value
 * @param setValue - Function to set new value
 */
export function setupPropertyBinding(
  node: TerminalElementNode,
  propName: string,
  getValue: () => any,
  setValue: (value: any) => void
): () => void {
  // Wait for terminal element to be created
  if (!node._terminalElement) {
    // Return empty cleanup function if no element yet
    return () => {};
  }
  
  // Set up the binding
  const syncFn = setupBinding(node._terminalElement, propName, getValue, setValue);
  
  // Return cleanup function
  return () => {
    if (node._terminalElement) {
      cleanupBindings(node._terminalElement);
    }
  };
}

/**
 * Clean up all bindings when element is destroyed
 * @param node - Element node
 */
export function cleanupElementBindings(node: TerminalElementNode): void {
  if (node._terminalElement) {
    cleanupBindings(node._terminalElement);
  }
}