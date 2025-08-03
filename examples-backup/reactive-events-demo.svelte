<script>
  import { globalEventBus, createEventSummary, createEventWatcher } from '../src/dom/reactive-events.svelte.ts'
  import { getElementEventEmitter } from '../src/dom/reactive-events.svelte.ts'
  
  // Component state
  let boxElement = $state(null)
  let buttonElement = $state(null)
  let listElement = $state(null)
  
  // Create event summary for global events
  const getSummary = createEventSummary(globalEventBus)
  let globalSummary = $derived(getSummary())
  
  // Track specific event counts reactively
  let clickCount = $derived(globalEventBus.getEventCount('click'))
  let keypressCount = $derived(globalEventBus.getEventCount('keypress'))
  let focusCount = $derived(globalEventBus.getEventCount('focus'))
  
  // Track last events
  let lastClickEvent = $derived(globalEventBus.getLastEvent('click'))
  let lastKeypressEvent = $derived(globalEventBus.getLastEvent('keypress'))
  
  // Event history
  let eventHistory = $derived(globalEventBus.getEventHistory())
  let recentEvents = $derived(eventHistory.slice(-5).reverse())
  
  // Event rate tracking
  globalEventBus.trackEventRate('click', 5000)
  globalEventBus.trackEventRate('keypress', 5000)
  let clickRate = $derived(globalEventBus.getEventRate('click'))
  let keypressRate = $derived(globalEventBus.getEventRate('keypress'))
  
  // Filter event counts by type
  let mouseEventCounts = $derived(
    globalEventBus.getFilteredEventCounts(
      type => ['click', 'mousedown', 'mouseup', 'mousemove'].includes(type)
    )
  )
  
  let keyboardEventCounts = $derived(
    globalEventBus.getFilteredEventCounts(
      type => ['keypress', 'keydown', 'keyup'].includes(type)
    )
  )
  
  // Custom event handling
  function sendCustomEvent() {
    globalEventBus.emit('custom-action', {
      message: 'Custom event triggered!',
      timestamp: new Date().toISOString()
    })
  }
  
  // Clear history
  function clearHistory() {
    globalEventBus.clearHistory()
  }
  
  // Reset counts
  function resetCounts() {
    globalEventBus.resetCounts()
  }
  
  // Create watchers for side effects (like logging)
  $effect(() => {
    createEventWatcher(globalEventBus, 'custom-action', (event) => {
      if (event) {
        // Side effect: log custom events
        console.log('Custom event received:', event.data)
      }
    })
  })
</script>

<box 
  top="0"
  left="0"
  width="100%"
  height="100%"
  border={{ type: 'line' }}
  label=" Reactive Events Demo "
  scrollable
>
  <!-- Event Summary Panel -->
  <box
    top="0"
    left="0"
    width="50%"
    height="40%"
    border={{ type: 'line' }}
    label=" Event Summary "
  >
    <text top="0" left="1">Total Events: {globalSummary.total}</text>
    <text top="1" left="1">Event Types: {globalSummary.types}</text>
    <text top="3" left="1">Most Frequent:</text>
    {#each globalSummary.mostFrequent as event, i}
      <text top={4 + i} left="2">{event.type}: {event.count}</text>
    {/each}
  </box>
  
  <!-- Specific Event Tracking -->
  <box
    top="0"
    left="50%"
    width="50%"
    height="40%"
    border={{ type: 'line' }}
    label=" Event Tracking "
  >
    <text top="0" left="1">Click Count: {clickCount}</text>
    <text top="1" left="1">Keypress Count: {keypressCount}</text>
    <text top="2" left="1">Focus Count: {focusCount}</text>
    
    <text top="4" left="1">Click Rate: {clickRate.toFixed(2)}/sec</text>
    <text top="5" left="1">Keypress Rate: {keypressRate.toFixed(2)}/sec</text>
    
    <text top="7" left="1">Last Click: {lastClickEvent ? `(${lastClickEvent.data?.x}, ${lastClickEvent.data?.y})` : 'None'}</text>
    <text top="8" left="1">Last Key: {lastKeypressEvent ? lastKeypressEvent.data?.key : 'None'}</text>
  </box>
  
  <!-- Event History -->
  <box
    top="40%"
    left="0"
    width="50%"
    height="30%"
    border={{ type: 'line' }}
    label=" Recent Events "
    scrollable
  >
    {#each recentEvents as event, i}
      <text top={i} left="1">
        [{new Date(event.timestamp).toLocaleTimeString()}] {event.type}
        {#if event.data}
          - {JSON.stringify(event.data).slice(0, 30)}...
        {/if}
      </text>
    {/each}
  </box>
  
  <!-- Event Type Breakdown -->
  <box
    top="40%"
    left="50%"
    width="50%"
    height="30%"
    border={{ type: 'line' }}
    label=" Event Types "
  >
    <text top="0" left="1" bold>Mouse Events:</text>
    {#each Object.entries(mouseEventCounts) as [type, count], i}
      <text top={1 + i} left="2">{type}: {count}</text>
    {/each}
    
    <text top="6" left="1" bold>Keyboard Events:</text>
    {#each Object.entries(keyboardEventCounts) as [type, count], i}
      <text top={7 + i} left="2">{type}: {count}</text>
    {/each}
  </box>
  
  <!-- Interactive Elements -->
  <box
    top="70%"
    left="0"
    width="100%"
    height="30%"
    border={{ type: 'line' }}
    label=" Interactive Elements "
  >
    <button
      bind:this={buttonElement}
      top="1"
      left="2"
      width="20"
      height="3"
      border={{ type: 'line' }}
      onpress={sendCustomEvent}
    >
      Send Custom Event
    </button>
    
    <button
      top="1"
      left="24"
      width="15"
      height="3"
      border={{ type: 'line' }}
      onpress={clearHistory}
    >
      Clear History
    </button>
    
    <button
      top="1"
      left="41"
      width="15"
      height="3"
      border={{ type: 'line' }}
      onpress={resetCounts}
    >
      Reset Counts
    </button>
    
    <list
      bind:this={listElement}
      top="5"
      left="2"
      width="30"
      height="5"
      border={{ type: 'line' }}
      items={['Option 1', 'Option 2', 'Option 3']}
      mouse
      keys
    />
    
    <text top="5" left="35">
      Click buttons, press keys, and interact
      with elements to see reactive events!
    </text>
    
    <text top="7" left="35" fg="yellow">
      Press 'q' or Ctrl+C to exit
    </text>
  </box>
</box>