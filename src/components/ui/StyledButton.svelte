<script>
  import { createStyleState } from '../../dom/style-state.svelte.ts'
  import { createStyle, mergeStyles } from '../../dom/style-utils'
  
  // Component props
  let {
    children,
    onclick = () => {},
    
    // Style props
    variant = 'primary', // primary, secondary, danger, success
    size = 'medium', // small, medium, large
    
    // State props
    disabled = false,
    loading = false,
    
    // Positioning
    top = 0,
    left = 0,
    right,
    bottom,
    width = 'shrink',
    height = 3,
    
    // Custom styles
    normalStyle = {},
    hoverStyle = {},
    focusStyle = {},
    pressedStyle = {},
    
    // Pass-through props
    ...props
  } = $props()
  
  // Define variant styles
  const variantStyles = {
    primary: {
      normal: { fg: 'white', bg: 'blue' },
      hover: { bg: 'cyan' },
      focus: { border: { fg: 'yellow' } },
      pressed: { bg: 'magenta' }
    },
    secondary: {
      normal: { fg: 'white', bg: 'gray' },
      hover: { bg: 'white', fg: 'black' },
      focus: { border: { fg: 'white' } },
      pressed: { inverse: true }
    },
    danger: {
      normal: { fg: 'white', bg: 'red' },
      hover: { bg: 'brightred' },
      focus: { border: { fg: 'yellow' } },
      pressed: { bg: 'magenta' }
    },
    success: {
      normal: { fg: 'white', bg: 'green' },
      hover: { bg: 'brightgreen' },
      focus: { border: { fg: 'yellow' } },
      pressed: { bg: 'cyan' }
    }
  }
  
  // Define size styles
  const sizeStyles = {
    small: { height: 1, padding: { left: 1, right: 1 } },
    medium: { height: 3, padding: { left: 2, right: 2 } },
    large: { height: 5, padding: { left: 3, right: 3 } }
  }
  
  // Create the style state machine
  const styleState = createStyleState({
    normal: mergeStyles(
      createStyle({
        border: { type: 'line' },
        ...variantStyles[variant].normal
      }),
      normalStyle
    ),
    hover: mergeStyles(
      variantStyles[variant].hover,
      hoverStyle
    ),
    focus: mergeStyles(
      variantStyles[variant].focus,
      focusStyle
    ),
    pressed: mergeStyles(
      variantStyles[variant].pressed,
      pressedStyle
    )
  })
  
  // Computed disabled style
  let computedStyle = $derived.by(() => {
    if (disabled) {
      return mergeStyles(styleState.blessedStyle, {
        fg: 'gray',
        bg: 'black',
        border: { fg: 'gray' }
      })
    }
    return styleState.blessedStyle
  })
  
  // Event handlers
  function handleClick(event) {
    if (!disabled && !loading) {
      onclick?.(event)
    }
  }
  
  function handleMouseOver() {
    if (!disabled) styleState.setHovered(true)
  }
  
  function handleMouseOut() {
    styleState.setHovered(false)
  }
  
  function handleMouseDown() {
    if (!disabled) styleState.setPressed(true)
  }
  
  function handleMouseUp() {
    styleState.setPressed(false)
  }
  
  function handleFocus() {
    if (!disabled) styleState.setFocused(true)
  }
  
  function handleBlur() {
    styleState.setFocused(false)
  }
  
  // Computed dimensions based on size
  let computedHeight = $derived(sizeStyles[size].height)
  let computedPadding = $derived(sizeStyles[size].padding)
</script>

<box
  top={top}
  left={left}
  right={right}
  bottom={bottom}
  width={width}
  height={height === 'shrink' ? computedHeight : height}
  style={computedStyle}
  onclick={handleClick}
  onmouseover={handleMouseOver}
  onmouseout={handleMouseOut}
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  onfocus={handleFocus}
  onblur={handleBlur}
  clickable={!disabled && !loading}
  mouse={true}
  keys={true}
  focusable={!disabled}
  padding={computedPadding}
  {...props}
>
  {#if loading}
    <text align="center" content="Loading..." style={{ fg: 'gray' }} />
  {:else if children}
    {@render children()}
  {/if}
</box>