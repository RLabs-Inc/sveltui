/**
 * Bindable Property System for SvelTUI
 * 
 * Creates bindable properties that sync between Svelte state and blessed elements
 * Compatible with Svelte's bind: directive
 */

export interface BindableOptions<T> {
  /**
   * Initial value for the property
   */
  initial: T;
  
  /**
   * Optional validation function
   * Returns true if value is valid, false otherwise
   */
  validate?: (value: T) => boolean;
  
  /**
   * Optional transformation function for incoming values
   * Useful for type conversions or formatting
   */
  transform?: (value: any) => T;
  
  /**
   * Optional transformation for outgoing values to blessed
   * Useful when blessed expects different format
   */
  toBlessedTransform?: (value: T) => any;
  
  /**
   * Optional callback when value changes
   */
  onChange?: (value: T) => void;
}

/**
 * Creates a bindable property that syncs with blessed elements
 * Uses $state for reactivity
 */
export function createBindable<T>(options: BindableOptions<T>) {
  let value = $state(options.initial);
  
  return {
    get value() {
      return value;
    },
    
    set value(newValue: T) {
      // Apply transformation if provided
      const transformedValue = options.transform ? options.transform(newValue) : newValue;
      
      // Validate if validator provided
      if (options.validate && !options.validate(transformedValue)) {
        return;
      }
      
      // Update state
      value = transformedValue;
      
      // Call onChange callback if provided
      options.onChange?.(transformedValue);
    },
    
    /**
     * Get value formatted for blessed element
     */
    get blessedValue() {
      return options.toBlessedTransform ? options.toBlessedTransform(value) : value;
    },
    
    /**
     * Update from blessed element
     */
    updateFromBlessed(blessedValue: any) {
      this.value = options.transform ? options.transform(blessedValue) : blessedValue;
    }
  };
}

/**
 * Common bindable property presets
 */
export const BindablePresets = {
  /**
   * String property with optional max length
   */
  string(initial = '', maxLength?: number): BindableOptions<string> {
    return {
      initial,
      transform: (value) => String(value),
      validate: maxLength ? (value) => value.length <= maxLength : undefined
    };
  },
  
  /**
   * Boolean property
   */
  boolean(initial = false): BindableOptions<boolean> {
    return {
      initial,
      transform: (value) => Boolean(value)
    };
  },
  
  /**
   * Number property with optional min/max
   */
  number(initial = 0, min?: number, max?: number): BindableOptions<number> {
    return {
      initial,
      transform: (value) => {
        const num = Number(value);
        if (isNaN(num)) return initial;
        if (min !== undefined && num < min) return min;
        if (max !== undefined && num > max) return max;
        return num;
      }
    };
  },
  
  /**
   * Array index property (for lists)
   */
  index(initial = 0, itemCount = 0): BindableOptions<number> {
    return {
      initial,
      transform: (value) => {
        const num = Number(value);
        if (isNaN(num)) return initial;
        return Math.max(0, Math.min(itemCount - 1, num));
      }
    };
  }
};

/**
 * Helper to create a bindable property with common presets
 */
export function bindable<T>(initial: T, options?: Partial<BindableOptions<T>>) {
  return createBindable({
    initial,
    ...options
  });
}