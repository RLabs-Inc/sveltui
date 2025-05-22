<script>
  import { applyThemeToProps } from '../../theme/currentTheme.svelte'
  
  // Props with proper defaults
  let {
    children,
    onClick = () => {},
    color = 'primary',
    border = false,
    width = 'auto',
    height = 'auto',
    bold = false,
    disabled = false,
    style = {},
    ...props
  } = $props()
  
  // Apply theme to props
  const themedProps = $derived(applyThemeToProps('button', {
    color,
    border,
    width, 
    height,
    bold,
    disabled,
    style,
    ...props
  }))
  
  function handleClick(event) {
    if (!disabled && onClick) {
      onClick(event)
    }
  }
</script>

<!-- Button is essentially a styled Box that responds to clicks -->
<box
  {...themedProps}
  onclick={handleClick}
  clickable={!disabled}
  mouse={true}
  keys={true}
  style={{
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...themedProps.style
  }}
>
  {@render children?.()}
</box>