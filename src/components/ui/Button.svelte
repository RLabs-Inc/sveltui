<script>
  // Props with proper defaults
  let {
    children,
    content = '',
    onclick = () => {},
    onPress = () => {},
    color = 'primary',
    border = false,
    width = 'shrink',
    height = 'shrink',
    bold = false,
    disabled = false,
    style = {},
    left,
    right,
    top,
    bottom,
    ...props
  } = $props()
  
  function handleClick(event) {
    if (!disabled) {
      onclick?.(event)
      onPress?.(event)
    }
  }
</script>

<!-- Button is essentially a styled Box that responds to clicks -->
<box
  left={left}
  right={right}
  top={top}
  bottom={bottom}
  width={width}
  height={height}
  border={border}
  style={style}
  content={content}
  onclick={handleClick}
  clickable={!disabled}
  mouse={true}
  keys={true}
  {...props}
>
  {#if children}
    {@render children()}
  {/if}
</box>