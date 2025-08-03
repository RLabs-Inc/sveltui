<script>
  import { layoutContext } from '../src/layout/layout-context.svelte.ts'
  
  // Get reactive screen dimensions
  let screenDims = $derived(layoutContext.screenDimensions)
  
  // Calculate responsive values
  let isNarrow = $derived(screenDims.width < 80)
  let isShort = $derived(screenDims.height < 24)
  
  let sidebarWidth = $derived(isNarrow ? 15 : 25)
  let statusHeight = $derived(isShort ? 2 : 3)
  
  let message = $derived(`Screen: ${screenDims.width}x${screenDims.height} | Layout: ${isNarrow ? 'Narrow' : 'Wide'} ${isShort ? 'Short' : 'Tall'}`)
</script>

<box
  label="Terminal Resize Test"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  width="100%"
  height="100%"
  keys
>
  <!-- Status bar that changes height based on screen size -->
  <box
    top={0}
    left={0}
    width="100%"
    height={statusHeight}
    border={{ type: 'line' }}
    style={{ border: { fg: 'white' } }}
    label="Status"
  >
    <text top={0} left={1}>
      {message}
    </text>
  </box>
  
  <!-- Sidebar that changes width based on screen size -->
  <box
    top={statusHeight}
    left={0}
    width={sidebarWidth}
    height={`100%-${statusHeight}`}
    border={{ type: 'line' }}
    style={{ border: { fg: 'green' } }}
    label="Sidebar"
  >
    <text top={1} left={1}>Width: {sidebarWidth}</text>
    <text top={2} left={1}>Responsive!</text>
    {#if !isNarrow}
      <text top={4} left={1}>Extra content</text>
      <text top={5} left={1}>when wide</text>
    {/if}
  </box>
  
  <!-- Main content area that adjusts to remaining space -->
  <box
    top={statusHeight}
    left={sidebarWidth}
    width={`100%-${sidebarWidth}`}
    height={`100%-${statusHeight}`}
    border={{ type: 'line' }}
    style={{ border: { fg: 'blue' } }}
    label="Main Content"
  >
    <text top={1} left={1}>Resize your terminal window!</text>
    <text top={3} left={1}>This layout will automatically</text>
    <text top={4} left={1}>adjust to the new dimensions.</text>
    
    {#if isNarrow}
      <text top={6} left={1} fg="yellow">Narrow mode active</text>
    {/if}
    
    {#if isShort}
      <text top={8} left={1} fg="red">Short mode active</text>
    {/if}
    
    <!-- Centered element that stays centered -->
    <box
      top="center"
      left="center"
      width={Math.min(20, Math.floor(screenDims.width * 0.3))}
      height={Math.min(5, Math.floor(screenDims.height * 0.3))}
      border={{ type: 'line' }}
      style={{ border: { fg: 'magenta' } }}
      label="Centered"
    >
      <text top="center" left="center">
        Always
      </text>
      <text top="center+1" left="center">
        Centered
      </text>
    </box>
  </box>
</box>