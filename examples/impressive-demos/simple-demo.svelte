<script>
  // Simple demo that just shows our Svelte 5 breakthrough working
  let count = $state(0)
  let message = $state('Welcome to SvelTUI! 🚀')
  
  // Auto increment to show reactivity
  $effect(() => {
    const interval = setInterval(() => {
      count++
      message = `Count: ${count} - Svelte 5 reactivity working! ✨`
    }, 1000)
    
    return () => clearInterval(interval)
  })
</script>

<!-- Simple demonstration -->
<div style="padding: 20px; border: 1px solid #00ff00;">
  <h1 style="color: #00ff00;">🎉 SvelTUI Demo - Svelte 5 Working!</h1>
  
  <p style="color: #ffffff;">
    {message}
  </p>
  
  <div style="margin-top: 10px; color: #ffff00;">
    📊 Progress: {'█'.repeat(Math.min(20, count))}
  </div>
  
  <div style="margin-top: 10px; color: #ff00ff;">
    🚀 This is Svelte 5 running in a Node.js terminal!
  </div>
  
  <div style="margin-top: 10px; color: #00ffff;">
    ✨ Featuring: $state reactivity, $effect cleanup, and real-time updates!
  </div>
</div>