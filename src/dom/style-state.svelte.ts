/**
 * Style State Machine for SvelTUI
 * 
 * Manages blessed's style states (normal, hover, focus, pressed) using Svelte 5's reactivity.
 * Provides a reactive style system that automatically computes the current style based on state.
 */

import type { Widgets } from 'blessed'

/**
 * Style definition for terminal elements
 */
export interface TerminalStyle {
  // Text styles
  fg?: string
  bg?: string
  bold?: boolean
  underline?: boolean
  blink?: boolean
  inverse?: boolean
  invisible?: boolean
  italic?: boolean
  
  // Border styles
  border?: {
    fg?: string
    bg?: string
    type?: 'line' | 'bg' | 'ascii' | 'double' | 'single'
    ch?: string
  }
  
  // Scrollbar styles
  scrollbar?: {
    fg?: string
    bg?: string
    track?: {
      fg?: string
      bg?: string
      ch?: string
    }
  }
  
  // Label styles
  label?: {
    fg?: string
    bg?: string
    bold?: boolean
    underline?: boolean
  }
  
  // Focus styles (applied when element has focus)
  focus?: Partial<TerminalStyle>
  
  // Hover styles (applied when mouse is over element)
  hover?: Partial<TerminalStyle>
  
  // Pressed/active styles (applied when element is being clicked)
  pressed?: Partial<TerminalStyle>
}

/**
 * Style state configuration
 */
export interface StyleStateConfig {
  // Base styles
  normal?: TerminalStyle
  hover?: TerminalStyle
  focus?: TerminalStyle
  pressed?: TerminalStyle
  
  // Whether to inherit styles from parent
  inherit?: boolean
  
  // Parent style state (for inheritance)
  parent?: StyleState
}

/**
 * Creates a reactive style state machine
 */
export class StyleState {
  // State tracking
  private isHovered = $state(false)
  private isFocused = $state(false)
  private isPressed = $state(false)
  
  // Style configurations
  private normalStyle: TerminalStyle
  private hoverStyle: TerminalStyle
  private focusStyle: TerminalStyle
  private pressedStyle: TerminalStyle
  private inherit: boolean
  private parent?: StyleState
  
  constructor(config: StyleStateConfig = {}) {
    this.normalStyle = config.normal || {}
    this.hoverStyle = config.hover || {}
    this.focusStyle = config.focus || {}
    this.pressedStyle = config.pressed || {}
    this.inherit = config.inherit ?? true
    this.parent = config.parent
  }
  
  /**
   * Current computed style based on state
   * Uses $derived.by to compute style based on current state
   */
  currentStyle = $derived.by(() => {
    // Start with base style (including inheritance if enabled)
    let style = this.getBaseStyle()
    
    // Apply state-based styles in order of precedence
    if (this.isHovered) {
      style = this.mergeStyles(style, this.hoverStyle)
    }
    
    if (this.isFocused) {
      style = this.mergeStyles(style, this.focusStyle)
    }
    
    if (this.isPressed) {
      style = this.mergeStyles(style, this.pressedStyle)
    }
    
    return style
  })
  
  /**
   * Blessed-compatible style object
   * Converts our style format to blessed's expected format
   */
  blessedStyle = $derived.by(() => {
    const style = this.currentStyle
    const blessed: any = {}
    
    // Map base properties
    if (style.fg) blessed.fg = style.fg
    if (style.bg) blessed.bg = style.bg
    if (style.bold) blessed.bold = style.bold
    if (style.underline) blessed.underline = style.underline
    if (style.blink) blessed.blink = style.blink
    if (style.inverse) blessed.inverse = style.inverse
    if (style.invisible) blessed.invisible = style.invisible
    if (style.italic) blessed.italic = style.italic
    
    // Map nested properties
    if (style.border) blessed.border = { ...style.border }
    if (style.scrollbar) blessed.scrollbar = { ...style.scrollbar }
    if (style.label) blessed.label = { ...style.label }
    
    // Map state-specific styles for blessed
    if (style.focus) blessed.focus = this.convertToBlessedStyle(style.focus)
    if (style.hover) blessed.hover = this.convertToBlessedStyle(style.hover)
    
    return blessed
  })
  
  /**
   * State change methods
   */
  setHovered(value: boolean) {
    this.isHovered = value
  }
  
  setFocused(value: boolean) {
    this.isFocused = value
  }
  
  setPressed(value: boolean) {
    this.isPressed = value
  }
  
  /**
   * Update style configurations
   */
  updateNormalStyle(style: Partial<TerminalStyle>) {
    this.normalStyle = this.mergeStyles(this.normalStyle, style)
  }
  
  updateHoverStyle(style: Partial<TerminalStyle>) {
    this.hoverStyle = this.mergeStyles(this.hoverStyle, style)
  }
  
  updateFocusStyle(style: Partial<TerminalStyle>) {
    this.focusStyle = this.mergeStyles(this.focusStyle, style)
  }
  
  updatePressedStyle(style: Partial<TerminalStyle>) {
    this.pressedStyle = this.mergeStyles(this.pressedStyle, style)
  }
  
  /**
   * Set parent for style inheritance
   */
  setParent(parent: StyleState | undefined) {
    this.parent = parent
  }
  
  /**
   * Get base style (including inheritance)
   */
  private getBaseStyle(): TerminalStyle {
    let style = { ...this.normalStyle }
    
    if (this.inherit && this.parent) {
      // Inherit from parent's current style
      const parentStyle = this.parent.currentStyle
      style = this.mergeStyles(parentStyle, style)
    }
    
    return style
  }
  
  /**
   * Merge two styles (right overwrites left)
   */
  private mergeStyles(base: TerminalStyle, override?: Partial<TerminalStyle>): TerminalStyle {
    if (!override) return { ...base }
    
    const merged = { ...base }
    
    // Merge simple properties
    Object.keys(override).forEach(key => {
      const value = override[key as keyof TerminalStyle]
      if (value !== undefined && typeof value !== 'object') {
        (merged as any)[key] = value
      }
    })
    
    // Merge nested objects
    if (override.border) {
      merged.border = { ...base.border, ...override.border }
    }
    
    if (override.scrollbar) {
      merged.scrollbar = {
        ...base.scrollbar,
        ...override.scrollbar,
        track: override.scrollbar.track
          ? { ...base.scrollbar?.track, ...override.scrollbar.track }
          : base.scrollbar?.track
      }
    }
    
    if (override.label) {
      merged.label = { ...base.label, ...override.label }
    }
    
    // Don't merge state styles (focus, hover, pressed) - they're applied separately
    
    return merged
  }
  
  /**
   * Convert style to blessed format
   */
  private convertToBlessedStyle(style: Partial<TerminalStyle>): any {
    const blessed: any = {}
    
    if (style.fg) blessed.fg = style.fg
    if (style.bg) blessed.bg = style.bg
    if (style.bold !== undefined) blessed.bold = style.bold
    if (style.underline !== undefined) blessed.underline = style.underline
    if (style.blink !== undefined) blessed.blink = style.blink
    if (style.inverse !== undefined) blessed.inverse = style.inverse
    if (style.invisible !== undefined) blessed.invisible = style.invisible
    if (style.italic !== undefined) blessed.italic = style.italic
    
    return blessed
  }
}

/**
 * Create a style state with default terminal styles
 */
export function createStyleState(config?: StyleStateConfig): StyleState {
  return new StyleState({
    normal: {
      fg: 'white',
      bg: 'black',
      ...config?.normal
    },
    hover: {
      bg: 'gray',
      ...config?.hover
    },
    focus: {
      border: { fg: 'cyan' },
      ...config?.focus
    },
    pressed: {
      bg: 'blue',
      fg: 'white',
      ...config?.pressed
    },
    ...config
  })
}

/**
 * Hook to connect style state to terminal element events
 */
export function useStyleStateEvents(
  element: Widgets.BlessedElement,
  styleState: StyleState
) {
  // Mouse events
  element.on('mouseover', () => styleState.setHovered(true))
  element.on('mouseout', () => styleState.setHovered(false))
  element.on('mousedown', () => styleState.setPressed(true))
  element.on('mouseup', () => styleState.setPressed(false))
  
  // Focus events
  element.on('focus', () => styleState.setFocused(true))
  element.on('blur', () => styleState.setFocused(false))
  
  // Cleanup
  return () => {
    element.removeAllListeners('mouseover')
    element.removeAllListeners('mouseout')
    element.removeAllListeners('mousedown')
    element.removeAllListeners('mouseup')
    element.removeAllListeners('focus')
    element.removeAllListeners('blur')
  }
}