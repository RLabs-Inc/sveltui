/**
 * Binding Bridge for SvelTUI
 * 
 * Bridges Svelte's reactive system with blessed element properties
 * Ensures proper two-way data flow between Svelte components and terminal elements
 */

import type { TerminalElement } from './nodes';

/**
 * Property binding metadata
 */
interface BindingMetadata {
  /**
   * The Svelte property name (e.g., 'value', 'checked')
   */
  svelteProp: string;
  
  /**
   * The blessed property name (may differ from Svelte)
   */
  blessedProp: string;
  
  /**
   * The blessed event that triggers updates
   */
  updateEvent?: string;
  
  /**
   * Transform function from Svelte to blessed
   */
  toBlessed?: (value: any) => any;
  
  /**
   * Transform function from blessed to Svelte
   */
  fromBlessed?: (value: any) => any;
}

/**
 * Registry of binding metadata for different element types
 */
const BINDING_REGISTRY: Record<string, Record<string, BindingMetadata>> = {
  input: {
    value: {
      svelteProp: 'value',
      blessedProp: 'value',
      updateEvent: 'submit',
      toBlessed: (v) => String(v || ''),
      fromBlessed: (v) => String(v || '')
    }
  },
  
  checkbox: {
    checked: {
      svelteProp: 'checked',
      blessedProp: 'checked',
      updateEvent: 'check',
      toBlessed: (v) => Boolean(v),
      fromBlessed: (v) => Boolean(v)
    }
  },
  
  list: {
    selected: {
      svelteProp: 'selected',
      blessedProp: 'selected',
      updateEvent: 'select',
      toBlessed: (v) => Number(v) || 0,
      fromBlessed: (event) => {
        // Blessed list passes different event formats
        if (typeof event === 'number') return event;
        if (event && typeof event.index === 'number') return event.index;
        if (event && event.detail && typeof event.detail.index === 'number') return event.detail.index;
        return 0;
      }
    }
  },
  
  textarea: {
    value: {
      svelteProp: 'value',
      blessedProp: 'value',
      updateEvent: 'submit',
      toBlessed: (v) => String(v || ''),
      fromBlessed: (v) => String(v || '')
    }
  }
};

/**
 * Set up two-way binding for an element
 */
export function setupBinding(
  element: TerminalElement,
  propName: string,
  getValue: () => any,
  setValue: (value: any) => void
) {
  const elementType = element.type;
  const bindings = BINDING_REGISTRY[elementType];
  
  if (!bindings || !bindings[propName]) {
    // No special binding needed for this property
    return;
  }
  
  const metadata = bindings[propName];
  
  // Function to sync from Svelte to blessed
  const syncToBlessed = () => {
    if (!element.blessed) return;
    
    const svelteValue = getValue();
    const blessedValue = metadata.toBlessed ? metadata.toBlessed(svelteValue) : svelteValue;
    
    // Update blessed element if value changed
    if (element.blessed[metadata.blessedProp] !== blessedValue) {
      element.blessed[metadata.blessedProp] = blessedValue;
      
      // Some blessed widgets need special handling
      if (elementType === 'input' && 'setValue' in element.blessed) {
        (element.blessed as any).setValue(blessedValue);
      }
      
      // Trigger screen render
      element.blessed.screen?.render();
    }
  };
  
  // Function to sync from blessed to Svelte
  const syncFromBlessed = (eventData: any) => {
    const blessedValue = metadata.fromBlessed ? metadata.fromBlessed(eventData) : eventData;
    const currentValue = getValue();
    
    // Only update if value actually changed
    if (currentValue !== blessedValue) {
      setValue(blessedValue);
    }
  };
  
  // Set up event listener for blessed updates
  if (metadata.updateEvent && element.blessed) {
    element.blessed.on(metadata.updateEvent, syncFromBlessed);
    
    // Store cleanup function
    element._bindingCleanup = element._bindingCleanup || [];
    element._bindingCleanup.push(() => {
      element.blessed?.off(metadata.updateEvent, syncFromBlessed);
    });
  }
  
  // Initial sync from Svelte to blessed
  syncToBlessed();
  
  // Return sync function for reactive updates
  return syncToBlessed;
}

/**
 * Clean up all bindings for an element
 */
export function cleanupBindings(element: TerminalElement) {
  if (element._bindingCleanup) {
    for (const cleanup of element._bindingCleanup) {
      cleanup();
    }
    element._bindingCleanup = [];
  }
}

/**
 * Check if a property needs two-way binding
 */
export function needsBinding(elementType: string, propName: string): boolean {
  return !!(BINDING_REGISTRY[elementType]?.[propName]);
}

/**
 * Get binding metadata for a property
 */
export function getBindingMetadata(elementType: string, propName: string): BindingMetadata | null {
  return BINDING_REGISTRY[elementType]?.[propName] || null;
}