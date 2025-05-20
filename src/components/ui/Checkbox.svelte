<script lang="ts">
  /**
   * A checkbox component for terminal UIs.
   * Supports checked, unchecked, and indeterminate states.
   * 
   * Tab navigation between multiple Checkbox components should be implemented
   * at the application level using screen.key(['tab']) handlers.
   */

  let {
    // Current checked state
    checked = $bindable(false),
    
    // Indeterminate state (displays differently than checked/unchecked)
    indeterminate = $bindable(false),
    
    // Label text for the checkbox
    label = "",
    
    // Whether the checkbox is disabled
    disabled = false,
    
    // Style and layout properties
    width = "100%",
    height = 1,
    style = {},
    
    // Events
    onChange = undefined as ((checked: boolean) => void) | undefined,
    
    // Focus handlers - useful for updating UI when component gains/loses focus
    handleFocus = undefined as (() => void) | undefined,
    handleBlur = undefined as (() => void) | undefined
  } = $props();
  
  // Track focus state
  let isFocused = $state(false);
  
  // Toggle the checkbox
  function toggle() {
    if (disabled) return;
    
    if (indeterminate) {
      indeterminate = false;
      checked = true;
    } else {
      checked = !checked;
    }
    
    if (onChange) {
      onChange(checked);
    }
  }
  
  // Handle key navigation
  function handleKeyNavigation(key: string): boolean {
    if (disabled) return false;
    
    switch (key) {
      case 'enter':
      case 'return': // Add support for return key
      case 'space':
        toggle();
        return true;
      default:
        return false;
    }
  }
  
  // Focus and blur handlers
  function handleFocusEvent() {
    isFocused = true;
    if (handleFocus) handleFocus();
  }
  
  function handleBlurEvent() {
    isFocused = false;
    if (handleBlur) handleBlur();
  }
</script>

<!-- No template needed - our renderer handles this -->