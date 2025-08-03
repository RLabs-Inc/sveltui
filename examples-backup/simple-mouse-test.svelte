<script>
  import { mouseState, isMouseOver } from '../src/input/simple-mouse-state'
  
  // Simple reactive state
  let mouseX = $state(0)
  let mouseY = $state(0)
  let updateTicks = $state(0)
  
  // Subscribe to mouse updates
  $effect(() => {
    const unsubscribe = mouseState.subscribe(() => {
      updateTicks++
    })
    return unsubscribe
  })
  
  // Update position when ticks change
  $effect(() => {
    updateTicks; // Create dependency
    const pos = mouseState.getPosition()
    mouseX = pos.x
    mouseY = pos.y
  })
</script>

<box width="100%" height="100%" border="line" label=" Simple Mouse Test ">
  <text top="1" left="2">Mouse Position: ({mouseX}, {mouseY})</text>
  <text top="2" left="2">Updates: {updateTicks}</text>
  <text top="4" left="2">Move your mouse to see coordinates update!</text>
</box>