<script>
  // Props with proper defaults
  let {
    children,
    onclick = () => {},
    color = 'primary',
    border = false,
    width = 'shrink',
    height = 'shrink',
    bold = false,
    disabled = false,
    style = {},
    ...props
  } = $props()
  
  function handleClick(event) {
    if (!disabled) {
      onclick?.(event)
    }
  }
</script>

<!-- Button is essentially a styled Box that responds to clicks -->
<box
  width={width}
  height={height}
  border={border}
  style={style}
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