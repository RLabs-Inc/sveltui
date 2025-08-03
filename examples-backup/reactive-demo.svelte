<script>
  import { onMount } from 'svelte'
  
  // Reactive state using Svelte 5 runes
  let count = $state(0)
  let color = $state('green')
  let position = $state({ top: 2, left: 2 })
  
  // Derived values (computed from state)
  let doubled = $derived(count * 2)
  let message = $derived(`Count: ${count} | Doubled: ${doubled}`)
  let borderColor = $derived(count > 5 ? 'red' : 'green')
  
  // Update functions that modify state
  function increment() {
    count++
    // Change color based on count
    color = count % 2 === 0 ? 'green' : 'yellow'
  }
  
  function decrement() {
    count--
    color = count % 2 === 0 ? 'green' : 'yellow'
  }
  
  function moveBox() {
    position.left = position.left >= 20 ? 2 : position.left + 2
  }
  
  // Auto-increment every second
  onMount(() => {
    const interval = setInterval(() => {
      increment()
      moveBox()
    }, 1000)
    
    return () => clearInterval(interval)
  })
</script>

<box 
  top={0}
  left={0}
  width="100%"
  height="100%"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  label=" Reactive Terminal Demo "
>
  <!-- Title -->
  <text
    top={0}
    left="center"
    content="SvelTUI Fine-Grained Reactivity Bridge"
    style={{ fg: 'white', bold: true }}
  />
  
  <!-- Reactive counter display -->
  <box
    top={position.top}
    left={position.left}
    width={30}
    height={5}
    border={{ type: 'line' }}
    style={{ border: { fg: borderColor } }}
    label=" Counter "
  >
    <text
      top={1}
      left="center"
      content={message}
      style={{ fg: color }}
    />
  </box>
  
  <!-- Instructions -->
  <text
    bottom={2}
    left="center"
    content="Press ↑/↓ to change counter | q to quit"
    style={{ fg: 'gray' }}
  />
  
  <!-- Status -->
  <text
    bottom={0}
    left={2}
    content={`Status: ${count > 5 ? 'High' : 'Normal'}`}
    style={{ fg: count > 5 ? 'red' : 'green' }}
  />
</box>

<!-- Hidden box for keyboard input -->
<box
  focused={true}
  onkeydown={(key) => {
    if (key === 'up') increment()
    else if (key === 'down') decrement()
    else if (key === 'q') process.exit(0)
  }}
  width={0}
  height={0}
/>