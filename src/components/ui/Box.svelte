/**
 * Box Component
 * 
 * A basic container element that serves as a building block for layouts
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
    
    // Appearance properties
    border = false,
    borderColor,
    label,
    
    // Behavior properties
    focusable = false,
    scrollable = false,
    
    // Mouse properties
    mouse = true,
    
    // Style properties
    style = {},
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props will be passed to the box element
    ...restProps
  } = $props();
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(borderValue = typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Merge styles
  let mergedStyle = $derived(mergedStyle = {
    ...style,
    border: {
      fg: borderColor,
      ...(style.border || {})
    }
  });
</script>

{#snippet content(value)}
  value
{/snippet}

<box
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  border={borderValue}
  label={label}
  style={mergedStyle}
  focusable={focusable}
  scrollable={scrollable}
  mouse={mouse}
  hidden={hidden}
  zIndex={zIndex}
  {...restProps}
>
  {@render content(props.content)}
</box>