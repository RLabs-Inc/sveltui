<script>
  // Simple test without onMount to avoid the effect_orphan error
  let count = $state(0)
  let message = $derived(`Count: ${count}`)
  
  // Increment every second using setTimeout instead of onMount
  function startTimer() {
    setTimeout(() => {
      count++
      if (count < 10) startTimer()
    }, 1000)
  }
  
  // Start the timer immediately
  startTimer()
</script>

<box 
  width="100%"
  height="100%"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
>
  <text
    top={1}
    left="center"
    content={message}
    style={{ fg: 'yellow' }}
  />
</box>