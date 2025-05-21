/**
 * Terminal Element Factories
 *
 * This module provides factory functions for creating terminal elements
 * that connect our virtual DOM to blessed elements.
 */

import blessed from 'blessed'
import type { Widgets } from 'blessed'
import { NodeType } from './nodes'
import type {
  TerminalElement,
  BaseElementProps,
  BoxElementProps,
  TextElementProps,
  ListElementProps,
  InputElementProps,
  ButtonElementProps,
  ProgressBarElementProps,
} from './elements'
import { registerElement } from './elements'
import type { TerminalElementNode } from './nodes'

/**
 * Base terminal element implementation
 */
export class BaseTerminalElement implements TerminalElement {
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
   * Creates a new base terminal element
   * @param type - Element type
   * @param props - Element properties
   */
  constructor(type: string, props: BaseElementProps) {
    this.type = type
    this.props = { ...props }
  }

  /**
   * Sets element properties
   * @param props - New properties
   */
  setProps(props: BaseElementProps): void {
    this.props = { ...this.props, ...props }
    if (this.blessed) {
      this.update()
    }
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
    // This will be implemented by subclasses
    throw new Error('Method not implemented.')
  }

  /**
   * Updates the blessed element
   */
  update(): void {
    // This will be implemented by subclasses
    throw new Error('Method not implemented.')
  }

  /**
   * Destroys the element
   */
  destroy(): void {
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
}

/**
 * Box element implementation
 */
export class BoxElement extends BaseTerminalElement {
  constructor(props: BoxElementProps) {
    super('box', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for box element')
    }

    // Create blessed box
    this.blessed = blessed.box({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      content: this.props.content || '',
      tags: this.props.tags,
      border: this.props.border as Widgets.Border,
      style: this.props.style,
      label: this.props.label,
      scrollable: this.props.scrollable,
      mouse: this.props.mouse,
      focusable: this.props.focusable !== false,
    })

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const box = this.blessed as Widgets.BoxElement

    // Update properties
    box.top = this.props.top
    box.left = this.props.left
    box.right = this.props.right
    box.bottom = this.props.bottom
    box.width = this.props.width
    box.height = this.props.height

    if (this.props.content !== undefined) {
      box.setContent(this.props.content)
    }

    if (this.props.style) {
      Object.assign(box.style, this.props.style)
    }

    if (this.props.border !== undefined) {
      box.border = this.props.border
    }

    if (this.props.label !== undefined) {
      box.setLabel(this.props.label)
    }

    if (this.props.hidden) {
      box.hide()
    } else {
      box.show()
    }

    // Update screen
    if (box.screen) {
      box.screen.render()
    }
  }
}

/**
 * Text element implementation
 */
export class TextElement extends BaseTerminalElement {
  constructor(props: TextElementProps) {
    super('text', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for text element')
    }

    // Create blessed text
    this.blessed = blessed.text({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      content: this.props.content || '',
      tags: this.props.tags,
      style: this.props.style,
      align: (this.props as TextElementProps).align,
      wrap: (this.props as TextElementProps).wrap,
      border: this.props.border,
    })

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const text = this.blessed as Widgets.TextElement

    // Update properties
    text.top = this.props.top
    text.left = this.props.left
    text.right = this.props.right
    text.bottom = this.props.bottom
    text.width = this.props.width
    text.height = this.props.height

    if (this.props.content !== undefined) {
      text.setContent(this.props.content)
    }

    if (this.props.style) {
      Object.assign(text.style, this.props.style)
    }

    if (this.props.hidden) {
      text.hide()
    } else {
      text.show()
    }

    // Update screen
    if (text.screen) {
      text.screen.render()
    }
  }
}

/**
 * List element implementation
 */
export class ListElement extends BaseTerminalElement {
  constructor(props: ListElementProps) {
    super('list', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for list element')
    }

    const listProps = this.props as ListElementProps

    // Create blessed list
    this.blessed = blessed.list({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      items: listProps.items || [],
      tags: this.props.tags,
      style: this.props.style,
      border: this.props.border,
      mouse: listProps.mouse !== false,
      keys: listProps.keys !== false,
      vi: listProps.vi,
    })

    // Set selected item
    if (listProps.selected !== undefined && this.blessed.data.selected) {
      this.blessed.data.select(listProps.selected)
    }

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const list = this.blessed as Widgets.ListElement
    const listProps = this.props as ListElementProps

    // Update properties
    list.top = this.props.top
    list.left = this.props.left
    list.right = this.props.right
    list.bottom = this.props.bottom
    list.width = this.props.width
    list.height = this.props.height

    if (listProps.items) {
      list.setItems(listProps.items)
    }

    if (listProps.selected !== undefined) {
      list.select(listProps.selected)
    }

    if (this.props.style) {
      Object.assign(list.style, this.props.style)
    }

    if (this.props.border !== undefined) {
      list.border = this.props.border
    }

    if (this.props.hidden) {
      list.hide()
    } else {
      list.show()
    }

    // Update screen
    if (list.screen) {
      list.screen.render()
    }
  }
}

/**
 * Input element implementation
 */
export class InputElement extends BaseTerminalElement {
  constructor(props: InputElementProps) {
    super('input', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for input element')
    }

    const inputProps = this.props as InputElementProps

    // Create blessed textbox
    this.blessed = blessed.textbox({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      value: inputProps.value || '',
      style: this.props.style,
      border: this.props.border,
      inputOnFocus: true,
      mouse: this.props.mouse,
      keys: true,
      focusable: this.props.focusable !== false,
    })

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const input = this.blessed as Widgets.TextboxElement
    const inputProps = this.props as InputElementProps

    // Update properties
    input.top = this.props.top
    input.left = this.props.left
    input.right = this.props.right
    input.bottom = this.props.bottom
    input.width = this.props.width
    input.height = this.props.height

    if (inputProps.value !== undefined) {
      input.setValue(inputProps.value)
    }

    if (this.props.style) {
      Object.assign(input.style, this.props.style)
    }

    if (this.props.border !== undefined) {
      input.border = this.props.border
    }

    if (this.props.hidden) {
      input.hide()
    } else {
      input.show()
    }

    // Update screen
    if (input.screen) {
      input.screen.render()
    }
  }
}

/**
 * Button element implementation
 */
export class ButtonElement extends BaseTerminalElement {
  constructor(props: ButtonElementProps) {
    super('button', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for button element')
    }

    // Create blessed button
    this.blessed = blessed.button({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      content: this.props.content || '',
      tags: this.props.tags,
      style: this.props.style,
      border: this.props.border,
      mouse: this.props.mouse !== false,
      keys: true,
      focusable: this.props.focusable !== false,
    })

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const button = this.blessed as Widgets.ButtonElement

    // Update properties
    button.top = this.props.top
    button.left = this.props.left
    button.right = this.props.right
    button.bottom = this.props.bottom
    button.width = this.props.width
    button.height = this.props.height

    if (this.props.content !== undefined) {
      button.setContent(this.props.content)
    }

    if (this.props.style) {
      Object.assign(button.style, this.props.style)
    }

    if (this.props.border !== undefined) {
      button.border = this.props.border
    }

    if (this.props.hidden) {
      button.hide()
    } else {
      button.show()
    }

    // Update screen
    if (button.screen) {
      button.screen.render()
    }
  }
}

/**
 * Progress bar element implementation
 */
export class ProgressBarElement extends BaseTerminalElement {
  constructor(props: ProgressBarElementProps) {
    super('progress', props)
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for progress element')
    }

    const progressProps = this.props as ProgressBarElementProps

    // Create blessed progress bar
    this.blessed = blessed.progressbar({
      parent,
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height,
      orientation: progressProps.orientation || 'horizontal',
      style: this.props.style,
      border: this.props.border,
      filled: progressProps.value || 0,
      pch: ' ',
    })

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const progress = this.blessed as Widgets.ProgressBarElement
    const progressProps = this.props as ProgressBarElementProps

    // Update properties
    progress.top = this.props.top
    progress.left = this.props.left
    progress.right = this.props.right
    progress.bottom = this.props.bottom
    progress.width = this.props.width
    progress.height = this.props.height

    if (progressProps.value !== undefined) {
      progress.setProgress(progressProps.value)
    }

    if (this.props.style) {
      Object.assign(progress.style, this.props.style)
    }

    if (this.props.border !== undefined) {
      progress.border = this.props.border
    }

    if (this.props.hidden) {
      progress.hide()
    } else {
      progress.show()
    }

    // Update screen
    if (progress.screen) {
      progress.screen.render()
    }
  }
}

/**
 * Factory functions for creating terminal elements
 */
export const factories = {
  box: (props: BoxElementProps) => new BoxElement(props),
  text: (props: TextElementProps) => new TextElement(props),
  list: (props: ListElementProps) => new ListElement(props),
  input: (props: InputElementProps) => new InputElement(props),
  button: (props: ButtonElementProps) => new ButtonElement(props),
  progress: (props: ProgressBarElementProps) => new ProgressBarElement(props),
  // Add fallback for div and other common HTML elements to map to box
  div: (props: BoxElementProps) => new BoxElement(props),
  span: (props: TextElementProps) => new TextElement(props),
  p: (props: TextElementProps) => new TextElement(props),
}

/**
 * Creates a terminal element
 * @param type - Element type
 * @param props - Element properties
 * @param domNode - Optional DOM node to attach to
 * @returns The created element
 */
export function createElement(
  type: string,
  props: BaseElementProps,
  domNode?: TerminalElementNode
): TerminalElement {
  // Normalize type to lowercase for consistency
  const normalizedType = type.toLowerCase()

  // Try to get factory for the exact type
  let factory = factories[normalizedType as keyof typeof factories]

  // If no factory found, fallback to box for container elements
  // or text for inline elements
  if (!factory) {
    console.warn(`Unknown element type: ${type}, falling back to div`)
    factory = factories.div
  }

  // Create the terminal element
  const element = factory(props as TextElementProps)

  // If domNode is provided, attach it
  if (domNode) {
    element.attachToNode(domNode)
  }

  return element
}

/**
 * Register element factories with the registry
 */
export function registerElementFactories(): void {
  // Register all factories with the element registry
  for (const [type, factory] of Object.entries(factories)) {
    registerElement(type, factory)
  }
}
