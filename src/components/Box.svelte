<script lang="ts">
  /**
   * Box component for creating general containers
   * 
   * This is a basic container component that can hold other components
   * or display text content.
   */
  
  import type { ComponentProps } from '../core/types';
  
  let {
    // Layout properties
    width = '100%',
    height = '100%',
    top = 0,
    left = 0,
    right = undefined as (number | string | undefined),
    bottom = undefined as (number | string | undefined),
    
    // Content
    content = '',
    
    // Style properties
    border = false,
    style = {},
    
    // Events
    onClick = undefined as ((event: any) => void) | undefined,
    
    // Children
    children = undefined as any[]
  } = $props();
</script>

<!-- No template needed - our renderer handles this -->