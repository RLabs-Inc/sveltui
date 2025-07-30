<script>
  // This component automatically updates its terminal element when content changes
  
  let {
    // Direct content value (reactive)
    value = '',
    // Children for slot content
    children,
    // Other text element props
    ...restProps
  } = $props();
  
  // State for the element reference
  let element = $state();
  
  // Derived content that reactively computes text from DOM or prop
  let finalContent = $derived.by(() => {
    // If value prop is provided, use it
    if (value) return value;
    
    // Otherwise, extract text from DOM child nodes
    if (element && element.childNodes.length > 0) {
      return Array.from(element.childNodes)
        .filter(node => node.nodeType === 3)
        .map(node => node.nodeValue || '')
        .join('');
    }
    
    return '';
  });
  
</script>

<!-- Use regular text element but with reactive content -->
<text bind:this={element} content={finalContent} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</text>