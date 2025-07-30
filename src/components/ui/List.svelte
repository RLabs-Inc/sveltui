/**
 * List Component
 * 
 * An interactive list component for selection from a list of items
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
    width = '100%',
    height = 'shrink',
    
    // List items
    items = [] as string[],
    
    // Initial selected index
    selected = $bindable(0),
    
    // Event handlers
    onSelect,
    onAction,
    onFocus,
    
    // Interactive mode
    interactive = true,
    
    // Keyboard navigation
    keys = true,
    
    // Vi-style navigation
    vi = false,
    
    // Mouse support
    mouse = true,
    
    // Appearance properties
    border = false,
    
    // Style properties
    style = {},
    
    // Specific style for selected item
    selectedStyle = {},
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props will be passed to the list element
    ...restProps
  } = $props();
  
  // Use selected directly from props since it's bindable
  // No need for internal state tracking
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Merge styles for selected item
  let mergedStyle = $derived({
    ...style,
    selected: {
      ...selectedStyle,
      ...(style.selected || {})
    }
  });
  // Handle selection
  function handleSelect(index: number) {
    if (index >= 0 && index < items.length) {
      selected = index;
      onSelect?.({ index, item: items[index] });
    }
  }
  
  // Handle keypress events
  function handleKeypress(event: any) {
    if (!interactive) return;
    
    if (event.key === 'up' || (vi && event.key === 'k')) {
      handleSelect(Math.max(0, selected - 1));
    } else if (event.key === 'down' || (vi && event.key === 'j')) {
      handleSelect(Math.min(items.length - 1, selected + 1));
    } else if (event.key === 'enter') {
      onAction?.({ index: selected, item: items[selected] });
    }
  }
  
  // Focus the list element
  export function focus() {
    // This will be handled by the runtime DOM connector
    onFocus?.();
  }
</script>

<list
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  items={items}
  selected={selected}
  border={borderValue}
  style={mergedStyle}
  keys={keys}
  vi={vi}
  mouse={mouse}
  interactive={interactive}
  zIndex={zIndex}
  hidden={hidden}
  onkeypress={handleKeypress}
  onselect={(e) => handleSelect(e.detail.index)}
  {...restProps}
></list>