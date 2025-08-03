<script>
  // Reactive state using Svelte 5 runes
  let count = $state(0)
  let color = $state('green')
  
  // Derived values
  let doubled = $derived(count * 2)
  let message = $derived(`Count: ${count} | Doubled: ${doubled}`)
  let borderColor = $derived(count > 5 ? 'red' : 'green')
  let statusColor = $derived(count > 10 ? 'red' : count > 5 ? 'yellow' : 'green')
  
  // Update functions
  function increment() {
    count++
    // Change color based on even/odd
    color = count % 2 === 0 ? 'green' : 'yellow'
  }
  
  function decrement() {
    count--
    color = count % 2 === 0 ? 'green' : 'yellow'
  }
  
  function reset() {
    count = 0
    color = 'green'
  }
</script>

<box 
  top={0}
  left={0}
  width="100%"
  height="100%"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  label=" Manual Counter Control "
  focused={true}
  onkeydown={(key) => {
    if (key === '+') increment()
    else if (key === '-') decrement()
    else if (key === 'r') reset()
    else if (key === 'q') process.exit(0)
  }}
>
  <!-- Title -->
  <text
    top={1}
    left="center"
    content="SvelTUI Manual Counter Demo"
    style={{ fg: 'white', bold: true }}
  />
  
  <!-- Counter display with color-changing border -->
  <box
    top={4}
    left="center"
    width={40}
    height={7}
    border={{ type: 'line' }}
    style={{ border: { fg: borderColor } }}
    label=" Counter Display "
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
      content={`Text color: ${color}`}
      style={{ fg: 'gray' }}
    />
    
    <text
      top={4}
      left="center"
      content={`Border color: ${borderColor}`}
      style={{ fg: 'gray' }}
    />
  </box>
  
  <!-- Instructions -->
  <box
    bottom={6}
    left="center"
    width={50}
    height={5}
    border={{ type: 'line' }}
    style={{ border: { fg: 'blue' } }}
    label=" Instructions "
  >
    <text
      top={0}
      left={2}
      content="Press + to increment (→ yellow on odd)"
      style={{ fg: 'white' }}
    />
    <text
      top={1}
      left={2}
      content="Press - to decrement (→ green on even)"
      style={{ fg: 'white' }}
    />
    <text
      top={2}
      left={2}
      content="Press r to reset | Press q to quit"
      style={{ fg: 'white' }}
    />
  </box>
  
  <!-- Status indicator -->
  <text
    bottom={1}
    left={2}
    content={`Status: ${count > 10 ? 'Very High!' : count > 5 ? 'High' : 'Normal'}`}
    style={{ fg: statusColor, bold: count > 10 }}
  />
  
  <!-- Color legend -->
  <text
    bottom={1}
    right={2}
    content="Even=Green, Odd=Yellow"
    style={{ fg: 'gray' }}
  />
</box>