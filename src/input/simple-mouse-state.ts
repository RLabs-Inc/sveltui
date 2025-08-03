/**
 * Simple Mouse State System for SvelTUI
 * 
 * This is a non-reactive version for tracking mouse state.
 * Components should use reactive wrappers to track changes.
 */

import type { TerminalElement } from '../dom/elements'
import type { ReactiveEventData } from '../dom/reactive-events.svelte.ts'
import { globalEventBus } from '../dom/reactive-events.svelte.ts'
import { hitTest, getElementAtPosition, convertToElementCoordinates } from './mouse-utils'

// Mouse button states
export interface MouseButtonState {
  left: boolean
  middle: boolean
  right: boolean
}

// Mouse position
export interface MousePosition {
  x: number
  y: number
  screenX: number
  screenY: number
}

// Mouse drag state
export interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  draggedElement: TerminalElement | null
}

// Mouse movement history for gesture detection
export interface MouseMovement {
  x: number
  y: number
  timestamp: number
}

/**
 * Simple Mouse State Manager
 * Tracks mouse state without reactivity - components wrap this for reactive updates
 */
export class SimpleMouseState {
  private position: MousePosition = { x: 0, y: 0, screenX: 0, screenY: 0 }
  private buttons: MouseButtonState = { left: false, middle: false, right: false }
  private movementHistory: MouseMovement[] = []
  private historyLimit = 20
  private dragStartPosition: { x: number, y: number } | null = null
  private draggedElement: TerminalElement | null = null
  private rootElement: TerminalElement | null = null
  private scrollDelta: { x: number, y: number } = { x: 0, y: 0 }
  private lastScrollTime = 0
  
  // Event callbacks for reactive updates
  private changeCallbacks = new Set<() => void>()
  
  constructor() {
    this.setupEventListeners()
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(callback: () => void): () => void {
    this.changeCallbacks.add(callback)
    return () => this.changeCallbacks.delete(callback)
  }
  
  /**
   * Notify subscribers of state change
   */
  private notifyChange(): void {
    this.changeCallbacks.forEach(cb => cb())
  }
  
  /**
   * Get current mouse position
   */
  getPosition(): MousePosition {
    return { ...this.position }
  }
  
  /**
   * Get button states
   */
  getButtons(): MouseButtonState {
    return { ...this.buttons }
  }
  
  /**
   * Get the currently hovered element
   */
  getHoveredElement(): TerminalElement | null {
    if (!this.rootElement) return null
    return getElementAtPosition(this.rootElement, this.position.x, this.position.y)
  }
  
  /**
   * Get current drag state
   */
  getDragState(): DragState {
    const isDragging = this.dragStartPosition !== null
    
    if (!isDragging) {
      return {
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: this.position.x,
        currentY: this.position.y,
        deltaX: 0,
        deltaY: 0,
        draggedElement: null
      }
    }
    
    return {
      isDragging: true,
      startX: this.dragStartPosition!.x,
      startY: this.dragStartPosition!.y,
      currentX: this.position.x,
      currentY: this.position.y,
      deltaX: this.position.x - this.dragStartPosition!.x,
      deltaY: this.position.y - this.dragStartPosition!.y,
      draggedElement: this.draggedElement
    }
  }
  
  /**
   * Get movement velocity
   */
  getVelocity(): { x: number, y: number } {
    if (this.movementHistory.length < 2) {
      return { x: 0, y: 0 }
    }
    
    const recent = this.movementHistory.slice(-5)
    if (recent.length < 2) {
      return { x: 0, y: 0 }
    }
    
    const first = recent[0]
    const last = recent[recent.length - 1]
    const timeDelta = last.timestamp - first.timestamp
    
    if (timeDelta === 0) {
      return { x: 0, y: 0 }
    }
    
    return {
      x: (last.x - first.x) / timeDelta * 1000,
      y: (last.y - first.y) / timeDelta * 1000
    }
  }
  
  /**
   * Get scroll delta
   */
  getScrollDelta(): { x: number, y: number } {
    return { ...this.scrollDelta }
  }
  
  /**
   * Check if mouse is over a specific element
   */
  isOverElement(element: TerminalElement): boolean {
    const hovered = this.getHoveredElement()
    if (!hovered) return false
    
    let current: TerminalElement | null = hovered
    while (current) {
      if (current === element) return true
      current = current.parent
    }
    
    return false
  }
  
  /**
   * Get mouse position relative to an element
   */
  getRelativePosition(element: TerminalElement): { x: number, y: number } | null {
    return convertToElementCoordinates(element, this.position.x, this.position.y)
  }
  
  /**
   * Set the root element for hit testing
   */
  setRootElement(element: TerminalElement): void {
    this.rootElement = element
    this.notifyChange()
  }
  
  private updatePosition(x: number, y: number): void {
    this.position = { x, y, screenX: x, screenY: y }
    
    const movement: MouseMovement = {
      x,
      y,
      timestamp: Date.now()
    }
    
    this.movementHistory = [
      ...this.movementHistory.slice(-(this.historyLimit - 1)),
      movement
    ]
    
    this.notifyChange()
  }
  
  private updateButton(button: 'left' | 'middle' | 'right', pressed: boolean): void {
    this.buttons = {
      ...this.buttons,
      [button]: pressed
    }
    this.notifyChange()
  }
  
  private startDrag(element: TerminalElement | null): void {
    this.dragStartPosition = {
      x: this.position.x,
      y: this.position.y
    }
    this.draggedElement = element
    this.notifyChange()
  }
  
  private endDrag(): void {
    this.dragStartPosition = null
    this.draggedElement = null
    this.notifyChange()
  }
  
  private updateScroll(deltaX: number, deltaY: number): void {
    this.scrollDelta = { x: deltaX, y: deltaY }
    this.lastScrollTime = Date.now()
    
    setTimeout(() => {
      if (Date.now() - this.lastScrollTime >= 100) {
        this.scrollDelta = { x: 0, y: 0 }
        this.notifyChange()
      }
    }, 100)
    
    this.notifyChange()
  }
  
  private mapButton(button: string | number): 'left' | 'middle' | 'right' | null {
    if (button === 'left' || button === 0) return 'left'
    if (button === 'middle' || button === 1) return 'middle'
    if (button === 'right' || button === 2) return 'right'
    return null
  }
  
  private setupEventListeners(): void {
    globalEventBus.on('mousemove', (event: ReactiveEventData) => {
      if (event.data) {
        this.updatePosition(event.data.x, event.data.y)
      }
    })
    
    globalEventBus.on('mousedown', (event: ReactiveEventData) => {
      if (event.data) {
        const button = this.mapButton(event.data.button)
        if (button) {
          this.updateButton(button, true)
          
          if (button === 'left') {
            const element = this.getHoveredElement()
            this.startDrag(element)
          }
        }
      }
    })
    
    globalEventBus.on('mouseup', (event: ReactiveEventData) => {
      if (event.data) {
        const button = this.mapButton(event.data.button)
        if (button) {
          this.updateButton(button, false)
          
          if (button === 'left' && this.getDragState().isDragging) {
            this.endDrag()
          }
        }
      }
    })
    
    globalEventBus.on('wheel', (event: ReactiveEventData) => {
      if (event.data) {
        const deltaY = event.data.direction === 'down' ? 1 : -1
        this.updateScroll(0, deltaY)
      }
    })
    
    globalEventBus.on('mouse', (event: ReactiveEventData) => {
      if (event.data) {
        this.updatePosition(event.data.x, event.data.y)
        
        if (event.data.action === 'mousedown') {
          const button = this.mapButton(event.data.button)
          if (button) {
            this.updateButton(button, true)
            if (button === 'left') {
              const element = this.getHoveredElement()
              this.startDrag(element)
            }
          }
        } else if (event.data.action === 'mouseup') {
          const button = this.mapButton(event.data.button)
          if (button) {
            this.updateButton(button, false)
            if (button === 'left' && this.getDragState().isDragging) {
              this.endDrag()
            }
          }
        }
      }
    })
  }
  
  clearHistory(): void {
    this.movementHistory = []
    this.notifyChange()
  }
  
  reset(): void {
    this.position = { x: 0, y: 0, screenX: 0, screenY: 0 }
    this.buttons = { left: false, middle: false, right: false }
    this.movementHistory = []
    this.dragStartPosition = null
    this.draggedElement = null
    this.scrollDelta = { x: 0, y: 0 }
    this.lastScrollTime = 0
    this.notifyChange()
  }
}

/**
 * Global mouse state instance
 */
export const mouseState = new SimpleMouseState()

/**
 * Helper functions for easy use
 */
export function isMouseOver(element: TerminalElement): boolean {
  return mouseState.isOverElement(element)
}

export function getMouseRelativePosition(element: TerminalElement): { x: number, y: number } | null {
  return mouseState.getRelativePosition(element)
}