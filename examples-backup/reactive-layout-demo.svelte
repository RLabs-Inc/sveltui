<script>
  import { layoutContext } from '../src/layout/layout-context.svelte.ts'
  import { layoutManager } from '../src/layout/reactive-layout.svelte.ts'
  import { LayoutPattern, layoutHelpers } from '../src/layout/layout-utils'
  
  // Reactive state
  let activePanel = $state('main')
  let showSidebar = $state(true)
  let gridColumns = $state(2)
  let items = $state([
    { id: 1, label: 'Item 1', color: 'blue' },
    { id: 2, label: 'Item 2', color: 'green' },
    { id: 3, label: 'Item 3', color: 'yellow' },
    { id: 4, label: 'Item 4', color: 'magenta' }
  ])
  
  // Screen dimensions (reactive)
  let screenDims = $derived(layoutContext.screenDimensions)
  
  // Responsive sidebar width
  let sidebarWidth = $derived(screenDims.width < 60 ? 15 : 20)
  
  // Main content area width
  let contentWidth = $derived(showSidebar ? `${screenDims.width - sidebarWidth}` : '100%')
  
  // Dynamic grid columns based on screen width
  let responsiveColumns = $derived(screenDims.width < 80 ? 1 : gridColumns)
  
  // Key handlers
  function handleKeypress(key) {
    switch (key.name) {
      case 's':
        showSidebar = !showSidebar
        break
      case 'g':
        gridColumns = gridColumns === 2 ? 3 : 2
        break
      case 'a':
        items = [...items, { 
          id: items.length + 1, 
          label: `Item ${items.length + 1}`, 
          color: 'cyan' 
        }]
        break
      case 'd':
        if (items.length > 0) {
          items = items.slice(0, -1)
        }
        break
      case '1':
        activePanel = 'main'
        break
      case '2':
        activePanel = 'grid'
        break
      case '3':
        activePanel = 'center'
        break
    }
  }
</script>

<box
  label="Reactive Layout Demo"
  border={{ type: 'line' }}
  style={{ border: { fg: 'cyan' } }}
  keys
  on:keypress={handleKeypress}
>
  <!-- Status Bar -->
  <box
    top={0}
    left={0}
    height={3}
    width="100%"
    border={{ type: 'line' }}
    style={{ border: { fg: 'white' } }}
  >
    <text top={0} left={1}>
      Screen: {screenDims.width}x{screenDims.height} | 
      Sidebar: {showSidebar ? 'ON' : 'OFF'} | 
      Panel: {activePanel} | 
      Items: {items.length}
    </text>
  </box>
  
  <!-- Sidebar (conditional) -->
  {#if showSidebar}
    <box
      top={3}
      left={0}
      width={sidebarWidth}
      height="100%-3"
      border={{ type: 'line' }}
      style={{ border: { fg: 'green' } }}
      label="Sidebar"
    >
      <text top={1} left={1}>Controls:</text>
      <text top={3} left={1}>[s] Toggle sidebar</text>
      <text top={4} left={1}>[g] Toggle grid cols</text>
      <text top={5} left={1}>[a] Add item</text>
      <text top={6} left={1}>[d] Delete item</text>
      <text top={8} left={1}>Panels:</text>
      <text top={9} left={1}>[1] Main</text>
      <text top={10} left={1}>[2] Grid</text>
      <text top={11} left={1}>[3] Center</text>
    </box>
  {/if}
  
  <!-- Main Content Area -->
  <box
    top={3}
    left={showSidebar ? sidebarWidth : 0}
    width={contentWidth}
    height="100%-3"
    border={{ type: 'line' }}
    style={{ border: { fg: 'blue' } }}
    label="Content"
  >
    {#if activePanel === 'main'}
      <!-- Vertical Stack Layout -->
      <box top={1} left={1} width="100%-2" height="100%-2">
        <text>Vertical Stack Layout (auto-reflows):</text>
        
        {#each items as item, i}
          <box
            top={2 + i * 3}
            left={0}
            width="100%"
            height={2}
            border={{ type: 'line' }}
            style={{ border: { fg: item.color } }}
          >
            <text left="center">{item.label}</text>
          </box>
        {/each}
      </box>
      
    {:else if activePanel === 'grid'}
      <!-- Grid Layout -->
      <box top={1} left={1} width="100%-2" height="100%-2">
        <text>Grid Layout ({responsiveColumns} columns):</text>
        
        {#each items as item, i}
          {@const col = i % responsiveColumns}
          {@const row = Math.floor(i / responsiveColumns)}
          {@const cellWidth = Math.floor((contentWidth - sidebarWidth - 4) / responsiveColumns) - 1}
          {@const cellHeight = 5}
          
          <box
            top={2 + row * (cellHeight + 1)}
            left={col * (cellWidth + 1)}
            width={cellWidth}
            height={cellHeight}
            border={{ type: 'line' }}
            style={{ border: { fg: item.color } }}
          >
            <text left="center" top="center">{item.label}</text>
          </box>
        {/each}
      </box>
      
    {:else if activePanel === 'center'}
      <!-- Center Layout -->
      <box top="center" left="center" width="50%" height="50%">
        <box
          width="100%"
          height="100%"
          border={{ type: 'line' }}
          style={{ border: { fg: 'yellow' } }}
          label="Centered Panel"
        >
          <text top="center" left="center">
            Centered Content
          </text>
          <text top="center+2" left="center">
            Always stays centered
          </text>
          <text top="center+4" left="center">
            Even on resize!
          </text>
        </box>
      </box>
    {/if}
  </box>
  
  <!-- Floating Modal (example of absolute positioning) -->
  {#if items.length > 5}
    <box
      {...layoutHelpers.modal('40%', 10)}
      border={{ type: 'line' }}
      style={{ 
        border: { fg: 'red' },
        bg: 'black'
      }}
      label="Warning"
    >
      <text top="center" left="center" fg="red">
        Too many items!
      </text>
      <text top="center+2" left="center">
        Performance may degrade
      </text>
    </box>
  {/if}
</box>