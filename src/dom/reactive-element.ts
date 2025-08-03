/**
 * Reactive Terminal Element
 * 
 * This module provides a reactive wrapper around terminal elements using
 * Svelte 5's internal reactive primitives. It enables fine-grained reactivity
 * for terminal element properties.
 * 
 * CRITICAL: Effects are ONLY used for side effects (updating blessed elements).
 * Never update state inside effects. Use $derived for computed values.
 */

import type { Widgets } from 'blessed'
import type { BaseElementProps, TerminalElement } from './elements'
import type { TerminalElementNode, TerminalTextNode } from './nodes'
import { NodeType } from './nodes'

// We'll dynamically import these to avoid compilation issues
let source: any
let effect: any
let untrack: any

// Lazy load Svelte internals
async function loadSvelteInternals() {
  if (!source || !effect || !untrack) {
    try {
      const client = await import('svelte/internal/client')
      source = client.source
      effect = client.effect
      untrack = client.untrack
      return true
    } catch (e) {
      console.warn('Failed to load Svelte internals:', e)
      return false
    }
  }
  return true
}

/**
 * Reactive sources for terminal element properties
 */
export interface ReactiveElementSources {
  // Position sources
  top: any // ReturnType<typeof source>
  left: any
  right: any
  bottom: any
  width: any
  height: any
  
  // Style sources
  fg: any
  bg: any
  borderFg: any
  
  // Content sources
  content: any
  label: any
  
  // State sources
  hidden: any
  focused: any
  
  // Border sources
  border: any
}

/**
 * Reactive terminal element that automatically syncs property changes
 * to the underlying blessed element
 */
export class ReactiveTerminalElement implements TerminalElement {
  /** Element type */
  type: string

  /** Associated blessed element */
  blessed: Widgets.BlessedElement | null = null

  /** Element properties */
  props: BaseElementProps

  /** Parent element */
  parent: TerminalElement | null = null

  /** Child elements */
  children: TerminalElement[] = []

  /** DOM node type */
  nodeType: NodeType = NodeType.ELEMENT

  /** Associated DOM node */
  domNode: TerminalElementNode | null = null
  /**
   * Reactive sources for element properties
   */
  private sources: ReactiveElementSources | null = null
  
  /**
   * Active effects for cleanup
   */
  private effects: Array<() => void> = []
  
  /**
   * Flag to prevent infinite loops during batch updates
   */
  private isUpdating = false
  
  /**
   * Flag to track if Svelte internals are loaded
   */
  private internalsLoaded = false
  
  /**
   * Deferred initialization promise
   */
  private initPromise: Promise<void> | null = null
  
  /**
   * Creates a new reactive terminal element
   * @param type - Element type
   * @param props - Initial element properties
   */
  constructor(type: string, props: BaseElementProps) {
    this.type = type
    this.props = { ...props }
    
    // Try to initialize sources immediately
    this.initPromise = this.initializeSources(props)
  }
  
  /**
   * Initialize reactive sources
   */
  private async initializeSources(props: BaseElementProps): Promise<void> {
    const loaded = await loadSvelteInternals()
    if (!loaded) {
      console.warn('ReactiveTerminalElement: Svelte internals not available, falling back to non-reactive mode')
      return
    }
    
    this.internalsLoaded = true
    
    // Check if source is actually loaded
    if (!source) {
      console.warn('ReactiveTerminalElement: source function not available after loading internals')
      return
    }
    
    // Initialize reactive sources from props
    this.sources = {
      // Position sources
      top: source(props.top ?? 0),
      left: source(props.left ?? 0),
      right: source(props.right),
      bottom: source(props.bottom),
      width: source(props.width ?? '100%'),
      height: source(props.height ?? '100%'),
      
      // Style sources
      fg: source(props.style?.fg || 'white'),
      bg: source(props.style?.bg || 'black'),
      borderFg: source(props.style?.border?.fg || 'white'),
      
      // Content sources
      content: source((props as any).content || ''),
      label: source(props.label || ''),
      
      // State sources
      hidden: source(props.hidden || false),
      focused: source(props.focused || false),
      
      // Border sources
      border: source(props.border || false),
    }
    
    // If blessed element already exists, set up effects
    if (this.blessed) {
      this.setupEffects()
    }
  }
  
  /**
   * Sets up reactive effects to sync sources with blessed element
   * CRITICAL: Effects ONLY update blessed elements, never state
   */
  private setupEffects(): void {
    // Clean up any existing effects
    this.cleanupEffects()
    
    // Check if sources are initialized
    if (!this.sources || !effect || !this.blessed) return
    
    // Position effects - only update blessed element, never state
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const value = this.sources!.top.get()
        if (this.blessed.top !== value) {
          this.blessed.top = value
          this.scheduleRender()
        }
      })
    )
    
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const value = this.sources!.left.get()
        if (this.blessed.left !== value) {
          this.blessed.left = value
          this.scheduleRender()
        }
      })
    )
    
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const value = this.sources!.width.get()
        if (this.blessed.width !== value) {
          this.blessed.width = value
          this.scheduleRender()
        }
      })
    )
    
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const value = this.sources!.height.get()
        if (this.blessed.height !== value) {
          this.blessed.height = value
          this.scheduleRender()
        }
      })
    )
    
    // Content effect - only update blessed element
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const value = this.sources!.content.get()
        if ('setContent' in this.blessed && typeof this.blessed.setContent === 'function') {
          (this.blessed as any).setContent(value)
          this.scheduleRender()
        }
      })
    )
    
    // Style effects - only update blessed element
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const fg = this.sources!.fg.get()
        const bg = this.sources!.bg.get()
        
        if (this.blessed.style) {
          this.blessed.style.fg = fg
          this.blessed.style.bg = bg
          this.scheduleRender()
        }
      })
    )
    
    // Visibility effect - only update blessed element
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const hidden = this.sources!.hidden.get()
        
        if (hidden) {
          this.blessed.hide()
        } else {
          this.blessed.show()
        }
        this.scheduleRender()
      })
    )
    
    // Border effect - only update blessed element
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const border = this.sources!.border.get()
        const borderFg = this.sources!.borderFg.get()
        
        if (this.blessed.border !== border) {
          this.blessed.border = border
          if (border && this.blessed.style?.border) {
            this.blessed.style.border.fg = borderFg
          }
          this.scheduleRender()
        }
      })
    )
    
    // Label effect - only update blessed element
    this.effects.push(
      effect(() => {
        if (!this.blessed || this.isUpdating) return
        const label = this.sources!.label.get()
        if ('setLabel' in this.blessed && typeof this.blessed.setLabel === 'function') {
          (this.blessed as any).setLabel(label)
          this.scheduleRender()
        }
      })
    )
  }
  
  /**
   * Schedules a render on the next tick
   */
  private renderScheduled = false
  private scheduleRender(): void {
    if (this.renderScheduled || !this.blessed) return
    
    this.renderScheduled = true
    setImmediate(() => {
      this.renderScheduled = false
      if (this.blessed && this.blessed.screen) {
        this.blessed.screen.render()
      }
    })
  }
  
  /**
   * Cleans up reactive effects
   */
  private cleanupEffects(): void {
    this.effects.forEach(cleanup => cleanup())
    this.effects = []
  }
  
  /**
   * Attaches this terminal element to a DOM node
   * @param node - DOM node to attach to
   */
  attachToNode(node: TerminalElementNode): void {
    this.domNode = node
    // Update DOM node to point to this terminal element
    node._terminalElement = this
  }
  
  /**
   * Appends a child element
   * @param child - Child element to append
   */
  appendChild(child: TerminalElement): void {
    this.children.push(child)
    child.parent = this

    // Create blessed element for the child if needed
    if (this.blessed && !child.blessed) {
      child.create(this.blessed)
    }
  }

  /**
   * Removes a child element
   * @param child - Child element to remove
   */
  removeChild(child: TerminalElement): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null

      // Destroy the child's blessed element
      if (child.blessed) {
        child.destroy()
      }
    }
  }

  /**
   * Inserts a child element before another
   * @param child - Child to insert
   * @param beforeChild - Reference child
   */
  insertBefore(child: TerminalElement, beforeChild: TerminalElement): void {
    const index = this.children.indexOf(beforeChild)
    if (index !== -1) {
      this.children.splice(index, 0, child)
      child.parent = this

      // Create blessed element for the child if needed
      if (this.blessed && !child.blessed) {
        child.create(this.blessed)
      }
    } else {
      // If beforeChild is not found, append
      this.appendChild(child)
    }
  }
  
  /**
   * Creates the blessed element
   * @param parent - Parent blessed node
   */
  create(parent?: Widgets.Node): void {
    // This must be implemented by subclasses
    throw new Error('ReactiveTerminalElement.create must be implemented by subclasses')
  }
  
  /**
   * Override setProps to update reactive sources
   */
  setProps(props: BaseElementProps): void {
    // If no sources yet, just update base props
    if (!this.sources || !this.internalsLoaded) {
      super.setProps(props)
      return
    }
    
    this.isUpdating = true
    
    // Untrack updates to prevent loops
    if (untrack) {
      untrack(() => {
        // Update reactive sources
        if (props.top !== undefined) this.sources!.top.set(props.top)
        if (props.left !== undefined) this.sources!.left.set(props.left)
        if (props.right !== undefined) this.sources!.right.set(props.right)
        if (props.bottom !== undefined) this.sources!.bottom.set(props.bottom)
        if (props.width !== undefined) this.sources!.width.set(props.width)
        if (props.height !== undefined) this.sources!.height.set(props.height)
        
        if (props.style) {
          if (props.style.fg !== undefined) this.sources!.fg.set(props.style.fg)
          if (props.style.bg !== undefined) this.sources!.bg.set(props.style.bg)
          if (props.style.border?.fg !== undefined) this.sources!.borderFg.set(props.style.border.fg)
        }
        
        if ((props as any).content !== undefined) this.sources!.content.set((props as any).content)
        if (props.label !== undefined) this.sources!.label.set(props.label)
        if (props.hidden !== undefined) this.sources!.hidden.set(props.hidden)
        if (props.focused !== undefined) this.sources!.focused.set(props.focused)
        if (props.border !== undefined) this.sources!.border.set(props.border)
      })
    } else {
      // Fallback without untrack
      if (props.top !== undefined) this.sources!.top.set(props.top)
      if (props.left !== undefined) this.sources!.left.set(props.left)
      if (props.right !== undefined) this.sources!.right.set(props.right)
      if (props.bottom !== undefined) this.sources!.bottom.set(props.bottom)
      if (props.width !== undefined) this.sources!.width.set(props.width)
      if (props.height !== undefined) this.sources!.height.set(props.height)
      
      if (props.style) {
        if (props.style.fg !== undefined) this.sources!.fg.set(props.style.fg)
        if (props.style.bg !== undefined) this.sources!.bg.set(props.style.bg)
        if (props.style.border?.fg !== undefined) this.sources!.borderFg.set(props.style.border.fg)
      }
      
      if ((props as any).content !== undefined) this.sources!.content.set((props as any).content)
      if (props.label !== undefined) this.sources!.label.set(props.label)
      if (props.hidden !== undefined) this.sources!.hidden.set(props.hidden)
      if (props.focused !== undefined) this.sources!.focused.set(props.focused)
      if (props.border !== undefined) this.sources!.border.set(props.border)
    }
    
    this.isUpdating = false
    
    // Update base props
    super.setProps(props)
  }
  
  /**
   * Gets the current values from reactive sources
   */
  getReactiveProps(): Partial<BaseElementProps> {
    if (!this.sources) {
      return this.props
    }
    
    return {
      top: this.sources.top.get(),
      left: this.sources.left.get(),
      right: this.sources.right.get(),
      bottom: this.sources.bottom.get(),
      width: this.sources.width.get(),
      height: this.sources.height.get(),
      style: {
        fg: this.sources.fg.get(),
        bg: this.sources.bg.get(),
        border: {
          fg: this.sources.borderFg.get()
        }
      },
      label: this.sources.label.get(),
      hidden: this.sources.hidden.get(),
      focused: this.sources.focused.get(),
      border: this.sources.border.get(),
    }
  }
  
  /**
   * Gets a reactive source by name
   */
  getSource(name: keyof ReactiveElementSources): any {
    return this.sources?.[name]
  }
  
  /**
   * Override update to handle reactive updates
   */
  update(): void {
    // In reactive mode, updates are handled by effects
    // This method is kept for compatibility and manual updates
    if (!this.blessed || !this.internalsLoaded) {
      super.update()
      return
    }
    
    // Manual update can still trigger a render
    this.scheduleRender()
  }
  
  /**
   * Destroys the element and cleans up effects
   */
  destroy(): void {
    this.cleanupEffects()
    
    // Remove from parent's children list
    if (this.parent) {
      this.parent.removeChild(this)
    }

    // Destroy all children
    while (this.children.length > 0) {
      this.children[0].destroy()
    }

    // Destroy blessed element
    if (this.blessed) {
      // Detach from screen
      this.blessed.detach()
      // Remove from blessed's node registry
      if (this.blessed.parent) {
        this.blessed.parent.remove(this.blessed)
      }
      this.blessed = null
    }

    // Detach from DOM node
    if (this.domNode) {
      this.domNode._terminalElement = null as any
      this.domNode = null
    }
  }
  
  /**
   * Helper to bind external reactive values to element properties
   * Usage: element.bindReactiveProp('content', () => myState.value)
   */
  bindReactiveProp<T>(propName: keyof ReactiveElementSources, getValue: () => T): () => void {
    if (!this.sources || !effect) {
      console.warn('ReactiveTerminalElement: Cannot bind reactive prop, internals not loaded')
      return () => {}
    }
    
    // Create an effect that updates the element's source
    const cleanup = effect(() => {
      const value = getValue()
      const source = this.sources![propName]
      if (source && untrack) {
        untrack(() => source.set(value))
      } else if (source) {
        source.set(value)
      }
    })
    
    // Add to effects array for cleanup
    this.effects.push(cleanup)
    
    return cleanup
  }
}

/**
 * Helper to create a reactive terminal element with type inference
 */
export function createReactiveElement<T extends BaseElementProps>(
  type: string,
  props: T
): ReactiveTerminalElement {
  return new ReactiveTerminalElement(type, props)
}