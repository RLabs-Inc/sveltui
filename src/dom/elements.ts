/**
 * Terminal Elements
 *
 * This module defines the terminal element interfaces that bridge
 * between the virtual DOM and blessed terminal elements.
 */

import type { Widgets } from 'blessed'
import type { NodeType } from './nodes'

/**
 * Base properties common to all terminal elements
 */
export interface BaseElementProps {
  /** Element position, left coordinate */
  left: number | string

  /** Element position, top coordinate */
  top: number | string

  /** Element position, right coordinate */
  right: number | string

  /** Element position, bottom coordinate */
  bottom: number | string

  /** Element width */
  width: number | string

  /** Element height */
  height: string | number

  /** Whether the element has a border */
  border?: Widgets.Border

  /** Border color */
  borderColor?: string

  /** Label for the element */
  label?: string

  /** Z-index for layering */
  zIndex?: number

  /** Whether the element is focusable */
  focusable?: boolean

  /** Whether the element is visible */
  hidden?: boolean

  /** Style properties for the element */
  style: {
    fg: string
    bg: string
    border: {
      fg: string
    }
    scrollbar: {
      bg: string
    }
    focus: {
      bg: string
    }
    hover: {
      bg: string
    }
  }

  // {
  //   /** Foreground color */

  //   fg: string

  //   /** Background color */
  //   bg: string

  //   /** Border foreground color */
  //   border: {
  //     fg: string
  //     bg: string
  //   }

  //   /** Label style */
  //   label: {
  //     fg: string
  //     bg: string
  //   }

  //   /** Whether the text is bold */
  //   bold?: boolean

  //   /** Whether the text is underlined */
  //   underline?: boolean

  //   /** Whether the text is blinking */
  //   blink?: boolean

  //   /** Whether the text is italic */
  //   italic?: boolean
  // }

  /** HTML tag name for the element */
  tags?: boolean

  /** Element content */
  content: string

  /** DOM node ID */
  _nodeId?: number

  /** Whether the element autofocuses */
  autofocus?: boolean

  /** Whether the element is scrollable */
  scrollable?: boolean

  /** Mouse events to capture */
  mouse?: boolean

  /** Additional blessed options */
  [key: string]: any
}

/**
 * Text element properties
 */
export interface TextElementProps extends BaseElementProps {
  /** Text content */
  content: string

  /** Whether the text is aligned */
  align?: 'left' | 'center' | 'right'

  /** Whether to enable text wrapping */
  wrap?: boolean

  /** Whether text is truncated if too long */
  truncate?: boolean | number
}

/**
 * Box element properties (container)
 */
export interface BoxElementProps extends BaseElementProps {
  /** Box title */
  title?: string

  /** Children elements */
  children?: TerminalElement[]
}

/**
 * List element properties
 */
export interface ListElementProps extends BaseElementProps {
  /** List items */
  items?: string[]

  /** Index of the selected item */
  selected?: number

  /** Whether the list is interactive */
  interactive?: boolean

  /** Whether keys wrap around at the beginning/end */
  keys?: boolean

  /** Whether vi keys are enabled */
  vi?: boolean

  /** Mouse support */
  mouse?: boolean

  /** Tag name for items */
  itemTag?: string

  /** Whether to select on focus */
  autoSelectOnFocus?: boolean
}

/**
 * Input element properties
 */
export interface InputElementProps extends BaseElementProps {
  /** Current input value */
  value?: string

  /** Placeholder text */
  placeholder?: string

  /** Whether input is hidden (password) */
  secret?: boolean

  /** Whether input is editable */
  disabled?: boolean

  /** Maximum input length */
  maxLength?: number
}

/**
 * Button element properties
 */
export interface ButtonElementProps extends BaseElementProps {
  /** Button text/label */
  content: string

  /** Whether button is disabled */
  disabled?: boolean

  /** Whether button is pressed */
  pressed?: boolean
}

/**
 * Progress bar element properties
 */
export interface ProgressBarElementProps extends BaseElementProps {
  /** Progress value (0-100) */
  value?: number

  /** Progress bar orientation */
  orientation?: 'horizontal' | 'vertical'

  /** Whether to fill the bar */
  filled?: boolean

  /** Style for filled portion */
  filledStyle?: {
    fg?: string
    bg?: string
  }
}

/**
 * Core interface for all terminal elements
 */
export interface TerminalElement {
  /** Element type */
  type: string

  /** Associated blessed element */
  blessed: Widgets.BlessedElement | null

  /** Element properties */
  props: BaseElementProps

  /** Parent element */
  parent: TerminalElement | null

  /** Child elements */
  children: TerminalElement[]

  /** Node type from virtual DOM */
  nodeType: NodeType
  
  /** Binding cleanup functions */
  _bindingCleanup?: Array<() => void>

  /**
   * Sets element properties
   * @param props - New properties
   */
  setProps(props: BaseElementProps): void

  /**
   * Appends a child element
   * @param child - Child element to append
   */
  appendChild(child: TerminalElement): void

  /**
   * Removes a child element
   * @param child - Child element to remove
   */
  removeChild(child: TerminalElement): void

  /**
   * Inserts a child element before another
   * @param child - Child to insert
   * @param beforeChild - Reference child
   */
  insertBefore(child: TerminalElement, beforeChild: TerminalElement): void

  /**
   * Creates the blessed element
   * @param parent - Parent blessed node
   */
  create(parent?: Widgets.Node): void

  /**
   * Updates the blessed element
   */
  update(): void

  /**
   * Destroys the element
   */
  destroy(): void
}

/**
 * Registry of element factories
 */
export const elementRegistry: Record<
  string,
  (props: BaseElementProps) => TerminalElement
> = {}

/**
 * Registers a new element type
 * @param type - Element type name
 * @param factory - Element factory function
 */
export function registerElement(
  type: string,
  factory: (props: BaseElementProps) => TerminalElement
): void {
  elementRegistry[type] = factory
}

/**
 * Creates a terminal element of the specified type
 * @param type - Element type
 * @param props - Element properties
 * @returns The created element
 */
export function createElement(
  type: string,
  props: BaseElementProps
): TerminalElement {
  const factory = elementRegistry[type]
  if (!factory) {
    throw new Error(`Unknown element type: ${type}`)
  }

  return factory(props)
}
