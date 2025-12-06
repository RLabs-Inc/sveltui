// ============================================================================
// BASE COMPONENT FOR V3
// Provides common functionality for all interactive components
// ============================================================================

import {
  allocateIndex,
  componentType,
  focusable,
  layoutProps,
  mouseDispatcher,
  mouseHandlers,
  releaseIndex,
  tabIndex,
  visibility,
  yogaNodes,
} from '../core/state/engine.svelte.ts'
import { applyYogaProps } from '../core/layout/yoga-props.ts'
import { Yoga } from '../core/layout/yoga-instance.ts'
import { setupComponent, cleanupComponent } from '../utils/hierarchy.svelte.ts'
import { initializeYogaNode } from '../core/layout/layout.svelte.ts'
import { parentIndex } from '../core/state/engine.svelte.ts'
import type { MouseEvent, MouseHandlers } from '../input/mouse.ts'
import { keyboard, type KeyboardEvent } from '../input/keyboard.svelte.ts'
import { onMount, onDestroy } from 'svelte'

// ============================================================================
// BASE COMPONENT PROPS
// ============================================================================

export interface BaseComponentProps {
  // Layout
  position?: 'relative' | 'absolute' | 'static'
  x?: number
  y?: number
  width?: number | string
  height?: number | string
  minWidth?: number | string
  minHeight?: number | string
  maxWidth?: number | string
  maxHeight?: number | string

  // Absolute positioning
  top?: number | string | 'auto'
  right?: number | string | 'auto'
  bottom?: number | string | 'auto'
  left?: number | string | 'auto'
  start?: number | string | 'auto'
  end?: number | string | 'auto'

  // Flex container
  display?: 'flex' | 'none' | 'contents'
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'no-wrap' | 'wrap' | 'wrap-reverse'
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  alignContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  gap?: number | string
  rowGap?: number | string
  columnGap?: number | string

  // Flex item
  flex?: number
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string | 'auto'
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'

  // Spacing
  margin?: number | string | 'auto'
  marginTop?: number | string | 'auto'
  marginBottom?: number | string | 'auto'
  marginLeft?: number | string | 'auto'
  marginRight?: number | string | 'auto'
  marginStart?: number | string | 'auto'
  marginEnd?: number | string | 'auto'
  marginX?: number | string | 'auto'
  marginY?: number | string | 'auto'
  padding?: number | string
  paddingTop?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  paddingRight?: number | string
  paddingStart?: number | string
  paddingEnd?: number | string
  paddingX?: number | string
  paddingY?: number | string

  // Border (for layout calculations)
  borderWidth?: number

  // Other
  aspectRatio?: number
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  direction?: 'inherit' | 'ltr' | 'rtl'
  boxSizing?: 'border-box' | 'content-box'

  // Interaction
  focusable?: boolean
  tabIndex?: number

  // Mouse events
  onClick?: (event: MouseEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onWheel?: (event: MouseEvent) => void

  // Keyboard events (only work when component is focused)
  onKeyPress?: (event: KeyboardEvent) => boolean | void
  onEnter?: () => void
  onEscape?: () => void
  onSpace?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
}

// ============================================================================
// BASE COMPONENT CLASS
// ============================================================================

export class BaseComponent {
  protected id: string
  protected index: number
  protected props: BaseComponentProps
  protected canHaveChildren: boolean
  protected keyboardUnsubscribe: (() => void) | null = null

  constructor(
    type: number,
    props: BaseComponentProps,
    canHaveChildren = false
  ) {
    this.id = `component-${Math.random().toString(36).substr(2, 9)}`
    this.index = allocateIndex(this.id)
    this.props = props
    this.canHaveChildren = canHaveChildren

    // Set component type and visibility
    componentType[this.index] = type
    visibility[this.index] = true

    // Setup hierarchy (this connects Yoga nodes)
    setupComponent(this.index, canHaveChildren)

    // Initialize Yoga node with type-specific setup (measure function for text)
    initializeYogaNode(this.index, type)

    // Setup interaction if needed
    if (props.focusable) {
      focusable[this.index] = true
      tabIndex[this.index] = props.tabIndex ?? 0
    }

    // Setup mouse handlers if any are provided
    this.setupMouseHandlers()

    // Setup keyboard handlers if any are provided
    this.setupKeyboardHandlers()

    // Apply layout props
    this.updateLayoutProps()
  }

  /**
   * Update layout properties and apply to Yoga node immediately
   */
  protected updateLayoutProps(): void {
    // Store props for the layout system to read
    layoutProps[this.index] = this.props

    // Apply to Yoga node immediately (like Ink does)
    const node = yogaNodes[this.index]
    if (node) {
      const parentIdx = parentIndex[this.index]
      const context = {
        componentType: componentType[this.index],
        parentProps:
          parentIdx && parentIdx >= 0 ? layoutProps[parentIdx] : undefined,
        isRoot: parentIdx && parentIdx < 0 ? true : false,
      }
      applyYogaProps(node, this.props, Yoga, context)
    }
  }

  /**
   * Setup mouse handlers if any are provided
   */
  protected setupMouseHandlers(): void {
    const { props } = this

    // Check if any mouse handlers are provided
    const hasMouseHandlers = !!(
      props.onClick ||
      props.onMouseDown ||
      props.onMouseUp ||
      props.onMouseEnter ||
      props.onMouseLeave ||
      props.onMouseMove ||
      props.onWheel
    )

    if (!hasMouseHandlers) return

    // Create handlers object
    const handlers: MouseHandlers = {}

    if (props.onClick) {
      handlers.onClick = (event) => {
        props.onClick!(event)
        return true // Event was handled
      }
    }

    if (props.onMouseDown) {
      handlers.onMouseDown = (event) => {
        props.onMouseDown!(event)
        return true
      }
    }

    if (props.onMouseUp) {
      handlers.onMouseUp = (event) => {
        props.onMouseUp!(event)
        return true
      }
    }

    if (props.onMouseEnter) {
      handlers.onMouseEnter = (event) => {
        props.onMouseEnter!(event)
        return true
      }
    }

    if (props.onMouseLeave) {
      handlers.onMouseLeave = (event) => {
        props.onMouseLeave!(event)
        return true
      }
    }

    if (props.onMouseMove) {
      handlers.onMouseMove = (event) => {
        props.onMouseMove!(event)
        return true
      }
    }

    if (props.onWheel) {
      handlers.onWheel = (event) => {
        props.onWheel!(event)
        return true
      }
    }

    // Store handlers in engine
    mouseHandlers[this.index] = handlers
    mouseDispatcher.setHandlers(this.index, handlers)
  }

  /**
   * Setup keyboard handlers if any are provided
   */
  protected setupKeyboardHandlers(): void {
    const { props } = this

    // Check if any keyboard handlers are provided
    const hasKeyboardHandlers = !!(
      props.onKeyPress ||
      props.onEnter ||
      props.onEscape ||
      props.onSpace ||
      props.onArrowUp ||
      props.onArrowDown ||
      props.onArrowLeft ||
      props.onArrowRight
    )

    if (!hasKeyboardHandlers) return

    // Clear existing subscription if any
    if (this.keyboardUnsubscribe) {
      this.keyboardUnsubscribe()
      this.keyboardUnsubscribe = null
    }

    // Subscribe to keyboard events when focused
    this.keyboardUnsubscribe = keyboard.onFocused(this.index, (event) => {
      // Check specific key handlers first
      switch (event.key) {
        case 'Enter':
          if (props.onEnter) {
            props.onEnter()
            return true // Consume event
          }
          break
        case 'Escape':
          if (props.onEscape) {
            props.onEscape()
            return true
          }
          break
        case ' ':
        case 'Space':
          if (props.onSpace) {
            props.onSpace()
            return true
          }
          break
        case 'ArrowUp':
          if (props.onArrowUp) {
            props.onArrowUp()
            return true
          }
          break
        case 'ArrowDown':
          if (props.onArrowDown) {
            props.onArrowDown()
            return true
          }
          break
        case 'ArrowLeft':
          if (props.onArrowLeft) {
            props.onArrowLeft()
            return true
          }
          break
        case 'ArrowRight':
          if (props.onArrowRight) {
            props.onArrowRight()
            return true
          }
          break
      }

      // General key press handler
      if (props.onKeyPress) {
        return props.onKeyPress(event)
      }

      return false // Don't consume if not handled
    })
  }

  /**
   * Update props and re-apply to engine
   */
  updateProps(newProps: Partial<BaseComponentProps>): void {
    // Update stored props
    this.props = { ...this.props, ...newProps }

    // Re-apply layout
    this.updateLayoutProps()

    // Update mouse handlers if changed
    if (
      'onClick' in newProps ||
      'onMouseDown' in newProps ||
      'onMouseUp' in newProps ||
      'onMouseEnter' in newProps ||
      'onMouseLeave' in newProps ||
      'onMouseMove' in newProps ||
      'onWheel' in newProps
    ) {
      // Clear old handlers
      mouseDispatcher.removeHandlers(this.index)
      mouseHandlers[this.index] = null

      // Setup new handlers
      this.setupMouseHandlers()
    }

    // Update keyboard handlers if changed
    if (
      'onKeyPress' in newProps ||
      'onEnter' in newProps ||
      'onEscape' in newProps ||
      'onSpace' in newProps ||
      'onArrowUp' in newProps ||
      'onArrowDown' in newProps ||
      'onArrowLeft' in newProps ||
      'onArrowRight' in newProps
    ) {
      // Re-setup keyboard handlers
      this.setupKeyboardHandlers()
    }

    // Update focusable state
    if ('focusable' in newProps) {
      focusable[this.index] = newProps.focusable ?? false
    }
    if ('tabIndex' in newProps) {
      tabIndex[this.index] = newProps.tabIndex ?? 0
    }
  }

  /**
   * Get the component's index for external access
   */
  getIndex(): number {
    return this.index
  }

  /**
   * Cleanup when component is destroyed
   */
  destroy(): void {
    // Remove mouse handlers
    mouseDispatcher.removeHandlers(this.index)
    mouseHandlers[this.index] = null

    // Remove keyboard handlers
    if (this.keyboardUnsubscribe) {
      this.keyboardUnsubscribe()
      this.keyboardUnsubscribe = null
    }

    // Cleanup hierarchy
    cleanupComponent(this.index)

    // Release index
    releaseIndex(this.id)
  }
}

// ============================================================================
// SVELTE INTEGRATION HELPER
// ============================================================================

/**
 * Helper function to use BaseComponent in a Svelte component
 */
export function useBaseComponent(
  componentType: number,
  props: BaseComponentProps,
  canHaveChildren = false
): BaseComponent {
  const component = new BaseComponent(componentType, props, canHaveChildren)

  // Setup lifecycle
  onMount(() => {
    // Component is already initialized in constructor
  })

  onDestroy(() => {
    component.destroy()
  })

  // Return for access to methods
  return component
}
