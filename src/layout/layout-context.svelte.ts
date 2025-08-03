/**
 * Layout Context for SvelTUI
 * 
 * Provides reactive layout context that tracks screen dimensions,
 * element hierarchies, and manages layout constraints.
 */

import type { TerminalElement } from '../dom/elements'
import type { Widgets } from 'blessed'
import { layoutManager, type InvalidationReason } from './reactive-layout.svelte.ts'
import type { LayoutOptions } from './index'
import type { YogaLayoutOptions } from './yoga'

/**
 * Layout context data
 */
export interface LayoutContextData {
  /** Screen dimensions */
  screenWidth: number
  screenHeight: number
  
  /** Parent element */
  parent: TerminalElement | null
  
  /** Parent dimensions */
  parentWidth: number
  parentHeight: number
  
  /** Layout constraints */
  constraints: LayoutConstraints
  
  /** Layout rules */
  rules: LayoutRules
}

/**
 * Layout constraints for an element
 */
export interface LayoutConstraints {
  /** Minimum width */
  minWidth?: number
  
  /** Maximum width */
  maxWidth?: number
  
  /** Minimum height */
  minHeight?: number
  
  /** Maximum height */
  maxHeight?: number
  
  /** Aspect ratio (width/height) */
  aspectRatio?: number
}

/**
 * Layout rules for automatic layout
 */
export interface LayoutRules {
  /** Automatically reflow on screen resize */
  autoReflow?: boolean
  
  /** Maintain aspect ratio on resize */
  maintainAspectRatio?: boolean
  
  /** Clip content that overflows bounds */
  clipOverflow?: boolean
  
  /** Z-index for layering */
  zIndex?: number
}

/**
 * Element hierarchy tracking
 */
interface ElementHierarchy {
  element: TerminalElement
  parent: TerminalElement | null
  children: Set<TerminalElement>
  depth: number
}

/**
 * Layout Context
 * 
 * Manages layout context for elements and provides reactive updates
 */
export class LayoutContext {
  /** Current screen reference */
  private screen: Widgets.Screen | null = null
  
  /** Element hierarchy map */
  private hierarchy = new Map<TerminalElement, ElementHierarchy>()
  
  /** Layout constraints by element */
  private constraints = new WeakMap<TerminalElement, LayoutConstraints>()
  
  /** Layout rules by element */
  private rules = new WeakMap<TerminalElement, LayoutRules>()
  
  /** Screen dimensions (reactive) */
  screenDimensions = $state({ width: 80, height: 24 })
  
  /** Root elements (elements without parents) */
  rootElements = $state<Set<TerminalElement>>(new Set())
  
  constructor() {
    // Subscribe to screen dimension changes from layout manager
    $effect(() => {
      const dims = layoutManager.screenDimensions
      this.screenDimensions = { width: dims.width, height: dims.height }
    })
  }
  
  /**
   * Set the screen reference
   */
  setScreen(screen: Widgets.Screen) {
    this.screen = screen
    layoutManager.setScreen(screen)
  }
  
  /**
   * Register an element in the hierarchy
   */
  registerElement(element: TerminalElement, parent: TerminalElement | null = null) {
    // Create hierarchy entry
    const entry: ElementHierarchy = {
      element,
      parent,
      children: new Set(),
      depth: parent ? (this.hierarchy.get(parent)?.depth || 0) + 1 : 0
    }
    
    this.hierarchy.set(element, entry)
    
    // Update parent's children
    if (parent) {
      const parentEntry = this.hierarchy.get(parent)
      if (parentEntry) {
        parentEntry.children.add(element)
      }
    } else {
      // This is a root element
      this.rootElements.add(element)
    }
    
    // Initialize layout dependencies
    this.updateElementContext(element)
  }
  
  /**
   * Unregister an element from the hierarchy
   */
  unregisterElement(element: TerminalElement) {
    const entry = this.hierarchy.get(element)
    if (!entry) return
    
    // Remove from parent's children
    if (entry.parent) {
      const parentEntry = this.hierarchy.get(entry.parent)
      if (parentEntry) {
        parentEntry.children.delete(element)
      }
    } else {
      // Remove from root elements
      this.rootElements.delete(element)
    }
    
    // Cleanup
    this.hierarchy.delete(element)
    layoutManager.cleanupElement(element)
  }
  
  /**
   * Update element's parent (for reparenting)
   */
  reparentElement(element: TerminalElement, newParent: TerminalElement | null) {
    const entry = this.hierarchy.get(element)
    if (!entry) return
    
    // Remove from old parent
    if (entry.parent) {
      const oldParentEntry = this.hierarchy.get(entry.parent)
      if (oldParentEntry) {
        oldParentEntry.children.delete(element)
      }
    } else {
      this.rootElements.delete(element)
    }
    
    // Add to new parent
    entry.parent = newParent
    if (newParent) {
      const newParentEntry = this.hierarchy.get(newParent)
      if (newParentEntry) {
        newParentEntry.children.add(element)
      }
      entry.depth = (newParentEntry?.depth || 0) + 1
    } else {
      this.rootElements.add(element)
      entry.depth = 0
    }
    
    // Update context and invalidate layout
    this.updateElementContext(element)
    layoutManager.invalidateElement(element, 'hierarchy_change' as InvalidationReason, true)
  }
  
  /**
   * Set constraints for an element
   */
  setConstraints(element: TerminalElement, constraints: LayoutConstraints) {
    this.constraints.set(element, constraints)
    
    // Invalidate layout as constraints changed
    layoutManager.invalidateElement(element, 'props_change' as InvalidationReason)
  }
  
  /**
   * Get constraints for an element
   */
  getConstraints(element: TerminalElement): LayoutConstraints {
    return this.constraints.get(element) || {}
  }
  
  /**
   * Set layout rules for an element
   */
  setRules(element: TerminalElement, rules: LayoutRules) {
    this.rules.set(element, rules)
  }
  
  /**
   * Get layout rules for an element
   */
  getRules(element: TerminalElement): LayoutRules {
    return this.rules.get(element) || {}
  }
  
  /**
   * Get layout context data for an element
   */
  getContextData(element: TerminalElement): LayoutContextData {
    const entry = this.hierarchy.get(element)
    const parent = entry?.parent || null
    
    let parentWidth = this.screenDimensions.width
    let parentHeight = this.screenDimensions.height
    
    if (parent && parent.blessed) {
      parentWidth = parent.blessed.width || parentWidth
      parentHeight = parent.blessed.height || parentHeight
    }
    
    return {
      screenWidth: this.screenDimensions.width,
      screenHeight: this.screenDimensions.height,
      parent,
      parentWidth,
      parentHeight,
      constraints: this.getConstraints(element),
      rules: this.getRules(element)
    }
  }
  
  /**
   * Update element context (dependencies)
   */
  private updateElementContext(element: TerminalElement) {
    const context = this.getContextData(element)
    
    layoutManager.updateElementDependencies(element, {
      parentWidth: context.parentWidth,
      parentHeight: context.parentHeight,
      screenWidth: context.screenWidth,
      screenHeight: context.screenHeight
    })
  }
  
  /**
   * Apply layout to an element with constraints
   */
  applyLayoutWithConstraints(
    element: TerminalElement,
    options?: LayoutOptions | YogaLayoutOptions
  ) {
    const constraints = this.getConstraints(element)
    const rules = this.getRules(element)
    
    // Apply constraints to layout options
    if (constraints || rules) {
      const constrainedOptions = this.applyConstraintsToOptions(
        options || {},
        constraints,
        rules
      )
      layoutManager.applyElementLayout(element, constrainedOptions)
    } else {
      layoutManager.applyElementLayout(element, options)
    }
    
    // Handle auto-reflow for children
    if (rules.autoReflow) {
      for (const child of element.children) {
        this.applyLayoutWithConstraints(child)
      }
    }
  }
  
  /**
   * Apply constraints to layout options
   */
  private applyConstraintsToOptions(
    options: LayoutOptions | YogaLayoutOptions,
    constraints: LayoutConstraints,
    rules: LayoutRules
  ): LayoutOptions | YogaLayoutOptions {
    const constrained = { ...options }
    
    // Apply min/max constraints
    if ('minWidth' in constraints || 'maxWidth' in constraints) {
      // These will be handled during layout calculation
      Object.assign(constrained, {
        minWidth: constraints.minWidth,
        maxWidth: constraints.maxWidth
      })
    }
    
    if ('minHeight' in constraints || 'maxHeight' in constraints) {
      Object.assign(constrained, {
        minHeight: constraints.minHeight,
        maxHeight: constraints.maxHeight
      })
    }
    
    return constrained
  }
  
  /**
   * Get all elements at a specific depth
   */
  getElementsByDepth(depth: number): TerminalElement[] {
    const elements: TerminalElement[] = []
    
    for (const [element, entry] of this.hierarchy) {
      if (entry.depth === depth) {
        elements.push(element)
      }
    }
    
    return elements
  }
  
  /**
   * Get element depth in hierarchy
   */
  getElementDepth(element: TerminalElement): number {
    return this.hierarchy.get(element)?.depth || 0
  }
  
  /**
   * Get element's children
   */
  getChildren(element: TerminalElement): Set<TerminalElement> {
    return this.hierarchy.get(element)?.children || new Set()
  }
  
  /**
   * Perform depth-first traversal of hierarchy
   */
  traverseHierarchy(
    callback: (element: TerminalElement, depth: number) => void,
    startElement?: TerminalElement
  ) {
    const visit = (el: TerminalElement, depth: number) => {
      callback(el, depth)
      
      const children = this.getChildren(el)
      for (const child of children) {
        visit(child, depth + 1)
      }
    }
    
    if (startElement) {
      visit(startElement, 0)
    } else {
      // Visit all root elements
      for (const root of this.rootElements) {
        visit(root, 0)
      }
    }
  }
}

// Global layout context instance
export const layoutContext = new LayoutContext()