<script lang="ts">
  /**
   * List component for displaying selectable items
   * 
   * This component displays a list of items that can be navigated and selected.
   */
  
  let {
    // List data
    items = [] as string[],
    selectedIndex = $bindable(0),
    
    // Layout properties
    width = '50%',
    height = '50%',
    top = undefined as (number | string | undefined),
    left = undefined as (number | string | undefined),
    right = undefined as (number | string | undefined),
    bottom = undefined as (number | string | undefined),
    
    // Style properties
    border = true,
    style = {},
    
    // Events
    onSelect = undefined as ((index: number, item: string) => void) | undefined,
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