<script>
  import { globalEventBus } from '../src/dom/reactive-events.svelte.ts'
  
  // Simple reactive state tracking
  let clickCount = $state(0)
  let message = $state('Click the button!')
  
  // Subscribe to global events
  globalEventBus.on('click', () => {
    clickCount++
    message = `Button clicked ${clickCount} times`
  })
  
  function handleClick() {
    globalEventBus.emit('click', { source: 'button' })
  }
</script>

<box 
  top="center"
  left="center"
  width="50%"
  height="10"
  border={{ type: 'line' }}
  label=" Simple Events Test "
>
  <text top="1" left="center">{message}</text>
  
  <button
    top="3"
    left="center"
    width="20"
    height="3"
    border={{ type: 'line' }}
    onpress={handleClick}
  >
    Click Me!
  </button>
</box>