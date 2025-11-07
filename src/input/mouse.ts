// ============================================================================
// MOUSE SUPPORT FOR TERMINAL UI
// SGR Mouse Protocol implementation for accurate mouse tracking
// ============================================================================

// ============================================================================
// MOUSE EVENT TYPES
// ============================================================================

export interface MouseEvent {
  x: number // Terminal column (0-based)
  y: number // Terminal row (0-based)
  button: MouseButton
  action: MouseAction
  modifiers: MouseModifiers
}

export enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  WHEEL_UP = 64,
  WHEEL_DOWN = 65,
  NONE = -1,
}

export enum MouseAction {
  PRESS = 0,
  RELEASE = 1,
  MOVE = 2,
  DRAG = 3,
}

export interface MouseModifiers {
  shift: boolean
  ctrl: boolean
  alt: boolean
  meta: boolean
}

// ============================================================================
// HIT TESTING
// ============================================================================

export class HitGrid {
  private grid: Int16Array // -1 = empty, >= 0 = component index
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = new Int16Array(width * height).fill(-1)
  }

  /**
   * Set a component index at a position
   */
  set(x: number, y: number, componentIndex: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return
    this.grid[y * this.width + x] = componentIndex
  }

  /**
   * Get component index at a position
   */
  get(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1
    return this.grid[y * this.width + x] ?? -1
  }

  /**
   * Fill a rectangle with a component index
   */
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    componentIndex: number
  ): void {
    const x1 = Math.max(0, x)
    const y1 = Math.max(0, y)
    const x2 = Math.min(this.width, x + width)
    const y2 = Math.min(this.height, y + height)

    for (let row = y1; row < y2; row++) {
      const offset = row * this.width
      for (let col = x1; col < x2; col++) {
        this.grid[offset + col] = componentIndex
      }
    }
  }

  /**
   * Clear the grid
   */
  clear(): void {
    this.grid.fill(-1)
  }

  /**
   * Resize the grid
   */
  resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return

    const newGrid = new Int16Array(width * height).fill(-1)

    // Copy existing data if possible
    const copyWidth = Math.min(this.width, width)
    const copyHeight = Math.min(this.height, height)

    for (let y = 0; y < copyHeight; y++) {
      const oldOffset = y * this.width
      const newOffset = y * width
      for (let x = 0; x < copyWidth; x++) {
        newGrid[newOffset + x] = this.grid[oldOffset + x] ?? -1
      }
    }

    this.grid = newGrid
    this.width = width
    this.height = height
  }
}

// ============================================================================
// SGR MOUSE PROTOCOL
// ============================================================================

export class SGRMouseProtocol {
  private enabled = false
  private handlers = new Map<string, (event: MouseEvent) => void>()

  /**
   * Enable SGR mouse protocol
   * This sends the appropriate escape sequences to the terminal
   */
  enable(stream: NodeJS.WriteStream = process.stdout): void {
    if (this.enabled) return

    // Enable SGR extended mouse mode (1006)
    // Enable mouse button tracking (1002) - buttons and motion while pressed
    // Enable any-event mouse tracking (1003) - all mouse events including motion
    stream.write('\x1b[?1006h') // SGR mode
    stream.write('\x1b[?1002h') // Button tracking
    stream.write('\x1b[?1003h') // Any-event tracking

    this.enabled = true
  }

  /**
   * Disable SGR mouse protocol
   */
  disable(stream: NodeJS.WriteStream = process.stdout): void {
    if (!this.enabled) return

    stream.write('\x1b[?1006l') // Disable SGR mode
    stream.write('\x1b[?1002l') // Disable button tracking
    stream.write('\x1b[?1003l') // Disable any-event tracking

    this.enabled = false
  }

  /**
   * Parse SGR mouse sequence
   * Format: \x1b[<button>;<x>;<y>M (press) or m (release)
   */
  parseSequence(data: string): MouseEvent | null {
    // Match SGR mouse sequence
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/)
    if (!match) return null

    const [, buttonStr, xStr, yStr, actionChar] = match
    const buttonCode = parseInt(buttonStr!)
    const x = parseInt(xStr!) - 1 // Convert to 0-based
    const y = parseInt(yStr!) - 1 // Convert to 0-based

    // Parse button and modifiers from button code
    const button = this.parseButton(buttonCode)
    const modifiers = this.parseModifiers(buttonCode)

    // Determine action from the final character and button code
    let action: MouseAction
    if (actionChar === 'M') {
      action = buttonCode & 32 ? MouseAction.DRAG : MouseAction.PRESS
    } else {
      action = MouseAction.RELEASE
    }

    // Motion events have bit 32 set
    if (buttonCode & 32) {
      action = buttonCode & 3 ? MouseAction.DRAG : MouseAction.MOVE
    }

    return {
      x,
      y,
      button,
      action,
      modifiers,
    }
  }

  /**
   * Parse button from SGR button code
   */
  private parseButton(code: number): MouseButton {
    // Remove modifier and motion bits
    const buttonBits = code & 0b11000011 // Keep only button-relevant bits

    // Check for wheel events (bit 6 is set)
    if (buttonBits & 64) {
      return buttonBits & 1 ? MouseButton.WHEEL_DOWN : MouseButton.WHEEL_UP
    }

    // Regular buttons (0-2)
    const button = buttonBits & 3

    // Button 3 means release with unknown button
    if (button === 3) return MouseButton.NONE

    return button as MouseButton
  }

  /**
   * Parse modifiers from SGR button code
   */
  private parseModifiers(code: number): MouseModifiers {
    return {
      shift: !!(code & 4),
      alt: !!(code & 8),
      ctrl: !!(code & 16),
      meta: false, // SGR doesn't report meta key
    }
  }

  /**
   * Install input handler on a readable stream
   */
  installHandler(
    stream: NodeJS.ReadableStream = process.stdin,
    callback: (event: MouseEvent) => void
  ): () => void {
    const handler = (data: Buffer) => {
      const str = data.toString()
      const event = this.parseSequence(str)
      if (event) {
        callback(event)
      }
    }

    stream.on('data', handler)

    // Return cleanup function
    return () => {
      stream.removeListener('data', handler)
    }
  }
}

// ============================================================================
// MOUSE EVENT DISPATCHER
// ============================================================================

export type MouseEventHandler = (event: MouseEvent) => void | boolean

export interface MouseHandlers {
  onClick?: MouseEventHandler
  onMouseDown?: MouseEventHandler
  onMouseUp?: MouseEventHandler
  onMouseMove?: MouseEventHandler
  onMouseEnter?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
  onWheel?: MouseEventHandler
  onDrag?: MouseEventHandler
}

export class MouseEventDispatcher {
  private hitGrid: HitGrid
  private handlers: Map<number, MouseHandlers> = new Map()
  private hoveredComponent = -1
  private pressedComponent = -1
  private pressedButton = MouseButton.NONE

  constructor(width: number, height: number) {
    this.hitGrid = new HitGrid(width, height)
  }

  /**
   * Set handlers for a component
   */
  setHandlers(componentIndex: number, handlers: MouseHandlers): void {
    this.handlers.set(componentIndex, handlers)
  }

  /**
   * Remove handlers for a component
   */
  removeHandlers(componentIndex: number): void {
    this.handlers.delete(componentIndex)
  }

  /**
   * Update hit grid (call after rendering)
   */
  updateHitGrid(hitGrid: HitGrid): void {
    this.hitGrid = hitGrid
  }

  /**
   * Dispatch a mouse event
   * Returns true if event was handled
   */
  dispatch(event: MouseEvent): boolean {
    const componentIndex = this.hitGrid.get(event.x, event.y)

    // Handle hover enter/leave
    if (componentIndex !== this.hoveredComponent) {
      // Mouse leave previous component
      if (this.hoveredComponent >= 0) {
        const handlers = this.handlers.get(this.hoveredComponent)
        if (handlers?.onMouseLeave) {
          handlers.onMouseLeave(event)
        }
      }

      // Mouse enter new component
      if (componentIndex >= 0) {
        const handlers = this.handlers.get(componentIndex)
        if (handlers?.onMouseEnter) {
          handlers.onMouseEnter(event)
        }
      }

      this.hoveredComponent = componentIndex
    }

    // No component at this position
    if (componentIndex < 0) {
      // Reset pressed state if mouse released outside
      if (event.action === MouseAction.RELEASE) {
        this.pressedComponent = -1
        this.pressedButton = MouseButton.NONE
      }
      return false
    }

    const handlers = this.handlers.get(componentIndex)
    if (!handlers) return false

    let handled = false

    switch (event.action) {
      case MouseAction.PRESS:
        this.pressedComponent = componentIndex
        this.pressedButton = event.button

        if (handlers.onMouseDown) {
          handled = handlers.onMouseDown(event) ?? false
        }
        break

      case MouseAction.RELEASE:
        if (handlers.onMouseUp) {
          handled = handlers.onMouseUp(event) ?? false
        }

        // Fire click if released on same component that was pressed
        if (
          this.pressedComponent === componentIndex &&
          this.pressedButton === event.button &&
          handlers.onClick
        ) {
          handled = handlers.onClick(event) ?? handled
        }

        this.pressedComponent = -1
        this.pressedButton = MouseButton.NONE
        break

      case MouseAction.MOVE:
        if (handlers.onMouseMove) {
          handled = handlers.onMouseMove(event) ?? false
        }
        break

      case MouseAction.DRAG:
        if (handlers.onDrag) {
          handled = handlers.onDrag(event) ?? false
        }
        break
    }

    // Handle wheel events
    if (
      event.button === MouseButton.WHEEL_UP ||
      event.button === MouseButton.WHEEL_DOWN
    ) {
      if (handlers.onWheel) {
        handled = handlers.onWheel(event) ?? false
      }
    }

    return handled
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.handlers.clear()
    this.hoveredComponent = -1
    this.pressedComponent = -1
    this.pressedButton = MouseButton.NONE
    this.hitGrid.clear()
  }

  /**
   * Resize the hit grid
   */
  resize(width: number, height: number): void {
    this.hitGrid.resize(width, height)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  HitGrid,
  SGRMouseProtocol,
  MouseEventDispatcher,
  MouseButton,
  MouseAction,
}
