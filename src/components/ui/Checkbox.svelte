/**
 * Checkbox Component
 * 
 * A checkbox input component for boolean selection
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
    width = 'shrink',
    height = 1,
    // Checkbox state
    checked = $bindable(false),
    
    // Checkbox label
    label = '',
    
    // Checkbox is disabled
    disabled = false,
    
    // Appearance properties
    border = false,
    
    // Checkbox characters
    checkedChar = '✓',
    uncheckedChar = '☐',
    
    // Style properties
    style = {},
    
    // Focus behavior
    focusable = true,
    
    // Keyboard and mouse support
    keys = true,
    mouse = true,
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props will be passed to the checkbox element
    ...restProps
  } = $props();
  
  // Track checkbox state internally
  let isChecked = $state(checked);
  
  // Update internal state when prop changes
  $effect(() => {
    isChecked = checked;
  });
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);

  // Current checkbox character
  let currentChar = $derived(isChecked ? checkedChar : uncheckedChar);

  // Full content with label
  let content = $derived(`${currentChar} ${label}`);

  // Handle toggle
  function handleToggle() {
    if (disabled) return;
    
    isChecked = !isChecked;
    dispatch('change', { checked: isChecked });
  }
  
  // Handle keypress events
  function handleKeypress(event: any) {
    if (disabled) return;
    
    if (event.key === 'enter' || event.key === ' ') {
      handleToggle();
    }
  }
  
  // Handle mouse events
  function handleClick() {
    handleToggle();
  }
  
  // Focus the checkbox element
  export function focus() {
    // This will be handled by the runtime DOM connector
    dispatch('focus');
  }
</script>

<!-- We'll implement checkbox as a button since blessed doesn't have a dedicated checkbox -->
<button
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  content={content}
  border={borderValue}
  style={style}
  keys={keys}
  mouse={mouse}
  focusable={focusable && !disabled}
  zIndex={zIndex}
  hidden={hidden}
  onkeypress={handleKeypress}
  onpress={handleClick}
  {...restProps}
></button>