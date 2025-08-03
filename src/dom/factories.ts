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
import type { TerminalElementNode, TerminalTextNode } from './nodes'
import { calculateElementPosition } from './position-utils'
import { ReactiveTerminalElement } from './reactive-element'
import { createReactiveBridge } from './reactive-bridge'
import { isReactiveEnabled } from './config'

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
    // Fix border if it's been stringified
    if (props.border && typeof props.border === 'string' && props.border === '[object Object]') {
      props.border = { 
        type: 'line',
        ch: ' ',
        left: true,
        top: true,
        right: true,
        bottom: true
      }
    }
    
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
   * Calculates positioning using blessed-compatible algorithm
   * @param parent - Parent element for dimension calculations
   */
  protected calculatePositioning(parent?: Widgets.Node): {
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
    right?: number | string;
    bottom?: number | string;
  } {
    // Get content size if available (for shrink calculations)
    const contentSize = this.getContentSize?.();
    
    // Use our blessed-compatible positioning calculator
    return calculateElementPosition(
      {
        top: this.props.top,
        left: this.props.left,
        right: this.props.right,
        bottom: this.props.bottom,
        width: this.props.width,
        height: this.props.height
      },
      parent,
      contentSize
    );
  }

  /**
   * Override in subclasses to provide content size for shrink calculations
   */
  protected getContentSize?(): { width: number; height: number } | undefined;

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

    // Calculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(parent);

    // Handle border and style merging during creation
    let finalBorder = this.props.border as Widgets.Border;
    let finalStyle = this.props.style;

    // If style contains border properties, merge them into the main border
    if (this.props.style?.border && this.props.border) {
      // Merge border style with existing border structure
      const existingBorder = typeof this.props.border === 'object' ? this.props.border : { 
        type: 'line',
        ch: ' ',
        left: true,
        top: true,
        right: true,
        bottom: true
      };
      finalBorder = { ...existingBorder, ...this.props.style.border };
      
      // Remove border from style object to avoid conflicts
      const { border, ...styleWithoutBorder } = this.props.style;
      finalStyle = styleWithoutBorder;
    }

    // Create blessed box with calculated positions
    const boxOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: this.props.content || '',
      tags: this.props.tags,
      border: finalBorder,
      style: finalStyle,
      label: this.props.label,
      scrollable: this.props.scrollable,
      mouse: this.props.mouse,
      focusable: this.props.focusable !== false || this.props.focused !== undefined || this.props.onkeydown !== undefined,
      keys: true,
      input: true
    };
    
    this.blessed = blessed.box(boxOptions);
    
    // Auto-focus if focused prop is true
    if (this.props.focused && this.blessed) {
      setImmediate(() => {
        this.blessed?.focus()
      })
    }

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    if (!this.blessed) return

    const box = this.blessed as Widgets.BoxElement

    // Store current border configuration before updates
    const currentBorder = box.border
    
    // Recalculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(box.parent);

    // Update properties with calculated positions
    box.top = pos.top
    box.left = pos.left
    box.width = pos.width
    box.height = pos.height
    
    // Also update original props for blessed's internal handling
    box.right = pos.right !== undefined ? pos.right : this.props.right
    box.bottom = pos.bottom !== undefined ? pos.bottom : this.props.bottom

    if (this.props.content !== undefined) {
      box.setContent(this.props.content)
    }

    // Handle border before style to ensure it's preserved
    if (this.props.border !== undefined) {
      // Ensure border is an object, not a string
      if (typeof this.props.border === 'string' && this.props.border === '[object Object]') {
        // Default border with complete blessed.js specification
        box.border = { 
          type: 'line',
          ch: ' ',
          left: true,
          top: true,
          right: true,
          bottom: true
        }
      } else {
        box.border = this.props.border
      }
    } else if (currentBorder) {
      // Preserve existing border if no new border is specified
      box.border = currentBorder
    }

    if (this.props.style) {
      // If style contains border properties, merge with existing border
      if (this.props.style.border && box.border) {
        // Merge the border styling with the existing border structure
        box.border = { ...box.border, ...this.props.style.border }
        // Remove border from style object to avoid conflicts
        const { border, ...styleWithoutBorder } = this.props.style
        Object.assign(box.style, styleWithoutBorder)
      } else {
        Object.assign(box.style, this.props.style)
      }
    }

    // Ensure border is reapplied after all other updates
    if (box.border) {
      // Force border refresh by reassigning it
      const borderConfig = box.border
      box.border = borderConfig
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
  
  /**
   * Get content size for shrink calculations
   */
  protected getContentSize(): { width: number; height: number } | undefined {
    // Get content from props or child nodes
    let content = this.props.content || '';
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes)
        .filter(node => node.nodeType === 3)
        .map(node => (node as TerminalTextNode).nodeValue || '')
        .join('');
      if (textContent) {
        content = textContent;
      }
    }
    
    // Calculate dimensions based on content
    const lines = content.split('\n');
    const height = lines.length;
    const width = Math.max(...lines.map(line => line.length));
    
    return { width, height };
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for text element')
    }

    // Get content from props or from child text nodes
    let content = this.props.content || '';
    if (!content && this.domNode) {
      // Check for text content in child nodes
      const textContent = Array.from(this.domNode.childNodes)
        .filter(node => node.nodeType === 3) // Text nodes
        .map(node => (node as TerminalTextNode).nodeValue || '')
        .join('');
      if (textContent) {
        content = textContent;
      }
    }

    // Calculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(parent);
    
    // Create blessed text
    const blessedOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: content,
      tags: this.props.tags !== false,
      style: this.props.style && typeof this.props.style === 'object' ? this.props.style : { 
        fg: (this.props.style as any)?.fg || 'white', 
        bg: (this.props.style as any)?.bg || undefined,
        hover: {
          bg: undefined  // Disable hover background
        }
      },
      align: (this.props as TextElementProps).align,
      wrap: (this.props as TextElementProps).wrap,
      border: this.props.border,
      // Disable mouse interaction for text
      mouse: false,
    };
    
    this.blessed = blessed.text(blessedOptions);
    
    // Make sure the text element is visible
    this.blessed.show();

    // Don't create child elements for text elements
    // Text elements should only contain text content
  }

  update(): void {
    if (!this.blessed) return

    const text = this.blessed as Widgets.TextElement

    // Recalculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(text.parent);

    // Update properties with calculated positions
    text.top = pos.top
    text.left = pos.left
    text.width = pos.width
    text.height = pos.height
    
    // Also update original props for blessed's internal handling
    text.right = pos.right !== undefined ? pos.right : this.props.right
    text.bottom = pos.bottom !== undefined ? pos.bottom : this.props.bottom

    // Get content from props or from child text nodes
    let content = this.props.content;
    if (content === undefined && this.domNode) {
      // Check for text content in child nodes
      const textNodes = Array.from(this.domNode.childNodes)
        .filter(node => node.nodeType === 3); // Text nodes
      
      if (textNodes.length > 0) {
        const textContent = textNodes
          .map(node => (node as TerminalTextNode).nodeValue || '')
          .join('');
        content = textContent;
      }
    }

    if (content !== undefined) {
      text.setContent(content)
    }
    
    // Update style
    if (this.props.style && typeof this.props.style === 'object') {
      text.style = { ...text.style, ...this.props.style }
    }
    
    // Force screen render to show updated content
    const screen = text.screen || (this.blessed.parent && this.blessed.parent.screen);
    if (screen) {
      screen.render()
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

    // Calculate positioning
    const pos = this.calculatePositioning(parent);
    
    // Create blessed list
    this.blessed = blessed.list({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: this.props.right,
      bottom: this.props.bottom,
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

    // Recalculate positioning
    const pos = this.calculatePositioning(list.parent);
    
    // Update properties
    list.top = pos.top
    list.left = pos.left
    list.width = pos.width
    list.height = pos.height
    
    // Also update original props for blessed's internal handling
    list.right = this.props.right
    list.bottom = this.props.bottom

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

    // Calculate positioning
    const pos = this.calculatePositioning(parent);
    
    // Create blessed textbox
    this.blessed = blessed.textbox({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: this.props.right,
      bottom: this.props.bottom,
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

    // Recalculate positioning
    const pos = this.calculatePositioning(input.parent);
    
    // Update properties
    input.top = pos.top
    input.left = pos.left
    input.width = pos.width
    input.height = pos.height
    
    // Also update original props for blessed's internal handling
    input.right = this.props.right
    input.bottom = this.props.bottom

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

    // Calculate positioning
    const pos = this.calculatePositioning(parent);
    
    // Create blessed button
    this.blessed = blessed.button({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: this.props.right,
      bottom: this.props.bottom,
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

    // Recalculate positioning
    const pos = this.calculatePositioning(button.parent);
    
    // Update properties
    button.top = pos.top
    button.left = pos.left
    button.width = pos.width
    button.height = pos.height
    
    // Also update original props for blessed's internal handling
    button.right = this.props.right
    button.bottom = this.props.bottom

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

    // Calculate positioning
    const pos = this.calculatePositioning(parent);
    
    // Create blessed progress bar
    this.blessed = blessed.progressbar({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: this.props.right,
      bottom: this.props.bottom,
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

    // Recalculate positioning
    const pos = this.calculatePositioning(progress.parent);
    
    // Update properties
    progress.top = pos.top
    progress.left = pos.left
    progress.width = pos.width
    progress.height = pos.height
    
    // Also update original props for blessed's internal handling
    progress.right = this.props.right
    progress.bottom = this.props.bottom

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
 * Reactive Box element implementation
 */
export class ReactiveBoxElement extends ReactiveTerminalElement {
  constructor(props: BoxElementProps) {
    super('box', props)
  }
  
  /**
   * Get content size for shrink calculations
   */
  protected getContentSize(): { width: number; height: number } | undefined {
    // Box elements don't have intrinsic content size
    return undefined
  }
  
  /**
   * Calculates positioning using blessed-compatible algorithm
   * @param parent - Parent element for dimension calculations
   */
  protected calculatePositioning(parent?: Widgets.Node): {
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
    right?: number | string;
    bottom?: number | string;
  } {
    // Get content size if available (for shrink calculations)
    const contentSize = this.getContentSize?.();
    
    // Use our blessed-compatible positioning calculator
    return calculateElementPosition(
      {
        top: this.props.top,
        left: this.props.left,
        right: this.props.right,
        bottom: this.props.bottom,
        width: this.props.width,
        height: this.props.height
      },
      parent,
      contentSize
    );
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for box element')
    }

    // Calculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(parent);

    // Handle border and style merging during creation
    let finalBorder = this.props.border as Widgets.Border;
    let finalStyle = this.props.style;

    // If style contains border properties, merge them into the main border
    if (this.props.style?.border && this.props.border) {
      // Merge border style with existing border structure
      const existingBorder = typeof this.props.border === 'object' ? this.props.border : { 
        type: 'line',
        ch: ' ',
        left: true,
        top: true,
        right: true,
        bottom: true
      };
      finalBorder = { ...existingBorder, ...this.props.style.border };
      
      // Remove border from style object to avoid conflicts
      const { border, ...styleWithoutBorder } = this.props.style;
      finalStyle = styleWithoutBorder;
    }

    // Create blessed box with calculated positions
    const boxOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: this.props.content || '',
      tags: this.props.tags,
      border: finalBorder,
      style: finalStyle,
      label: this.props.label,
      scrollable: this.props.scrollable,
      mouse: this.props.mouse,
      focusable: this.props.focusable !== false || this.props.focused !== undefined || this.props.onkeydown !== undefined,
      keys: true,
      input: true
    };
    
    this.blessed = blessed.box(boxOptions);
    
    // Auto-focus if focused prop is true
    if (this.props.focused && this.blessed) {
      setImmediate(() => {
        this.blessed?.focus()
      })
    }

    // Create children
    for (const child of this.children) {
      child.create(this.blessed)
    }
  }

  update(): void {
    // Reactive updates are handled by effects in ReactiveTerminalElement
    // This method is kept for compatibility
    if (!this.blessed) return
    super.update()
  }
}

/**
 * Reactive Text element implementation
 */
export class ReactiveTextElement extends ReactiveTerminalElement {
  constructor(props: TextElementProps) {
    super('text', props)
  }
  
  /**
   * Calculates positioning using blessed-compatible algorithm
   * @param parent - Parent element for dimension calculations
   */
  protected calculatePositioning(parent?: Widgets.Node): {
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
    right?: number | string;
    bottom?: number | string;
  } {
    // Get content size if available (for shrink calculations)
    const contentSize = this.getContentSize?.();
    
    // Use our blessed-compatible positioning calculator
    return calculateElementPosition(
      {
        top: this.props.top,
        left: this.props.left,
        right: this.props.right,
        bottom: this.props.bottom,
        width: this.props.width,
        height: this.props.height
      },
      parent,
      contentSize
    );
  }
  
  /**
   * Get content size for shrink calculations
   */
  protected getContentSize(): { width: number; height: number } | undefined {
    // Get content from props or child nodes
    let content = this.props.content || '';
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes)
        .filter(node => node.nodeType === 3)
        .map(node => (node as TerminalTextNode).nodeValue || '')
        .join('');
      if (textContent) {
        content = textContent;
      }
    }
    
    // Calculate dimensions based on content
    const lines = content.split('\n');
    const height = lines.length;
    const width = Math.max(...lines.map(line => line.length));
    
    return { width, height };
  }

  create(parent?: Widgets.Node): void {
    if (!parent) {
      throw new Error('Parent is required for text element')
    }

    // Get content from props or from child text nodes
    let content = this.props.content || '';
    if (!content && this.domNode) {
      // Check for text content in child nodes
      const textContent = Array.from(this.domNode.childNodes)
        .filter(node => node.nodeType === 3) // Text nodes
        .map(node => (node as TerminalTextNode).nodeValue || '')
        .join('');
      if (textContent) {
        content = textContent;
      }
    }
    
    // Calculate positioning with blessed-compatible algorithm
    const pos = this.calculatePositioning(parent);
    
    // Create blessed text
    const blessedOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      // Also pass original props for blessed's internal handling
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: content,
      tags: this.props.tags !== false,
      style: this.props.style && typeof this.props.style === 'object' ? this.props.style : { 
        fg: (this.props.style as any)?.fg || 'white', 
        bg: (this.props.style as any)?.bg || undefined,
        hover: {
          bg: undefined  // Disable hover background
        }
      },
      align: (this.props as TextElementProps).align,
      wrap: (this.props as TextElementProps).wrap,
      border: this.props.border,
      // Disable mouse interaction for text
      mouse: false,
    };
    
    this.blessed = blessed.text(blessedOptions);
    
    // Make sure the text element is visible
    this.blessed.show();

    // Don't create child elements for text elements
    // Text elements should only contain text content
  }

  update(): void {
    // Reactive updates are handled by effects in ReactiveTerminalElement
    // This method is kept for compatibility
    if (!this.blessed) return
    super.update()
  }
}

/**
 * Factory functions for creating terminal elements
 */
export const factories = {
  box: (props: BoxElementProps) => new BoxElement(props),
  text: (props: TextElementProps) => new TextElement(props),
  ttext: (props: TextElementProps) => new TextElement(props), // Alias for text to avoid SVG issues
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
 * Reactive factory functions for creating reactive terminal elements
 */
export const reactiveFactories = {
  box: (props: BoxElementProps) => new ReactiveBoxElement(props),
  text: (props: TextElementProps) => new ReactiveTextElement(props),
  ttext: (props: TextElementProps) => new ReactiveTextElement(props), // Alias for text to avoid SVG issues
  list: (props: ListElementProps) => new ReactiveTerminalElement('list', props), // Using base reactive for now
  input: (props: InputElementProps) => new ReactiveTerminalElement('input', props), // Using base reactive for now
  button: (props: ButtonElementProps) => new ReactiveTerminalElement('button', props), // Using base reactive for now
  progress: (props: ProgressBarElementProps) => new ReactiveTerminalElement('progress', props), // Using base reactive for now
  // Add fallback for div and other common HTML elements to map to box
  div: (props: BoxElementProps) => new ReactiveBoxElement(props),
  span: (props: TextElementProps) => new ReactiveTextElement(props),
  p: (props: TextElementProps) => new ReactiveTextElement(props),
}

/**
 * Creates a terminal element
 * @param type - Element type
 * @param props - Element properties
 * @param domNode - Optional DOM node to attach to
 * @param options - Creation options
 * @returns The created element
 */
export function createElement(
  type: string,
  props: BaseElementProps,
  domNode?: TerminalElementNode,
  options?: { reactive?: boolean }
): TerminalElement {
  // Normalize type to lowercase for consistency
  const normalizedType = type.toLowerCase()

  // Choose factory based on reactive option or global config
  const useReactive = options?.reactive ?? isReactiveEnabled()
  const factoryMap = useReactive ? reactiveFactories : factories

  // Try to get factory for the exact type
  let factory = factoryMap[normalizedType as keyof typeof factoryMap]

  // If no factory found, fallback to box for container elements
  // or text for inline elements
  if (!factory) {
    console.warn(`Unknown element type: ${type}, falling back to div`)
    factory = factoryMap.div
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
  
  // Also register reactive factories with a prefix
  for (const [type, factory] of Object.entries(reactiveFactories)) {
    registerElement(`reactive-${type}`, factory)
  }
}

/**
 * Helper to create a reactive element directly
 */
export function createReactiveElement(
  type: string,
  props: BaseElementProps,
  domNode?: TerminalElementNode
): TerminalElement {
  return createElement(type, props, domNode, { reactive: true })
}
