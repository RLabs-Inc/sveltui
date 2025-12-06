<script lang="ts">
import {
  ComponentType,
  colors,
  textStyles,
  texts
} from '../core/state/engine.svelte.ts'
import { getTheme } from '../theme/theme.svelte.ts'
import { parseColor, type ColorInput } from '../utils/bun-color.ts'
import { useSimpleComponent, type SimpleComponentProps } from './base-component-simple.svelte.ts'

const theme = getTheme()

// Props - extends simplified component props
interface TextProps extends SimpleComponentProps {
  text: string
  color?: ColorInput
  backgroundColor?: ColorInput
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  dim?: boolean
  muted?: boolean
  bright?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
}

let {
  text,
  color,
  backgroundColor,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  dim = false,
  muted = false,
  bright = false,
  variant,
  // All other props from SimpleComponentProps
  ...baseProps
}: TextProps = $props()

// Create base component
const component = useSimpleComponent(ComponentType.TEXT, baseProps, false) // No children
const index = component.getIndex()

// Update text content
$effect(() => {
  texts[index] = text
})

// Update visual properties
$effect(() => {
  // Text style flags
  let flags = 0
  if (bold) flags |= 1
  if (italic) flags |= 2
  if (underline) flags |= 4
  if (strikethrough) flags |= 8
  if (dim) flags |= 16
  
  textStyles[index] = flags
  
  // Colors with theme support
  let finalColor = color ? parseColor(color) : undefined
  
  // Apply theme colors based on priority: explicit color > variant > muted/bright
  if (!finalColor) {
    if (variant) {
      finalColor = theme().colors[variant] || theme().colors.text
    } else if (muted) {
      finalColor = theme().colors.textMuted
    } else if (bright) {
      finalColor = theme().colors.textBright
    }
  }
  
  let finalBgColor = backgroundColor ? parseColor(backgroundColor) : undefined
  
  colors[index * 2] = finalColor
  colors[index * 2 + 1] = finalBgColor
})

// Watch for prop changes and update base component
$effect(() => {
  component.updateProps(baseProps)
})
</script>
