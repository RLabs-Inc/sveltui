/**
 * Reactive Layout System for SvelTUI
 * 
 * This module provides a reactive layout system that automatically
 * recalculates layouts when dependencies change using Svelte 5's reactivity.
 * 
 * CRITICAL: Never update state inside $effect. Use $effect ONLY for side effects.
 * Use $derived for computed values.
 */

import type { TerminalElement } from '../dom/elements'
import type { Widgets } from 'blessed'
import { applyLayout, type LayoutOptions } from './index'
import { applyYogaLayout, type YogaLayoutOptions } from './yoga'

/**
 * Layout dependency types
 */
export interface LayoutDependencies {
  /** Parent element dimensions */
  parentWidth: number
  parentHeight: number
  
  /** Element's own content size (for shrink) */
  contentWidth?: number
  contentHeight?: number
  
  /** Sibling positions for relative layouts */
  siblingPositions?: Map<TerminalElement, { x: number; y: number; width: number; height: number }>
  
  /** Screen dimensions */
  screenWidth: number
  screenHeight: number
}

/**
 * Layout invalidation reasons
 */
export enum InvalidationReason {
  SCREEN_RESIZE = 'screen_resize',
  PARENT_RESIZE = 'parent_resize',
  CONTENT_CHANGE = 'content_change',
  SIBLING_CHANGE = 'sibling_change',
  PROPS_CHANGE = 'props_change',
  HIERARCHY_CHANGE = 'hierarchy_change'
}

/**
 * Layout state for an element
 */
class LayoutState {
  /** The element this state belongs to */
  element: TerminalElement
  
  /** Current layout dependencies as reactive state */
  dependencies = $state<LayoutDependencies>({
    parentWidth: 0,
    parentHeight: 0,
    screenWidth: 0,
    screenHeight: 0
  })
  
  /** Layout invalidation flag */
  isDirty = $state(true)
  
  /** Invalidation reason */
  invalidationReason = $state<InvalidationReason | null>(null)
  
  /** Layout options */
  layoutOptions = $state<LayoutOptions | YogaLayoutOptions>({})
  
  /** Use Yoga layout engine */
  useYoga = $state(false)
  
  /** Computed layout based on dependencies */
  computedLayout = $derived.by(() => {
    // This derived computation runs whenever dependencies change
    if (!this.isDirty) {
      return this._lastComputedLayout
    }
    
    // Calculate new layout
    const layout = this.calculateLayout()
    
    // Store for next check
    this._lastComputedLayout = layout
    
    // Mark as clean after calculation
    // We'll use a microtask to avoid state update during derivation
    queueMicrotask(() => {
      this.isDirty = false
      this.invalidationReason = null
    })
    
    return layout
  })
  
  /** Last computed layout for comparison */
  private _lastComputedLayout: { x: number; y: number; width: number; height: number } = {
    x: 0, y: 0, width: 0, height: 0
  }
  
  constructor(element: TerminalElement) {
    this.element = element
  }
  
  /**
   * Invalidate layout with a reason
   */
  invalidate(reason: InvalidationReason) {
    this.isDirty = true
    this.invalidationReason = reason
  }
  
  /**
   * Update dependencies
   */
  updateDependencies(deps: Partial<LayoutDependencies>) {
    // Check what changed
    let hasChanges = false
    let reason: InvalidationReason | null = null
    
    if (deps.screenWidth !== undefined && deps.screenWidth !== this.dependencies.screenWidth) {
      hasChanges = true
      reason = InvalidationReason.SCREEN_RESIZE
    }
    if (deps.screenHeight !== undefined && deps.screenHeight !== this.dependencies.screenHeight) {
      hasChanges = true
      reason = InvalidationReason.SCREEN_RESIZE
    }
    if (deps.parentWidth !== undefined && deps.parentWidth !== this.dependencies.parentWidth) {
      hasChanges = true
      reason = reason || InvalidationReason.PARENT_RESIZE
    }
    if (deps.parentHeight !== undefined && deps.parentHeight !== this.dependencies.parentHeight) {
      hasChanges = true
      reason = reason || InvalidationReason.PARENT_RESIZE
    }
    if (deps.contentWidth !== undefined && deps.contentWidth !== this.dependencies.contentWidth) {
      hasChanges = true
      reason = reason || InvalidationReason.CONTENT_CHANGE
    }
    if (deps.contentHeight !== undefined && deps.contentHeight !== this.dependencies.contentHeight) {
      hasChanges = true
      reason = reason || InvalidationReason.CONTENT_CHANGE
    }
    
    if (hasChanges) {
      // Update dependencies
      this.dependencies = { ...this.dependencies, ...deps }
      
      // Invalidate with reason
      if (reason) {
        this.invalidate(reason)
      }
    }
  }
  
  /**
   * Calculate layout based on current dependencies
   */
  private calculateLayout(): { x: number; y: number; width: number; height: number } {
    // If using Yoga layout
    if (this.useYoga && this.element.parent) {
      // Yoga layout is applied to the parent container
      // The element will have its position set by the parent's layout calculation
      // For now, return current position
      return {
        x: this.element.props.left || 0,
        y: this.element.props.top || 0,
        width: this.element.props.width || this.dependencies.parentWidth,
        height: this.element.props.height || this.dependencies.parentHeight
      }
    }
    
    // Otherwise use standard layout calculation
    // This integrates with the existing position-utils
    const { parentWidth, parentHeight, contentWidth, contentHeight } = this.dependencies
    
    // Calculate width
    let width: number
    if (typeof this.element.props.width === 'number') {
      width = this.element.props.width
    } else if (this.element.props.width === 'shrink' && contentWidth) {
      width = contentWidth
    } else if (typeof this.element.props.width === 'string' && this.element.props.width.endsWith('%')) {
      const percent = parseFloat(this.element.props.width)
      width = Math.floor(parentWidth * (percent / 100))
    } else {
      width = parentWidth
    }
    
    // Calculate height
    let height: number
    if (typeof this.element.props.height === 'number') {
      height = this.element.props.height
    } else if (this.element.props.height === 'shrink' && contentHeight) {
      height = contentHeight
    } else if (typeof this.element.props.height === 'string' && this.element.props.height.endsWith('%')) {
      const percent = parseFloat(this.element.props.height)
      height = Math.floor(parentHeight * (percent / 100))
    } else {
      height = parentHeight
    }
    
    // Calculate position
    let x = 0
    let y = 0
    
    if (typeof this.element.props.left === 'number') {
      x = this.element.props.left
    } else if (this.element.props.left === 'center') {
      x = Math.floor((parentWidth - width) / 2)
    } else if (typeof this.element.props.left === 'string' && this.element.props.left.endsWith('%')) {
      const percent = parseFloat(this.element.props.left)
      x = Math.floor(parentWidth * (percent / 100))
    }
    
    if (typeof this.element.props.top === 'number') {
      y = this.element.props.top
    } else if (this.element.props.top === 'center') {
      y = Math.floor((parentHeight - height) / 2)
    } else if (typeof this.element.props.top === 'string' && this.element.props.top.endsWith('%')) {
      const percent = parseFloat(this.element.props.top)
      y = Math.floor(parentHeight * (percent / 100))
    }
    
    return { x, y, width, height }
  }
}

/**
 * Reactive Layout Manager
 * 
 * Manages layout states for all elements and coordinates updates
 */
export class ReactiveLayoutManager {
  /** Layout states by element */
  private layoutStates = new WeakMap<TerminalElement, LayoutState>()
  
  /** Screen reference for resize tracking */
  private screen: Widgets.Screen | null = null
  
  /** Current screen dimensions */
  screenDimensions = $state({ width: 80, height: 24 })
  
  constructor() {
    // Track screen resize events via effect
    $effect(() => {
      if (!this.screen) return
      
      const handleResize = () => {
        this.screenDimensions = {
          width: this.screen!.width,
          height: this.screen!.height
        }
      }
      
      this.screen.on('resize', handleResize)
      
      // Cleanup
      return () => {
        this.screen?.removeListener('resize', handleResize)
      }
    })
  }
  
  /**
   * Set the screen to track for resize events
   */
  setScreen(screen: Widgets.Screen) {
    this.screen = screen
    this.screenDimensions = {
      width: screen.width,
      height: screen.height
    }
  }
  
  /**
   * Get or create layout state for an element
   */
  getLayoutState(element: TerminalElement): LayoutState {
    let state = this.layoutStates.get(element)
    if (!state) {
      state = new LayoutState(element)
      this.layoutStates.set(element, state)
    }
    return state
  }
  
  /**
   * Update element layout dependencies
   */
  updateElementDependencies(element: TerminalElement, deps: Partial<LayoutDependencies>) {
    const state = this.getLayoutState(element)
    
    // Always include current screen dimensions
    state.updateDependencies({
      ...deps,
      screenWidth: this.screenDimensions.width,
      screenHeight: this.screenDimensions.height
    })
  }
  
  /**
   * Apply layout to an element and its children
   */
  applyElementLayout(element: TerminalElement, options?: LayoutOptions | YogaLayoutOptions) {
    const state = this.getLayoutState(element)
    
    // Update layout options if provided
    if (options) {
      state.layoutOptions = options
      state.useYoga = 'flexDirection' in options // Simple check for Yoga options
    }
    
    // Get computed layout (reactive - will recalculate if dirty)
    const layout = state.computedLayout
    
    // Apply to element if changed
    if (element.props.left !== layout.x ||
        element.props.top !== layout.y ||
        element.props.width !== layout.width ||
        element.props.height !== layout.height) {
      
      element.setProps({
        ...element.props,
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height
      })
    }
    
    // Apply layout to children if this is a container
    if (element.children.length > 0) {
      if (state.useYoga) {
        // Use Yoga layout for children
        applyYogaLayout(element, layout.width, layout.height, state.layoutOptions as YogaLayoutOptions)
      } else {
        // Use standard layout for children
        applyLayout(element, state.layoutOptions as LayoutOptions)
      }
      
      // Update children dependencies
      for (const child of element.children) {
        this.updateElementDependencies(child, {
          parentWidth: layout.width,
          parentHeight: layout.height
        })
      }
    }
  }
  
  /**
   * Invalidate layout for an element and optionally its children
   */
  invalidateElement(element: TerminalElement, reason: InvalidationReason, recursive = false) {
    const state = this.layoutStates.get(element)
    if (state) {
      state.invalidate(reason)
    }
    
    if (recursive) {
      for (const child of element.children) {
        this.invalidateElement(child, reason, true)
      }
    }
  }
  
  /**
   * Clean up layout state for an element
   */
  cleanupElement(element: TerminalElement) {
    this.layoutStates.delete(element)
  }
}

// Global layout manager instance
export const layoutManager = new ReactiveLayoutManager()