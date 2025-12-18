<script lang="ts">
  import {
    ComponentType,
    borderStyles,
    colors,
    scrollOffset,
    scrollable,
    maxScrollOffset,
    computedHeight,
    focus,
  } from '../core/state/engine.svelte.ts'
  import { getTheme } from '../theme/theme.svelte.ts'
  import { parseColor, type ColorInput } from '../utils/bun-color.ts'
  import { useComponent, type ComponentProps } from './base-component.svelte.ts'
  import { keyboard } from '../input/keyboard.svelte.ts'
  import { createSubscriber } from 'svelte/reactivity'
  import type { Snippet } from 'svelte'

  const theme = getTheme()

  // Props - extends simplified component props
  interface BoxProps extends ComponentProps {
    children?: Snippet
    // Visual
    border?:
      | 'none'
      | 'single'
      | 'double'
      | 'rounded'
      | 'bold'
      | 'dashed'
      | 'dotted'
    borderColor?: ColorInput
    backgroundColor?: ColorInput
    variant?:
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'success'
      | 'danger'
      | 'warning'
      | 'info'
      | 'text'
      | 'textMuted'
      | 'textBright'
    // Focus state binding
    focused?: boolean
  }

  let {
    children,
    // Visual
    border = 'none',
    borderColor,
    backgroundColor,
    variant,
    // Focus state
    focused = $bindable(false),
    // All other props from ComponentProps (includes onfocus, onblur)
    ...baseProps
  }: BoxProps = $props()

  // Create base component
  const component = useComponent(ComponentType.BOX, baseProps, true) // Can have children
  const index = component.getIndex()

  // Update visual properties when they change
  $effect(() => {
    // Border style
    borderStyles[index] =
      border === 'single'
        ? 1
        : border === 'double'
          ? 2
          : border === 'rounded'
            ? 3
            : border === 'bold'
              ? 4
              : border === 'dashed'
                ? 5
                : border === 'dotted'
                  ? 6
                  : 0

    // Border color with theme support
    let finalBorderColor = borderColor ? parseColor(borderColor) : undefined
    if (!finalBorderColor && variant) {
      finalBorderColor = theme().colors[variant]
    }

    // Background color with theme support
    let finalBgColor = backgroundColor ? parseColor(backgroundColor) : undefined

    colors[index * 2] = finalBorderColor
    colors[index * 2 + 1] = finalBgColor
  })

  // Watch for prop changes and update base component
  $effect(() => {
    component.updateProps(baseProps)
  })

  // Update bindable focused state and call focus callbacks
  $effect(() => {
    const wasFocused = focused
    focused = focus.value === index

    // Call focus callbacks when focus changes
    if (focused && !wasFocused && baseProps.onfocus) {
      baseProps.onfocus()
    } else if (!focused && wasFocused && baseProps.onblur) {
      baseProps.onblur()
    }
  })

  // Setup keyboard scrolling with createSubscriber
  // This will automatically subscribe when the component is focused
  const keyboardSubscribe = createSubscriber((update) => {
    return keyboard.onFocused(index, (event) => {
      // Only handle if this box is scrollable (auto-detected by layout)
      if (!scrollable[index]) return

      const currentOffset = scrollOffset[index] || 0
      const maxOffset = maxScrollOffset[index] || 0

      switch (event.key) {
        case 'ArrowUp':
          if (currentOffset > 0) {
            scrollOffset[index] = Math.max(0, currentOffset - 1)
            update() // Notify subscribers of the change
            return true // Prevent default
          }
          break
        case 'ArrowDown':
          if (currentOffset < maxOffset) {
            scrollOffset[index] = Math.min(maxOffset, currentOffset + 1)
            update()
            return true
          }
          break
        case 'PageUp':
          if (currentOffset > 0) {
            const pageSize = Math.max(1, (computedHeight[index] || 10) - 2) // Account for borders
            scrollOffset[index] = Math.max(0, currentOffset - pageSize)
            update()
            return true
          }
          break
        case 'PageDown':
          if (currentOffset < maxOffset) {
            const pageSize = Math.max(1, (computedHeight[index] || 10) - 2)
            scrollOffset[index] = Math.min(maxOffset, currentOffset + pageSize)
            update()
            return true
          }
          break
      }
    })
  })

  // Subscribe to keyboard events - this activates the subscription
  $effect(() => {
    keyboardSubscribe()
  })
</script>

{#if children}
  {@render children()}
{/if}
