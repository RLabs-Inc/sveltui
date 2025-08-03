<script>
  // High-performance reactive state
  let count = $state(0)
  let lastKeyTime = $state(0)
  let responseTime = $state(0)
  
  // Derived values
  let doubled = $derived(count * 2)
  let message = $derived(`Count: ${count} | Doubled: ${doubled}`)
  let color = $derived(count % 2 === 0 ? 'green' : 'yellow')
  
  // Performance tracking
  function increment() {
    const now = performance.now()
    count++
    responseTime = now - lastKeyTime
  }
  
  function decrement() {
    const now = performance.now()
    count--
    responseTime = now - lastKeyTime
  }
  
  function trackKeyTime() {
    lastKeyTime = performance.now()
  }
</script>

<box 
  top={0}
  left={0}
  width="100%"
  height="100%"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  label=" High-Performance Counter "
  focused={true}
  onkeydown={(key) => {
    trackKeyTime()
    if (key === '+') increment()
    else if (key === '-') decrement()
    else if (key === 'r') { count = 0; responseTime = 0 }
    else if (key === 'q') process.exit(0)
  }}
>
  <text
    top={2}
    left="center"
    content="Performance-Optimized Counter Demo"
    style={{ fg: 'white', bold: true }}
  />
  
  <box
    top={5}
    left="center"
    width={50}
    height={8}
    border={{ type: 'line' }}
    style={{ border: { fg: color } }}
    label=" Live Counter "
  >
    <text
      top={1}
      left="center"
      content={message}
      style={{ fg: color, bold: true }}
    />
    
    <text
      top={3}
      left="center"
      content={`Response Time: ${responseTime.toFixed(1)}ms`}
      style={{ fg: responseTime > 50 ? 'red' : responseTime > 20 ? 'yellow' : 'green' }}
    />
    
    <text
      top={5}
      left="center"
      content={`Target: < 16ms (60fps)`}
      style={{ fg: 'gray' }}
    />
  </box>
  
  <box
    bottom={5}
    left="center"
    width={60}
    height={4}
    border={{ type: 'line' }}
    style={{ border: { fg: 'blue' } }}
    label=" Instructions "
  >
    <text
      top={0}
      left={2}
      content="+ = increment | - = decrement | r = reset | q = quit"
      style={{ fg: 'white' }}
    />
    <text
      top={1}
      left={2}
      content="Test: Press +/- rapidly to measure response time"
      style={{ fg: 'yellow' }}
    />
  </box>
</box>