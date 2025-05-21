/**
 * Text Component
 * 
 * A component for displaying text in the terminal
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
    width = 'shrink',
    height = 'shrink',
    
    // Text content
    content = $bindable(''),
    
    // Text alignment
    align = 'left',
    
    // Text wrapping
    wrap = true,
    
    // Whether to allow HTML tags in content
    tags = false,
    
    // Whether to truncate if too long
    truncate = false,
    
    // Appearance properties
    border = false,
    
    // Style properties
    style = {},
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props will be passed to the text element
    ...restProps
  } = $props();
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(borderValue = typeof border === 'boolean' ? (border ? 'line' : false) : border);
</script>

{#snippet content(value)}
	value
{/snippet}

<text
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  content={content}
  align={align}
  wrap={wrap}
  tags={tags}
  border={borderValue}
  style={style}
  zIndex={zIndex}
  hidden={hidden}
  truncate={truncate}
  {...restProps}
>
  {@render content(props.content)}
</text>