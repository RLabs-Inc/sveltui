/**
 * Input Component
 * 
 * A text input component for user input
 */

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Define component props with defaults
  let {
    // Position properties
    left = 0,
    top = 0,
    right,
    bottom,
    
    // Dimension properties
    width = '50%',
    height = 1,
    
    // Input value
    value = $bindable(''),
    
    // Placeholder text
    placeholder = '',
    
    // Password mode
    secret = false,
    
    // Input is disabled/readonly
    disabled = false,
    
    // Maximum input length
    maxLength,
    
    // Appearance properties
    border = false,
    
    // Style properties
    style = {},
    
    // Focus behavior
    focusable = true,
    inputOnFocus = true,
    
    // Keyboard support
    keys = true,
    
    // Mouse support
    mouse = true,
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props will be passed to the input element
    ...restProps
  } = $props();
  
  // Track input value internally
  let inputValue = $state(value);
  
  // Update internal state when prop changes
  $effect(() => {
    inputValue = value;
  });
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Handle value change
  function handleChange(event: any) {
    if (disabled) return;
    
    const newValue = event.value;
    
    // Apply maxLength restriction if specified
    if (maxLength !== undefined && newValue.length > maxLength) {
      return;
    }
    
    inputValue = newValue;
    dispatch('change', { value: newValue });
  }
  
  // Handle submit event (Enter key)
  function handleSubmit() {
    if (disabled) return;
    
    dispatch('submit', { value: inputValue });
  }
  
  // Focus the input element
  export function focus() {
    // This will be handled by the runtime DOM connector
    dispatch('focus');
  }
  
  // Select all text in the input
  export function selectAll() {
    // This will be handled by the runtime DOM connector
    dispatch('selectAll');
  }
  
  // Clear the input
  export function clear() {
    inputValue = '';
    dispatch('change', { value: '' });
  }
</script>

<input
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  value={inputValue}
  placeholder={placeholder}
  secret={secret}
  disabled={disabled}
  border={borderValue}
  style={style}
  keys={keys}
  mouse={mouse}
  inputOnFocus={inputOnFocus}
  focusable={focusable}
  zIndex={zIndex}
  hidden={hidden}
  onchange={handleChange}
  onsubmit={handleSubmit}
  {...restProps}
/>