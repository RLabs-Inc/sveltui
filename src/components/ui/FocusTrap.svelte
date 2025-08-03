/**
 * FocusTrap Component
 * 
 * Traps focus within its children, useful for modals and dialogs.
 * Automatically restores focus when unmounted.
 */

<script>
  import { onMount, onDestroy } from 'svelte'
  import { getFocusContext, hasFocusContext } from '../../dom/focus-context.svelte.ts'
  
  // Component props
  let {
    // Whether the focus trap is active
    active = true,
    
    // Whether to restore focus when unmounted
    restoreFocus = true,
    
    // Whether to auto-focus first element on mount
    autoFocus = true,
    
    // Whether to allow escape key to deactivate trap
    escapeDeactivates = true,
    
    // Callback when trap is deactivated
    onDeactivate,
    
    // Container properties
    left = 0,
    top = 0,
    width = '100%',
    height = '100%',
    
    // Border for visual indication (optional)
    border = false,
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Children content
    children,
    
    // Additional props
    ...restProps
  } = $props()
  
  let containerElement = $state(null)
  let previouslyFocusedElement = $state(null)
  let focusContext = null
  
  // Check if focus context exists and get it
  $effect(() => {
    if (hasFocusContext()) {
      focusContext = getFocusContext()
    }
  })
  
  // Handle focus trapping
  $effect(() => {
    if (!focusContext || !containerElement || !active) return
    
    // Store currently focused element for restoration
    previouslyFocusedElement = focusContext.focusedElement
    
    // Activate focus trap
    focusContext.trapFocus(containerElement)
    
    // Auto-focus first element if requested
    if (autoFocus && focusContext.focusableElements.length > 0) {
      focusContext.focus(focusContext.focusableElements[0].element)
    }
    
    // Set up escape key handler
    let cleanup = null
    if (escapeDeactivates) {
      const handleKeyPress = (ch, key) => {
        if (key.name === 'escape') {
          deactivate()
        }
      }
      
      const screen = getScreen()
      if (screen) {
        screen.on('keypress', handleKeyPress)
        cleanup = () => screen.off('keypress', handleKeyPress)
      }
    }
    
    return () => {
      // Release focus trap
      if (focusContext) {
        focusContext.releaseFocusTrap()
        
        // Restore focus if requested
        if (restoreFocus && previouslyFocusedElement) {
          focusContext.focus(previouslyFocusedElement)
        }
      }
      
      // Clean up escape handler
      if (cleanup) cleanup()
    }
  })
  
  function deactivate() {
    active = false
    onDeactivate?.()
  }
  
  function getScreen() {
    if (!containerElement?._terminalElement) return null
    return containerElement._terminalElement.screen
  }
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border)
</script>

<box
  bind:this={containerElement}
  left={left}
  top={top}
  width={width}
  height={height}
  border={borderValue}
  zIndex={zIndex}
  hidden={hidden || !active}
  focusable={false}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</box>