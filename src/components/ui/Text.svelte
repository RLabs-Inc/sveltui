<script lang="ts">
  /**
   * Text component for displaying text in the terminal
   * 
   * This component displays text content with styling options.
   */
  
  
  let {
    // Content
    content = '',
    
    // Styling options
    color = 'white',
    bold = false,
    italic = false,
    underline = false,
    align = 'left',
    
    // Layout properties
    width = 'shrink',
    height = 'shrink',
    top = undefined as (number | string | undefined),
    left = undefined as (number | string | undefined),
    right = undefined as (number | string | undefined),
    bottom = undefined as (number | string | undefined),
    
    // Advanced styling
    style = {},
    
    // Special text types
    muted = false
  } = $props();
  
  // Create derived style object for the renderer
  let derivedStyle = $derived({
    ...style,
    fg: color,
    bold,
    italic,
    underline
  });
</script>

<!-- No template needed - our renderer will handle this -->