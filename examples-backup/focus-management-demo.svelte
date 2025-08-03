/**
 * Focus Management Demo
 * 
 * Demonstrates the focus context system with tab navigation,
 * focus traps, visual indicators, and custom tab order.
 */

<script>
  import { getGlobalFocusContext } from '../src/dom/focus-context-simple'
  import Input from '../src/components/ui/Input.svelte.mjs'
  import Button from '../src/components/ui/Button.svelte.mjs'
  import List from '../src/components/ui/List.svelte.mjs'
  import Text from '../src/components/ui/Text.svelte.mjs'
  import Box from '../src/components/ui/Box.svelte.mjs'
  
  // Get global focus context
  const focusContext = getGlobalFocusContext()
  
  // State
  let showModal = $state(false)
  let username = $state('')
  let password = $state('')
  let selectedItem = $state(0)
  let modalInput = $state('')
  let lastAction = $state('Press Tab to navigate')
  let focusedElementInfo = $state('No element focused')
  
  // Update focus info periodically
  $effect(() => {
    const interval = setInterval(() => {
      const focused = focusContext.focusedElement
      if (!focused) {
        focusedElementInfo = 'No element focused'
      } else {
        const tag = focused.tagName
        const id = focused.getAttribute('id') || 'unnamed'
        const elements = focusContext.getFocusableElements()
        const index = elements.indexOf(focused)
        const total = elements.length
        
        focusedElementInfo = `Focused: ${tag}#${id} (${index + 1}/${total})`
      }
    }, 100)
    
    return () => clearInterval(interval)
  })
  
  // Handle escape key for modal
  $effect(() => {
    if (!showModal) return
    
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })
  
  // List items
  const menuItems = ['Dashboard', 'Profile', 'Settings', 'Logout']
  
  // Event handlers
  function handleLogin() {
    lastAction = `Login: ${username || 'empty'} / ${password ? '***' : 'empty'}`
  }
  
  function handleMenuSelect(index) {
    selectedItem = index
    lastAction = `Selected: ${menuItems[index]}`
  }
  
  function openModal() {
    showModal = true
    lastAction = 'Modal opened'
  }
  
  function closeModal() {
    showModal = false
    modalInput = ''
    lastAction = 'Modal closed'
  }
  
  function submitModal() {
    lastAction = `Modal submitted: ${modalInput}`
    closeModal()
  }
</script>

<box>
  <!-- Header with focus info -->
  <box height={3} border="line" label="Focus Management Demo">
    <text top={0} left={1}>{focusedElementInfo}</text>
  </box>
  
  <!-- Main content area -->
  <box top={3} height={15} border="line" label="Main Area">
    <!-- Login form with custom tab order -->
    <box top={1} left={2} width="50%" height={8} border="line" label="Login Form">
      <text top={0} left={1}>Username:</text>
      <input
        id="username"
        top={1}
        left={1}
        width="90%"
        bind:value={username}
        tabIndex={1}
      />
      
      <text top={2} left={1}>Password:</text>
      <input
        id="password"
        top={3}
        left={1}
        width="90%"
        bind:value={password}
        secret={true}
        tabIndex={2}
      />
      
      <button
        id="login"
        top={5}
        left={1}
        width={10}
        onclick={handleLogin}
        tabIndex={3}
      >
        Login
      </button>
      
      <button
        id="modal"
        top={5}
        left={12}
        width={15}
        onclick={openModal}
        tabIndex={4}
      >
        Open Modal
      </button>
    </box>
    
    <!-- Menu list -->
    <box top={1} right={2} width="45%" height={8} border="line" label="Menu">
      <list
        id="menu"
        items={menuItems}
        selected={selectedItem}
        onSelect={handleMenuSelect}
        tabIndex={5}
        height="100%"
      />
    </box>
    
    <!-- Skip link example (high tab index) -->
    <button
      id="skip"
      bottom={1}
      left={2}
      width={20}
      tabIndex={10}
      onclick={() => lastAction = 'Skip to end clicked'}
    >
      Skip to End
    </button>
    
    <!-- Help text (not focusable) -->
    <text bottom={1} right={2} focusable={false}>
      Tab: Next | Shift+Tab: Previous | Enter: Activate
    </text>
  </box>
  
  <!-- Status bar -->
  <box bottom={0} height={3} border="line" label="Status">
    <text top={0} left={1}>Last Action: {lastAction}</text>
  </box>
  
  <!-- Modal dialog -->
  {#if showModal}
    <box
      left="center"
      top="center"
      width="50%"
      height={10}
      border="line"
      label="Modal Dialog"
      zIndex={100}
    >
      <text top={0} left={1}>Enter some text:</text>
      <input
        id="modal-input"
        top={1}
        left={1}
        width="90%"
        bind:value={modalInput}
        tabIndex={1}
      />
      
      <text top={3} left={1} focusable={false}>
        Modal is open. Press Escape to close.
      </text>
      
      <button
        id="modal-submit"
        bottom={1}
        left={1}
        width={10}
        onclick={submitModal}
        tabIndex={2}
      >
        Submit
      </button>
      
      <button
        id="modal-cancel"
        bottom={1}
        right={1}
        width={10}
        onclick={closeModal}
        tabIndex={3}
      >
        Cancel
      </button>
    </box>
  {/if}
</box>