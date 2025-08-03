<script>
  import { mouseState, isMouseOver, getMouseRelativePosition } from '../src/input/simple-mouse-state'
  import { globalEventBus } from '../src/dom/reactive-events.svelte.ts'
  
  // Mouse state tracking
  let position = $state({ x: 0, y: 0 })
  let buttons = $state({ left: false, middle: false, right: false })
  let dragInfo = $state(null)
  let scrollInfo = $state({ x: 0, y: 0 })
  let velocity = $state({ x: 0, y: 0 })
  
  // Click tracking
  let clickCount = $state(0)
  let lastClickPos = $state({ x: 0, y: 0 })
  
  // Hover states for different elements
  let box1Element = $state(null)
  let box2Element = $state(null)
  let box3Element = $state(null)
  
  // Hover tracking
  let box1Hovered = $state(false)
  let box2Hovered = $state(false)
  let box3Hovered = $state(false)
  
  // Drag and drop state
  let draggedBox = $state(null)
  let dropZoneActive = $state(false)
  let droppedItems = $state([])
  
  // Subscribe to mouse state changes
  let updateCount = $state(0)
  
  $effect(() => {
    // Subscribe to mouse state updates
    const unsubscribe = mouseState.subscribe(() => {
      updateCount++
    })
    
    return unsubscribe
  })
  
  // Update mouse state reactively when updateCount changes
  $effect(() => {
    // This will run when updateCount changes
    updateCount; // Access to create dependency
    
    position = mouseState.getPosition()
    buttons = mouseState.getButtons()
    dragInfo = mouseState.getDragState()
    scrollInfo = mouseState.getScrollDelta()
    velocity = mouseState.getVelocity()
    
    // Update hover states
    if (box1Element) box1Hovered = isMouseOver(box1Element)
    if (box2Element) box2Hovered = isMouseOver(box2Element)
    if (box3Element) box3Hovered = isMouseOver(box3Element)
    
    // Update drop zone state
    if (dragInfo?.isDragging && box3Element) {
      dropZoneActive = isMouseOver(box3Element)
    } else {
      dropZoneActive = false
    }
  })
  
  // Handle clicks
  function handleBoxClick(boxName) {
    clickCount++
    lastClickPos = { ...position }
    console.log(`Clicked ${boxName} at (${position.x}, ${position.y})`)
  }
  
  // Handle drag start
  function handleDragStart(boxName) {
    if (buttons.left) {
      draggedBox = boxName
      console.log(`Started dragging ${boxName}`)
    }
  }
  
  // Handle drop
  function handleDrop() {
    if (draggedBox && dropZoneActive) {
      droppedItems = [...droppedItems, {
        name: draggedBox,
        timestamp: Date.now()
      }]
      console.log(`Dropped ${draggedBox} in drop zone`)
    }
    draggedBox = null
  }
  
  // Handle drag end
  $effect(() => {
    if (!dragInfo?.isDragging && draggedBox) {
      handleDrop()
    }
  })
</script>

<box 
  width="100%" 
  height="100%" 
  border="line"
  label=" Mouse Tracking Demo "
>
  <!-- Mouse Info Panel -->
  <box 
    width="40" 
    height="8" 
    left="1" 
    top="1"
    border="line"
    label=" Mouse State "
  >
    <text top="0" left="1">Position: ({position.x}, {position.y})</text>
    <text top="1" left="1">Buttons: L:{buttons.left} M:{buttons.middle} R:{buttons.right}</text>
    <text top="2" left="1">Velocity: ({velocity.x.toFixed(1)}, {velocity.y.toFixed(1)}) px/s</text>
    <text top="3" left="1">Scroll: ({scrollInfo.x}, {scrollInfo.y})</text>
    <text top="4" left="1">Clicks: {clickCount}</text>
    <text top="5" left="1">Last Click: ({lastClickPos.x}, {lastClickPos.y})</text>
  </box>
  
  <!-- Drag Info Panel -->
  <box 
    width="40" 
    height="8" 
    right="1" 
    top="1"
    border="line"
    label=" Drag State "
  >
    <text top="0" left="1">Dragging: {dragInfo?.isDragging || false}</text>
    {#if dragInfo?.isDragging}
      <text top="1" left="1">Start: ({dragInfo.startX}, {dragInfo.startY})</text>
      <text top="2" left="1">Current: ({dragInfo.currentX}, {dragInfo.currentY})</text>
      <text top="3" left="1">Delta: ({dragInfo.deltaX}, {dragInfo.deltaY})</text>
      <text top="4" left="1">Dragging: {draggedBox || 'None'}</text>
    {/if}
  </box>
  
  <!-- Interactive Boxes -->
  <box 
    bind:this={box1Element}
    width="30" 
    height="6" 
    left="5" 
    top="10"
    border="line"
    label=" Box 1 (Hoverable) "
    style={{
      bg: box1Hovered ? 'blue' : 'black'
    }}
    onmousedown={() => handleDragStart('Box 1')}
    onclick={() => handleBoxClick('Box 1')}
  >
    <text align="center" valign="middle">
      {box1Hovered ? '🔵 HOVERED' : 'Hover me!'}
    </text>
  </box>
  
  <box 
    bind:this={box2Element}
    width="30" 
    height="6" 
    left="40" 
    top="10"
    border="line"
    label=" Box 2 (Clickable) "
    style={{
      bg: box2Hovered ? 'green' : 'black',
      bold: box2Hovered
    }}
    onmousedown={() => handleDragStart('Box 2')}
    onclick={() => handleBoxClick('Box 2')}
  >
    <text align="center" valign="middle">
      Click me! ({clickCount} clicks)
    </text>
  </box>
  
  <!-- Drop Zone -->
  <box 
    bind:this={box3Element}
    width="60" 
    height="10" 
    left="center" 
    top="18"
    border="line"
    label=" Drop Zone "
    style={{
      bg: dropZoneActive ? 'yellow' : 'black',
      fg: dropZoneActive ? 'black' : 'white'
    }}
  >
    <text top="0" align="center">
      {dropZoneActive ? '📦 DROP HERE!' : 'Drag boxes here'}
    </text>
    <text top="2" left="1">Dropped items:</text>
    {#each droppedItems.slice(-5) as item, i}
      <text top={3 + i} left="2">
        • {item.name} at {new Date(item.timestamp).toLocaleTimeString()}
      </text>
    {/each}
  </box>
  
  <!-- Instructions -->
  <box 
    width="100%-2" 
    height="4" 
    bottom="1" 
    left="1"
    border="line"
    label=" Instructions "
  >
    <text top="0" left="1">• Move mouse to see position tracking</text>
    <text top="1" left="1">• Hover over boxes to see hover effects</text>
    <text top="2" left="1">• Click and drag boxes to the drop zone</text>
  </box>
</box>