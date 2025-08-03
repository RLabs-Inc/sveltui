/**
 * Binding Utilities for SvelTUI
 * 
 * Helper functions for creating two-way bindings between Svelte and blessed
 */

import type { TerminalElement } from './nodes';

export interface BindingConfig {
  /**
   * The property name on the blessed element
   */
  blessedProp: string;
  
  /**
   * The event that triggers updates from blessed
   */
  blessedEvent?: string;
  
  /**
   * Transform value from Svelte to blessed
   */
  toBlessed?: (value: any) => any;
  
  /**
   * Transform value from blessed to Svelte
   */
  fromBlessed?: (value: any) => any;
  
  /**
   * Debounce time in ms for updates
   */
  debounce?: number;
}

/**
 * Create a two-way binding between a Svelte property and a blessed element
 */
export function createBinding(
  element: TerminalElement,
  svelteProp: { value: any },
  config: BindingConfig
) {
  let debounceTimer: NodeJS.Timeout | null = null;
  
  // Function to update blessed element from Svelte
  const updateBlessed = () => {
    const blessedValue = config.toBlessed ? config.toBlessed(svelteProp.value) : svelteProp.value;
    
    if (element.blessed && element.blessed[config.blessedProp] !== blessedValue) {
      element.blessed[config.blessedProp] = blessedValue;
      
      // Some blessed widgets need explicit refresh
      if ('setValue' in element.blessed && config.blessedProp === 'value') {
        (element.blessed as any).setValue(blessedValue);
      }
      
      element.blessed.screen?.render();
    }
  };
  
  // Function to update Svelte from blessed
  const updateSvelte = (blessedValue: any) => {
    const svelteValue = config.fromBlessed ? config.fromBlessed(blessedValue) : blessedValue;
    
    if (svelteProp.value !== svelteValue) {
      if (config.debounce && debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      const doUpdate = () => {
        svelteProp.value = svelteValue;
      };
      
      if (config.debounce) {
        debounceTimer = setTimeout(doUpdate, config.debounce);
      } else {
        doUpdate();
      }
    }
  };
  
  // Set up blessed event listener if specified
  if (config.blessedEvent && element.blessed) {
    element.blessed.on(config.blessedEvent, (data: any) => {
      const value = data?.[config.blessedProp] ?? data?.value ?? data;
      updateSvelte(value);
    });
  }
  
  // Initial sync from Svelte to blessed
  updateBlessed();
  
  // Return updater function for reactive updates
  return {
    update: updateBlessed,
    destroy: () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    }
  };
}

/**
 * Common binding configurations
 */
export const CommonBindings = {
  /**
   * Text input value binding
   */
  inputValue: {
    blessedProp: 'value',
    blessedEvent: 'submit',
    toBlessed: (v: any) => String(v),
    fromBlessed: (v: any) => String(v)
  } as BindingConfig,
  
  /**
   * Checkbox checked binding
   */
  checkboxChecked: {
    blessedProp: 'checked',
    blessedEvent: 'check',
    toBlessed: (v: any) => Boolean(v),
    fromBlessed: (v: any) => Boolean(v)
  } as BindingConfig,
  
  /**
   * List selected index binding
   */
  listSelected: {
    blessedProp: 'selected',
    blessedEvent: 'select',
    toBlessed: (v: any) => Number(v),
    fromBlessed: (data: any) => {
      // blessed list events pass index in different ways
      return typeof data === 'number' ? data : (data?.index ?? 0);
    }
  } as BindingConfig,
  
  /**
   * Textarea value binding with debounce
   */
  textareaValue: {
    blessedProp: 'value',
    blessedEvent: 'submit',
    toBlessed: (v: any) => String(v),
    fromBlessed: (v: any) => String(v),
    debounce: 300
  } as BindingConfig
};

/**
 * Helper to sync a property between Svelte and blessed continuously
 */
export function syncProperty(
  element: TerminalElement,
  propName: string,
  getValue: () => any,
  setValue: (value: any) => void,
  options: {
    toBlessed?: (value: any) => any;
    fromBlessed?: (value: any) => any;
    blessedEvent?: string;
  } = {}
) {
  // Update blessed when Svelte changes
  const updateBlessed = () => {
    const value = getValue();
    const blessedValue = options.toBlessed ? options.toBlessed(value) : value;
    
    if (element.blessed && element.blessed[propName] !== blessedValue) {
      element.blessed[propName] = blessedValue;
      element.blessed.screen?.render();
    }
  };
  
  // Update Svelte when blessed changes
  if (options.blessedEvent && element.blessed) {
    element.blessed.on(options.blessedEvent, (data: any) => {
      const blessedValue = data?.[propName] ?? data?.value ?? data;
      const value = options.fromBlessed ? options.fromBlessed(blessedValue) : blessedValue;
      setValue(value);
    });
  }
  
  // Initial sync
  updateBlessed();
  
  return updateBlessed;
}

/**
 * Create a managed binding that handles lifecycle
 */
export class ManagedBinding {
  private bindings: Array<{ update: () => void; destroy: () => void }> = [];
  
  add(
    element: TerminalElement,
    svelteProp: { value: any },
    config: BindingConfig
  ) {
    const binding = createBinding(element, svelteProp, config);
    this.bindings.push(binding);
    return binding;
  }
  
  updateAll() {
    for (const binding of this.bindings) {
      binding.update();
    }
  }
  
  destroy() {
    for (const binding of this.bindings) {
      binding.destroy();
    }
    this.bindings = [];
  }
}