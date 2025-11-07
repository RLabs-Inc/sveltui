// ============================================================================
// SIMPLIFIED BASE COMPONENT
// Uses the simplified layout props for terminal UIs
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
  focus,
  scrollable,
  scrollOffset,
  maxScrollOffset,
  computedHeight,
} from '../core/state/engine.svelte.ts'
import {
  applyTerminalProps,
  type TerminalLayoutProps,
} from '../core/layout/yoga-props-simple.ts'
import { Yoga } from '../core/layout/yoga-instance.ts'
import { setupComponent, cleanupComponent } from '../utils/hierarchy.svelte.ts'
import { setupYogaNode } from '../core/layout/layout-simple.svelte.ts'
import type { MouseEvent, MouseHandlers } from '../input/mouse.ts'
import { keyboard, type KeyboardEvent } from '../input/keyboard.svelte.ts'
import { onMount, onDestroy } from 'svelte'
import { createSubscriber } from 'svelte/reactivity'

// ============================================================================
// SIMPLIFIED COMPONENT PROPS
// ============================================================================

export interface SimpleComponentProps extends TerminalLayoutProps {
  // Interaction
  focusable?: boolean
  tabIndex?: number

  // Focus events
  onfocus?: () => void
  onblur?: () => void

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
// SIMPLIFIED BASE COMPONENT
// ============================================================================

export class SimpleBaseComponent {
  protected id: string
  protected index: number
  protected props: SimpleComponentProps
  protected canHaveChildren: boolean
  protected keyboardUnsubscribe: (() => void) | null = null

  constructor(
    type: number,
    props: SimpleComponentProps,
    canHaveChildren = false
  ) {
    this.id = `component-${Math.random().toString(36).substr(2, 9)}`
    this.index = allocateIndex(this.id)
    this.props = props
    this.canHaveChildren = canHaveChildren

    // Set component type and visibility
    componentType[this.index] = type
    visibility[this.index] = true

    // Setup hierarchy (connects Yoga nodes)
    setupComponent(this.index, canHaveChildren)

    // Setup Yoga node with measure function if needed
    setupYogaNode(this.index)

    // Setup interaction
    if (props.focusable) {
      focusable[this.index] = true
      tabIndex[this.index] = props.tabIndex ?? 0
    }

    // Setup event handlers
    this.setupMouseHandlers()
    this.setupKeyboardHandlers()

    // Apply layout props
    this.updateLayoutProps()
  }

  protected updateLayoutProps(): void {
    // Store props for layout system
    layoutProps[this.index] = this.props

    // Apply immediately to Yoga node
    const node = yogaNodes[this.index]
    if (node) {
      applyTerminalProps(node, this.props, Yoga)
    }
  }

  protected setupMouseHandlers(): void {
    const handlers: MouseHandlers = {}
    const p = this.props

    if (p.onClick)
      handlers.onClick = (e) => {
        p.onClick!(e)
        return true
      }
    if (p.onMouseDown)
      handlers.onMouseDown = (e) => {
        p.onMouseDown!(e)
        return true
      }
    if (p.onMouseUp)
      handlers.onMouseUp = (e) => {
        p.onMouseUp!(e)
        return true
      }
    if (p.onMouseEnter)
      handlers.onMouseEnter = (e) => {
        p.onMouseEnter!(e)
        return true
      }
    if (p.onMouseLeave)
      handlers.onMouseLeave = (e) => {
        p.onMouseLeave!(e)
        return true
      }
    if (p.onMouseMove)
      handlers.onMouseMove = (e) => {
        p.onMouseMove!(e)
        return true
      }
    if (p.onWheel)
      handlers.onWheel = (e) => {
        p.onWheel!(e)
        return true
      }

    if (Object.keys(handlers).length > 0) {
      mouseHandlers[this.index] = handlers
      mouseDispatcher.setHandlers(this.index, handlers)
    }
  }

  protected setupKeyboardHandlers(): void {
    const p = this.props

    const hasHandlers = !!(
      p.onKeyPress ||
      p.onEnter ||
      p.onEscape ||
      p.onSpace ||
      p.onArrowUp ||
      p.onArrowDown ||
      p.onArrowLeft ||
      p.onArrowRight ||
      p.onfocus ||
      p.onblur
    )

    if (!hasHandlers) return

    if (this.keyboardUnsubscribe) {
      this.keyboardUnsubscribe()
      this.keyboardUnsubscribe = null
    }

    this.keyboardUnsubscribe = keyboard.onFocused(this.index, (event) => {
      // Handle user-defined key handlers
      switch (event.key) {
        case 'Enter':
          if (p.onEnter) {
            p.onEnter()
            return true
          }
          break
        case 'Escape':
          if (p.onEscape) {
            p.onEscape()
            return true
          }
          break
        case ' ':
        case 'Space':
          if (p.onSpace) {
            p.onSpace()
            return true
          }
          break
        case 'ArrowUp':
          if (p.onArrowUp) {
            p.onArrowUp()
            return true
          }
          break
        case 'ArrowDown':
          if (p.onArrowDown) {
            p.onArrowDown()
            return true
          }
          break
        case 'ArrowLeft':
          if (p.onArrowLeft) {
            p.onArrowLeft()
            return true
          }
          break
        case 'ArrowRight':
          if (p.onArrowRight) {
            p.onArrowRight()
            return true
          }
          break
      }

      if (p.onKeyPress) return p.onKeyPress(event)
      return false
    })
  }

  updateProps(newProps: Partial<SimpleComponentProps>): void {
    this.props = { ...this.props, ...newProps }

    // Re-apply layout
    this.updateLayoutProps()

    // Re-setup handlers if needed
    const mouseKeys = [
      'onClick',
      'onMouseDown',
      'onMouseUp',
      'onMouseEnter',
      'onMouseLeave',
      'onMouseMove',
      'onWheel',
    ]
    if (mouseKeys.some((k) => k in newProps)) {
      mouseDispatcher.removeHandlers(this.index)
      mouseHandlers[this.index] = null
      this.setupMouseHandlers()
    }

    const keyboardKeys = [
      'onKeyPress',
      'onEnter',
      'onEscape',
      'onSpace',
      'onArrowUp',
      'onArrowDown',
      'onArrowLeft',
      'onArrowRight',
      'onfocus',
      'onblur',
    ]
    if (keyboardKeys.some((k) => k in newProps)) {
      this.setupKeyboardHandlers()
    }

    if ('focusable' in newProps) {
      focusable[this.index] = newProps.focusable ?? false
    }
    if ('tabIndex' in newProps) {
      tabIndex[this.index] = newProps.tabIndex ?? 0
    }
  }

  getIndex(): number {
    return this.index
  }

  destroy(): void {
    mouseDispatcher.removeHandlers(this.index)
    mouseHandlers[this.index] = null

    if (this.keyboardUnsubscribe) {
      this.keyboardUnsubscribe()
      this.keyboardUnsubscribe = null
    }

    cleanupComponent(this.index)
    releaseIndex(this.id)
  }
}

// ============================================================================
// SVELTE INTEGRATION
// ============================================================================

export function useSimpleComponent(
  componentType: number,
  props: SimpleComponentProps,
  canHaveChildren = false
): SimpleBaseComponent {
  const component = new SimpleBaseComponent(
    componentType,
    props,
    canHaveChildren
  )

  onDestroy(() => {
    component.destroy()
  })

  return component
}
