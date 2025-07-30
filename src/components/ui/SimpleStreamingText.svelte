<script>
  let {
    text = '',
    speed = 50, // ms per character
    onComplete = () => {},
    ...props
  } = $props();
  
  let displayedText = $state('');
  let currentIndex = $state(0);
  
  $effect(() => {
    // Reset when text changes
    displayedText = '';
    currentIndex = 0;
    
    if (!text) return;
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        displayedText = text.slice(0, currentIndex + 1);
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, speed);
    
    return () => clearInterval(interval);
  });
</script>

<text content={displayedText} {...props} />