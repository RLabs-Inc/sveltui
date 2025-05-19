<script lang="ts">
  /**
   * A dropdown select component for terminal UIs.
   * Allows users to select an option from a list with keyboard navigation.
   * 
   * Tab navigation between multiple Select components should be implemented
   * at the application level using screen.key(['tab']) handlers.
   */
  import type { Option } from '../core/types';

  let {
    // Array of options - can be strings or Option objects with label and value
    options = [] as (Option | string)[],
    
    // Currently selected value
    value = $bindable(''),
    
    // Placeholder text when no value is selected
    placeholder = 'Select an option...',
    
    // Whether the select is currently open (showing options)
    open = $bindable(false),
    
    // Layout properties
    width = '50%',
    height = 3, // Height when closed
    maxHeight = 10, // Max height of dropdown when open
    top = undefined as (number | string | undefined),
    left = undefined as (number | string | undefined),
    right = undefined as (number | string | undefined),
    bottom = undefined as (number | string | undefined),
    
    // Style properties
    border = true,
    style = {},
    
    // Events
    onChange = undefined as ((value: string) => void) | undefined,
    onOpen = undefined as (() => void) | undefined,
    onClose = undefined as (() => void) | undefined,
    onFocus = undefined as (() => void) | undefined,
    onBlur = undefined as (() => void) | undefined,
  } = $props();

  // Internal state
  let isFocused = $state(false);
  let focusedIndex = $state(0);
  
  // Handle opening/closing the dropdown
  function toggleDropdown() {
    open = !open;
    
    if (open) {
      // Find and focus the index of the currently selected value
      const selectedIndex = getOptions().findIndex(opt => opt.value === value);
      focusedIndex = selectedIndex >= 0 ? selectedIndex : 0;
      
      if (onOpen) onOpen();
    } else {
      if (onClose) onClose();
    }
  }
  
  // Helper to normalize options
  function getOptions(): Option[] {
    return options.map(opt => 
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    );
  }
  
  // Handle selecting an option
  function selectOption(index: number) {
    const normalizedOptions = getOptions();
    
    if (index >= 0 && index < normalizedOptions.length) {
      const selectedOption = normalizedOptions[index];
      value = selectedOption.value;
      
      if (onChange) onChange(selectedOption.value);
      
      // Close the dropdown after selection
      open = false;
      if (onClose) onClose();
    }
  }
  
  // Keyboard navigation handler for when dropdown is open
  function handleKeyNavigation(key: string) {
    if (!open) {
      // If dropdown is closed, open it on Enter, Space, or ArrowDown
      if (key === 'enter' || key === 'return' || key === 'space' || key === 'down') {
        toggleDropdown();
        return true; // Key was handled
      }
      return false; // Key was not handled
    }
    
    const normalizedOptions = getOptions();
    
    switch (key) {
      case 'escape':
        // Close without selecting
        open = false;
        if (onClose) onClose();
        return true;
        
      case 'enter':
      case 'return':
      case 'space':
        // Select the currently focused option
        selectOption(focusedIndex);
        return true;
        
      case 'up':
        // Move focus up
        focusedIndex = Math.max(0, focusedIndex - 1);
        return true;
        
      case 'down':
        // Move focus down
        focusedIndex = Math.min(normalizedOptions.length - 1, focusedIndex + 1);
        return true;
        
      case 'home':
        // Move to first option
        focusedIndex = 0;
        return true;
        
      case 'end':
        // Move to last option
        focusedIndex = normalizedOptions.length - 1;
        return true;
        
      default:
        // Handle character search (first letter navigation)
        const key_char = String.fromCharCode(key.charCodeAt(0)).toLowerCase();
        if (/^[a-z0-9]$/.test(key_char)) {
          // Find the next option that starts with this character
          for (let i = 1; i <= normalizedOptions.length; i++) {
            const index = (focusedIndex + i) % normalizedOptions.length;
            const option = normalizedOptions[index];
            
            if (option.label.toLowerCase().startsWith(key_char)) {
              focusedIndex = index;
              return true;
            }
          }
        }
        return false;
    }
  }
  
  // Focus and blur event handlers
  function handleFocus() {
    isFocused = true;
    if (onFocus) onFocus();
  }
  
  function handleBlur() {
    isFocused = false;
    open = false;
    if (onClose) onClose();
    if (onBlur) onBlur();
  }
</script>

<!-- No template needed - our renderer handles this -->