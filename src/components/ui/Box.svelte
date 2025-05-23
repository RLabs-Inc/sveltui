/**
 * Box Component
 * 
 * A basic container element that serves as a building block for layouts
 */

<script lang="ts">
  import type { Snippet } from 'svelte';
  
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
    
    // Children snippet
    children,
    
    // Additional props will be passed to the box element
    ...restProps
  }: {
    left?: number | string,
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    width?: number | string,
    height?: number | string,
    border?: boolean | string,
    borderColor?: string,
    label?: string,
    focusable?: boolean,
    scrollable?: boolean,
    mouse?: boolean,
    style?: any,
    zIndex?: number,
    hidden?: boolean,
    children?: Snippet,
    [key: string]: any
  } = $props();
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Merge styles
  let mergedStyle = $derived({
    ...style,
    border: {
      fg: borderColor,
      ...(style.border || {})
    }
  });
</script>

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
  {#if children}
    {@render children()}
  {/if}
</box>