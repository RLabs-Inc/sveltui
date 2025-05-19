<script lang="ts">
  /**
   * Input component for text input
   * 
   * This component provides a text input field that users can type in.
   */
  
  import type { ComponentProps } from '../core/types';

  let {
    // Input state
    value = $bindable(''),
    placeholder = '',
    
    // Layout properties
    width = '50%',
    height = 3,
    top = undefined as (number | string | undefined),
    left = undefined as (number | string | undefined),
    right = undefined as (number | string | undefined),
    bottom = undefined as (number | string | undefined),
    
    // Style properties
    border = true,
    style = {},
    
    // Events
    onChange = undefined as ((value: string) => void) | undefined,
    onSubmit = undefined as ((value: string) => void) | undefined,
    onFocus = undefined as (() => void) | undefined,
    onBlur = undefined as (() => void) | undefined
  } = $props();
  
  // Internal state
  let isFocused = $state(false);
  
  // Focus/blur handlers
  function handleFocus() {
    isFocused = true;
    if (onFocus) onFocus();
  }
  
  function handleBlur() {
    isFocused = false;
    if (onBlur) onBlur();
  }
</script>

<!-- No template needed - our renderer handles this -->