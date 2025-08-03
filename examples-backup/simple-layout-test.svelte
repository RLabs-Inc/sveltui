<script>
  let count = $state(0)
  
  // Simple reactive derived value
  let message = $derived(`Count is ${count}`)
  
  function increment() {
    count++
  }
</script>

<box
  label="Simple Layout Test"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  width="100%"
  height="100%"
  keys
  on:keypress={(key) => {
    if (key.name === 'space') increment()
  }}
>
  <text top={2} left={2}>
    {message}
  </text>
  
  <text top={4} left={2}>
    Press SPACE to increment, q to quit
  </text>
  
  <!-- Test responsive layout -->
  <box
    top={6}
    left={2}
    width="50%"
    height={5}
    border={{ type: 'line' }}
    style={{ border: { fg: 'green' } }}
    label="Responsive Box"
  >
    <text top="center" left="center">
      This box is 50% width
    </text>
  </box>
  
  <!-- Test absolute positioning -->
  <box
    top="center"
    left="center"
    width={20}
    height={3}
    border={{ type: 'line' }}
    style={{ border: { fg: 'yellow' } }}
    label="Centered"
  >
    <text top="center" left="center">
      Always centered
    </text>
  </box>
</box>