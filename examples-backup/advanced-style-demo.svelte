<script>
  import { createStyleState } from '../src/dom/style-state.svelte.ts'
  import { createStyle, mergeStyles } from '../src/dom/style-utils'
  
  // Application state
  let theme = $state('dark') // 'dark' or 'light'
  let selectedTab = $state(0)
  let notifications = $state([
    { id: 1, text: 'Welcome to SvelTUI!', type: 'info' },
    { id: 2, text: 'Style states are reactive', type: 'success' }
  ])
  
  // Theme styles
  const themes = {
    dark: {
      normal: { fg: 'white', bg: 'black' },
      panel: { border: { fg: 'gray' } },
      active: { fg: 'cyan', bg: 'blue' }
    },
    light: {
      normal: { fg: 'black', bg: 'white' },
      panel: { border: { fg: 'black' } },
      active: { fg: 'white', bg: 'blue' }
    }
  }
  
  // Root style state (theme-aware)
  const rootStyle = $derived.by(() => {
    return createStyleState({
      normal: themes[theme].normal
    })
  })
  
  // Panel style state (inherits from root)
  const panelStyle = createStyleState({
    normal: createStyle({
      border: themes[theme].panel.border
    }),
    focus: createStyle({
      border: { fg: 'yellow', type: 'double' }
    }),
    parent: rootStyle
  })
  
  // Tab styles
  function createTabStyle(index) {
    return createStyleState({
      normal: createStyle({
        fg: selectedTab === index ? themes[theme].active.fg : themes[theme].normal.fg,
        bg: selectedTab === index ? themes[theme].active.bg : themes[theme].normal.bg,
        border: { type: 'line', fg: selectedTab === index ? 'cyan' : 'gray' }
      }),
      hover: createStyle({
        bg: selectedTab === index ? themes[theme].active.bg : 'gray',
        bold: true
      }),
      focus: createStyle({
        border: { fg: 'yellow' }
      })
    })
  }
  
  // Notification styles by type
  const notificationStyles = {
    info: createStyleState({
      normal: createStyle({ fg: 'cyan', border: { fg: 'cyan', type: 'line' } }),
      hover: createStyle({ bg: 'blue' })
    }),
    success: createStyleState({
      normal: createStyle({ fg: 'green', border: { fg: 'green', type: 'line' } }),
      hover: createStyle({ bg: 'green', fg: 'black' })
    }),
    warning: createStyleState({
      normal: createStyle({ fg: 'yellow', border: { fg: 'yellow', type: 'line' } }),
      hover: createStyle({ bg: 'yellow', fg: 'black' })
    }),
    error: createStyleState({
      normal: createStyle({ fg: 'red', border: { fg: 'red', type: 'line' } }),
      hover: createStyle({ bg: 'red', fg: 'white' })
    })
  }
  
  // Tab style states
  let tab1Style = $derived(createTabStyle(0))
  let tab2Style = $derived(createTabStyle(1))
  let tab3Style = $derived(createTabStyle(2))
  
  // Event handlers
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark'
  }
  
  function selectTab(index) {
    selectedTab = index
  }
  
  function addNotification(type) {
    const id = Date.now()
    notifications = [...notifications, {
      id,
      text: `New ${type} notification!`,
      type
    }]
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id)
    }, 5000)
  }
  
  function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id)
  }
</script>

<box
  width="100%"
  height="100%"
  style={rootStyle.blessedStyle}
>
  <!-- Header -->
  <box
    top={0}
    width="100%"
    height={3}
    style={panelStyle.blessedStyle}
    label=" Advanced Style State Demo "
  >
    <text
      top={0}
      left={2}
      content={`Theme: ${theme}`}
      style={{ fg: theme === 'dark' ? 'white' : 'black' }}
    />
    <button
      top={0}
      right={2}
      width={15}
      height={1}
      content="Toggle Theme"
      onclick={toggleTheme}
      style={{
        fg: 'black',
        bg: 'yellow',
        hover: { bg: 'brightyellow' },
        focus: { bold: true }
      }}
      mouse={true}
      keys={true}
    />
  </box>
  
  <!-- Tabs -->
  <box top={3} width="100%" height={3}>
    <box
      left={0}
      width="33%"
      height={3}
      style={tab1Style.blessedStyle}
      onclick={() => selectTab(0)}
      onmouseover={() => tab1Style.setHovered(true)}
      onmouseout={() => tab1Style.setHovered(false)}
      onfocus={() => tab1Style.setFocused(true)}
      onblur={() => tab1Style.setFocused(false)}
      mouse={true}
      keys={true}
    >
      <text align="center" content="Notifications" />
    </box>
    
    <box
      left="33%"
      width="34%"
      height={3}
      style={tab2Style.blessedStyle}
      onclick={() => selectTab(1)}
      onmouseover={() => tab2Style.setHovered(true)}
      onmouseout={() => tab2Style.setHovered(false)}
      onfocus={() => tab2Style.setFocused(true)}
      onblur={() => tab2Style.setFocused(false)}
      mouse={true}
      keys={true}
    >
      <text align="center" content="Style Cascading" />
    </box>
    
    <box
      right={0}
      width="33%"
      height={3}
      style={tab3Style.blessedStyle}
      onclick={() => selectTab(2)}
      onmouseover={() => tab3Style.setHovered(true)}
      onmouseout={() => tab3Style.setHovered(false)}
      onfocus={() => tab3Style.setFocused(true)}
      onblur={() => tab3Style.setFocused(false)}
      mouse={true}
      keys={true}
    >
      <text align="center" content="Interactive Demo" />
    </box>
  </box>
  
  <!-- Tab Content -->
  <box top={6} bottom={3} width="100%" style={panelStyle.blessedStyle}>
    {#if selectedTab === 0}
      <!-- Notifications Tab -->
      <box padding={1}>
        <text content="Click buttons to add notifications:" />
        
        <box top={2} height={3}>
          <button
            left={0}
            content="Info"
            onclick={() => addNotification('info')}
            style={{ bg: 'cyan', fg: 'black' }}
            mouse={true}
          />
          <button
            left={10}
            content="Success"
            onclick={() => addNotification('success')}
            style={{ bg: 'green', fg: 'white' }}
            mouse={true}
          />
          <button
            left={20}
            content="Warning"
            onclick={() => addNotification('warning')}
            style={{ bg: 'yellow', fg: 'black' }}
            mouse={true}
          />
          <button
            left={30}
            content="Error"
            onclick={() => addNotification('error')}
            style={{ bg: 'red', fg: 'white' }}
            mouse={true}
          />
        </box>
        
        <!-- Notification List -->
        <box top={5} bottom={0} scrollable={true}>
          {#each notifications as notification, i}
            <box
              top={i * 3}
              height={3}
              width="100%"
              style={notificationStyles[notification.type].blessedStyle}
              onmouseover={() => notificationStyles[notification.type].setHovered(true)}
              onmouseout={() => notificationStyles[notification.type].setHovered(false)}
              onclick={() => removeNotification(notification.id)}
              mouse={true}
            >
              <text
                top={0}
                left={1}
                content={notification.text}
              />
              <text
                top={0}
                right={1}
                content="[×]"
                style={{ fg: 'gray' }}
              />
            </box>
          {/each}
        </box>
      </box>
      
    {:else if selectedTab === 1}
      <!-- Style Cascading Tab -->
      <box padding={1}>
        <text content="Style Inheritance Demo:" style={{ bold: true }} />
        
        <box top={2} left={2} width="45%" height={8} style={panelStyle.blessedStyle}>
          <text top={0} left={1} content="Parent Style" />
          <text top={1} left={1} content={`fg: ${rootStyle.currentStyle.fg}`} />
          <text top={2} left={1} content={`bg: ${rootStyle.currentStyle.bg}`} />
          
          <box top={4} left={1} right={1} height={3} style={panelStyle.blessedStyle}>
            <text content="Child inherits parent" />
          </box>
        </box>
        
        <box top={2} right={2} width="45%" height={8} style={{
          ...panelStyle.blessedStyle,
          border: { fg: 'magenta', type: 'double' }
        }}>
          <text top={0} left={1} content="Override Style" />
          <text top={1} left={1} content="Custom border color" style={{ fg: 'magenta' }} />
          <text top={2} left={1} content="Inherits text colors" />
        </box>
      </box>
      
    {:else if selectedTab === 2}
      <!-- Interactive Demo Tab -->
      <box padding={1}>
        <text content="Interactive Style States:" style={{ bold: true }} />
        
        <box top={2} height={10}>
          <text top={0} content="Hover and click the elements below:" />
          
          <box
            top={2}
            left={0}
            width={20}
            height={3}
            style={{
              fg: 'white',
              bg: 'blue',
              border: { type: 'line' },
              hover: { bg: 'cyan', bold: true },
              focus: { border: { fg: 'yellow' } }
            }}
            mouse={true}
            keys={true}
          >
            <text align="center" content="Hoverable Box" />
          </box>
          
          <textbox
            top={2}
            left={25}
            width={30}
            height={3}
            style={{
              fg: 'white',
              bg: 'black',
              border: { type: 'line' },
              focus: {
                bg: 'blue',
                border: { fg: 'cyan', type: 'double' }
              }
            }}
            mouse={true}
            keys={true}
            inputOnFocus={true}
          />
          
          <progressbar
            top={6}
            left={0}
            width="90%"
            height={3}
            filled={60}
            style={{
              border: { type: 'line' },
              bar: { bg: 'green' }
            }}
          />
        </box>
      </box>
    {/if}
  </box>
  
  <!-- Status Bar -->
  <box
    bottom={0}
    width="100%"
    height={3}
    style={panelStyle.blessedStyle}
  >
    <text
      top={0}
      left={2}
      content={`Tab: ${['Notifications', 'Style Cascading', 'Interactive Demo'][selectedTab]}`}
    />
    <text
      top={0}
      right={2}
      content="Press Tab to navigate, Enter to select"
      style={{ fg: 'gray' }}
    />
  </box>
</box>