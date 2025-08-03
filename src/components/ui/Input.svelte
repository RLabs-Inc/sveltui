/**
 * Input Component
 * 
 * A text input component for user input
 */

<script lang="ts">
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
    
    // Event handlers
    onChange,
    onSubmit,
    onFocus,
    onSelectAll,
    
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
  
  // No need for internal state - use bindable value directly
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Handle value change
  function handleChange(event: any) {
    if (disabled) return;
    
    const newValue = event.value || '';
    
    // Apply maxLength restriction if specified
    if (maxLength !== undefined && newValue.length > maxLength) {
      return;
    }
    
    // Update the bindable value directly
    value = newValue;
    onChange?.({ value: newValue });
  }
  
  // Handle submit event (Enter key)
  function handleSubmit() {
    if (disabled) return;
    
    onSubmit?.({ value });
  }
  
  // Focus the input element
  export function focus() {
    // This will be handled by the runtime DOM connector
    onFocus?.();
  }
  
  // Select all text in the input
  export function selectAll() {
    // This will be handled by the runtime DOM connector
    onSelectAll?.();
  }
  
  // Clear the input
  export function clear() {
    value = '';
    onChange?.({ value: '' });
  }
</script>

<input
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  value={value}
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