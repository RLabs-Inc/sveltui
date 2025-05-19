/**
 * Key Handling Utilities for SveltUI
 *
 * This module provides simple, blessed-aligned utilities for key handling
 * and focus management in SveltUI applications.
 */

import * as blessed from "blessed";

/**
 * Sets up tab navigation between a set of elements
 *
 * @param screen The blessed screen
 * @param elements Array of elements in tab order
 */
export function setupTabNavigation(
  screen: blessed.Widgets.Screen,
  elements: blessed.Widgets.BlessedElement[]
): () => void {
  // Skip if no elements
  if (!elements || elements.length === 0) return () => {};

  // Forward tab handler
  const tabHandler = (ch: string, key: any) => {
    const currentIndex = elements.indexOf(screen.focused);
    const nextIndex = (currentIndex + 1) % elements.length;
    elements[nextIndex].focus();
    screen.render();
  };

  // Reverse tab handler
  const shiftTabHandler = (ch: string, key: any) => {
    const currentIndex = elements.indexOf(screen.focused);
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
    elements[prevIndex].focus();
    screen.render();
  };

  // Register handlers
  screen.key("tab", tabHandler);
  screen.key("S-tab", shiftTabHandler);

  // Return cleanup function
  return () => {
    screen.unkey("tab", tabHandler);
    screen.unkey("S-tab", shiftTabHandler);
  };
}

/**
 * Sets up standard keys for exiting the application
 *
 * @param screen The blessed screen
 * @param callback Optional callback before exiting
 */
export function setupExitKeys(
  screen: blessed.Widgets.Screen,
  callback?: () => void
): () => void {
  const exitHandler = () => {
    if (callback) callback();
    process.exit(0);
  };

  screen.key(["q", "C-c"], exitHandler);

  return () => {
    screen.unkey(["q", "C-c"], exitHandler);
  };
}

/**
 * Sets up input component handling including proper tab/escape behavior
 *
 * @param inputElement The input element
 * @param options Options for input behavior
 */
export function setupInputHandling(
  inputElement: blessed.Widgets.BlessedElement,
  options: {
    onEscape?: () => void;
    onSubmit?: (value: string) => void;
  } = {}
): () => void {
  // Escape handler
  const escapeHandler = (ch: string, key: any) => {
    // Clear focus
    inputElement.screen.focused = null;

    // Call escape callback if provided
    if (options.onEscape) options.onEscape();

    inputElement.screen.render();
  };

  // Submit handler (already handled by blessed, but we can add custom logic)
  const submitHandler = () => {
    if (options.onSubmit && "getValue" in inputElement) {
      options.onSubmit((inputElement as any).getValue());
    }
  };

  // Register handlers
  inputElement.key("escape", escapeHandler);

  // If the input has a submit event, listen for it
  if (options.onSubmit) {
    inputElement.on("submit", submitHandler);
  }

  // Return cleanup function
  return () => {
    inputElement.unkey("escape", escapeHandler);
    if (options.onSubmit) {
      inputElement.removeListener("submit", submitHandler);
    }
  };
}

/**
 * Helper function to focus the first element in a group
 *
 * @param elements Array of elements
 */
export function focusFirst(elements: blessed.Widgets.BlessedElement[]): void {
  if (elements.length > 0 && elements[0].focus) {
    elements[0].focus();
    elements[0].screen.render();
  }
}

/**
 * Helper for standardizing object-to-string display
 * Handles the common case of receiving an object when expecting a string
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      // Try to get a string representation without circular references
      const seen = new WeakSet();
      const replacer = (_key: string, val: any) => {
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) {
            return "[Circular]";
          }
          seen.add(val);
        }
        return val;
      };

      return JSON.stringify(value, replacer);
    } catch (e) {
      return "[Object]";
    }
  }

  return String(value);
}
