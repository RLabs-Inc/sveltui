<script lang="ts">
import Box from '../components/Box.svelte'
import Text from '../components/Text.svelte'
// import Input from '../components/Input.svelte'
import type { KeyboardEvent } from '../events/keyboard.svelte.ts'

// State
let counter = $state(0)
let name = $state('')
let progress = $state(0)
let status = $state('Ready')

// Update functions
function incrementCounter() {
  counter++
  status = `Counter incremented to ${counter}`
}

function decrementCounter() {
  counter--
  status = `Counter decremented to ${counter}`
}

function resetProgress() {
  progress = 0
  status = 'Progress reset'
}

// Handle input keyboard events
function handleInputKey(event: KeyboardEvent) {
  // Let default input behavior happen unless it's a special key
  if (event.key === 'Enter') {
    status = `Name entered: ${name}`
    return true // Consume the event
  }
}

// Global keyboard handler for the box
function handleGlobalKey(event: KeyboardEvent) {
  if (event.key === '+' || event.key === '=') {
    incrementCounter()
    return true
  } else if (event.key === '-' || event.key === '_') {
    decrementCounter()
    return true
  } else if (event.key === ' ') {
    resetProgress()
    return true
  }
}

// Timer for progress
setInterval(() => {
  progress = progress >= 100 ? 0 : progress + 5
}, 500)

// Timer for clock
let clock = $state(new Date().toLocaleTimeString())
setInterval(() => {
  clock = new Date().toLocaleTimeString()
}, 1000)
</script>

<Box 
  x={1} 
  y={1} 
  width={60} 
  height={20} 
  border="rounded" 
  borderColor={0x0088ff}
  focusable={true}
  onkeydown={handleGlobalKey}
>
  <Text x={3} y={2} color={0x00ff00} text="SvelTUI v2 - Reactive Test" />
  
  <Text x={3} y={4} color={0xffff00} text={`Status: ${status}`} />
  
  <Text x={3} y={6} text={`Counter: ${counter}`} />
  
  <!-- <Input 
    x={3} 
    y={8} 
    width={30} 
    bind:value={name}
    placeholder="Enter your name..."
    onkeydown={handleInputKey}
  /> -->
  
  <Text 
    x={3} 
    y={10} 
    color={name ? 0x00ffff : 0xffffff}
    text={name ? `Hello, ${name}!` : 'Hello, stranger!'} 
  />
  
  <Text x={3} y={12} text={`Progress: ${progress}%`} />
  
  <Text x={3} y={14} text={clock} />
  
  <Text 
    x={3} 
    y={16} 
    color={0x808080}
    text="Tab: Focus | +/-: Counter | Space: Reset | Ctrl+C: Exit" 
  />
</Box>