<script>
  // Props
  let {
    // Text content from prop
    content = '',
    // Children snippet
    children,
    // Other props
    ...restProps
  } = $props();
  
  // Reference to the text element
  let textElement = $state();
  
  // Derive the actual content from either prop or children
  let actualContent = $derived(
    content || 
    (textElement && textElement.childNodes.length > 0
      ? Array.from(textElement.childNodes)
          .filter(node => node.nodeType === 3) // Text nodes
          .map(node => node.nodeValue || '')
          .join('')
      : '')
  );
  
  // Use the derived content in the element
</script>

<text bind:this={textElement} content={actualContent} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</text>