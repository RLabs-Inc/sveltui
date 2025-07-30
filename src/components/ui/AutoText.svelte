<script>
  import { tick } from 'svelte';
  
  // Component that automatically syncs its content with terminal element
  let {
    children,
    ...restProps
  } = $props();
  
  let element = $state();
  let textContent = $state('');
  
  // Effect that forces text content updates
  $effect(() => {
    if (!element) return;
    
    // Function to update text content
    const updateText = async () => {
      await tick(); // Wait for DOM updates
      
      const newText = Array.from(element.childNodes)
        .filter(node => node.nodeType === 3)
        .map(node => node.nodeValue || '')
        .join('');
      
      textContent = newText;
    };
    
    // Initial update
    updateText();
    
    // Set up interval to poll for changes (temporary solution)
    const interval = setInterval(updateText, 100);
    
    return () => clearInterval(interval);
  });
</script>

<text bind:this={element} content={textContent} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</text>