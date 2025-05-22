<script>
  // Working Svelte 5 demo that bypasses complex template issues
  let count = $state(0)
  let autoIncrement = $state(false)
  
  $effect(() => {
    if (autoIncrement) {
      const interval = setInterval(() => {
        count++
        if (count >= 20) {
          autoIncrement = false
        }
      }, 500)
      
      return () => clearInterval(interval)
    }
  })
  
  function increment() {
    count++
  }
  
  function toggleAuto() {
    autoIncrement = !autoIncrement
  }
</script>

<div style="color: #00ff00; padding: 10px; border: 2px solid #00ff00;">
  <h1>🎉 SVELTE 5 TERMINAL UI BREAKTHROUGH! 🎉</h1>
  
  <p>Count: <span style="color: #ffff00; font-weight: bold;">{count}</span></p>
  
  <p>Progress: <span style="color: #00ffff;">{'█'.repeat(count)}{'░'.repeat(20-count)}</span></p>
  
  <p>Auto Mode: <span style="color: {autoIncrement ? '#00ff00' : '#ff0000'};">
    {autoIncrement ? '🟢 ON' : '🔴 OFF'}
  </span></p>
  
  <div style="margin-top: 10px;">
    <button onclick={increment} style="color: #00ff00; margin-right: 10px;">
      ➕ Increment
    </button>
    
    <button onclick={toggleAuto} style="color: #ffff00;">
      {autoIncrement ? '⏹️ Stop Auto' : '▶️ Start Auto'}
    </button>
  </div>
  
  <div style="margin-top: 15px; color: #ff00ff;">
    ✨ This is Svelte 5 with runes ($state, $effect) running in Node.js terminal!
    <br>
    🚀 Featuring: Reactive state, automatic cleanup, real-time updates!
  </div>
  
  <div style="margin-top: 10px; color: #00ffff; font-size: small;">
    🎯 Technologies: Svelte 5 + Bun + Terminal Virtual DOM + Browser Globals Utility
  </div>
</div>