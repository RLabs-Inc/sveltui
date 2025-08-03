/**
 * Virtual Terminal DOM Document
 *
 * This module implements the document object that serves as the root
 * of the virtual DOM tree for terminal rendering.
 *
 * This provides a clean, DOM-like API for Svelte 5's mount function.
 */

import type {
  TerminalNode,
  TerminalElementNode,
  TerminalTextNode,
  TerminalDocumentNode,
} from './nodes'
import { NodeType, generateNodeId } from './nodes'
// Import types only to avoid circular dependencies
import type { TerminalElement, BaseElementProps } from './elements'
import { safeSetProperty, updateNodeRelationships, ensureNodeProperties } from './node-utils'

/**
 * Implementation of the terminal document node
 */
export class TerminalDocument implements TerminalDocumentNode {
  nodeType = NodeType.DOCUMENT
  nodeName = '#document'
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }
  
  // DOM compatibility properties
  body: TerminalElementNode
  head: TerminalElementNode
  documentElement: TerminalElementNode

  constructor() {
    // Create the basic DOM structure
    this.documentElement = this.createElement('html')
    this.head = this.createElement('head')
    this.body = this.createElement('body')
    
    this.documentElement.appendChild(this.head)
    this.documentElement.appendChild(this.body)
    this.appendChild(this.documentElement)
  }

  /**
   * Adds an event listener (DOM Level 2)
   */
  addEventListener(event: string, handler: Function, options?: any): void {
    // Handle document-level events for Svelte
  }

  /**
   * Removes an event listener (DOM Level 2)
   */
  removeEventListener(event: string, handler: Function): void {
    // Handle event removal
  }

  /**
   * Creates a new element node
   * @param tagName - Element tag name
   * @returns The created element node
   */
  createElement(tagName: string): TerminalElementNode {
    // Special handling for template elements
    if (tagName.toLowerCase() === 'template') {
      return new TerminalTemplateElement(tagName, this)
    }
    return new TerminalElement(tagName, this)
  }

  /**
   * Creates a new text node
   * @param text - Text content
   * @returns The created text node
   */
  createTextNode(text: string): TerminalTextNode {
    return new TerminalText(text, this)
  }

  /**
   * Creates a new comment node
   * @param text - Comment text
   * @returns The created comment node
   */
  createComment(text: string): TerminalNode {
    return new TerminalComment(text, this)
  }

  /**
   * Creates a document fragment
   * @returns The created document fragment
   */
  createDocumentFragment(): TerminalNode {
    return new TerminalDocumentFragment(this)
  }

  /**
   * Creates a Range object (for HTML parsing compatibility)
   * @returns A mock range object
   */
  createRange(): any {
    const self = this
    return {
      selectNodeContents: () => {},
      extractContents: () => this.createDocumentFragment(),
      createContextualFragment: (html: string) => {
        const fragment = this.createDocumentFragment()
        
        if (!html) {
          return fragment
        }
        
        // Debug log for HTML parsing
        if ((globalThis as any).SVELTUI_DEBUG) {
          console.log('[TerminalDocument] Parsing HTML:', html.substring(0, 100) + '...')
        }
        
        // Simple HTML parser for Svelte's needs
        // This handles the most common patterns Svelte generates
        let remaining = html
        let currentParent: TerminalNode = fragment
        const elementStack: TerminalNode[] = []
        
        while (remaining) {
          // Check for comment
          if (remaining.startsWith('<!>')) {
            const comment = this.createComment('')
            currentParent.appendChild(comment)
            remaining = remaining.substring(3)
            continue
          }
          
          // Check for closing tag
          const closeMatch = remaining.match(/^<\/(\w+)>/)
          if (closeMatch) {
            elementStack.pop()
            currentParent = elementStack[elementStack.length - 1] || fragment
            remaining = remaining.substring(closeMatch[0].length)
            continue
          }
          
          // Check for opening tag - also handle <br> and <br/>
          const openMatch = remaining.match(/^<(\w+)([^>]*)>/)
          if (openMatch) {
            const tagName = openMatch[1]
            const element = this.createElement(tagName)
            
            // Parse attributes (simplified)
            const attrString = openMatch[2]
            if (attrString) {
              const attrRegex = /(\w+)(?:="([^"]*)")?/g
              let attrMatch
              while ((attrMatch = attrRegex.exec(attrString))) {
                element.setAttribute(attrMatch[1], attrMatch[2] || '')
              }
            }
            
            currentParent.appendChild(element)
            
            // Check if self-closing or void element (br, img, input, etc.)
            const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link']
            if (!attrString.endsWith('/') && !voidElements.includes(tagName.toLowerCase())) {
              elementStack.push(currentParent)
              currentParent = element
            }
            
            remaining = remaining.substring(openMatch[0].length)
            continue
          }
          
          // Text content
          const textMatch = remaining.match(/^([^<]+)/)
          if (textMatch) {
            const text = textMatch[1]
            // Always create text nodes, even for whitespace-only content
            // Svelte needs these for proper template handling
            const textNode = this.createTextNode(text)
            currentParent.appendChild(textNode)
            remaining = remaining.substring(text.length)
            continue
          }
          
          // If we can't parse anything, break to avoid infinite loop
          break
        }
        
        // Debug log the created structure
        if ((globalThis as any).SVELTUI_DEBUG) {
          console.log('[TerminalDocument] Fragment children:', fragment.childNodes.length)
        }
        
        return fragment
      }
    }
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // Ensure child has all required properties
    ensureNodeProperties(child)
    
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child)
    }

    this.childNodes.push(child)

    // Update child node using safe property setter
    updateNodeRelationships(this, child, this.lastChild, null)

    // Update first/last child pointers
    if (!this.firstChild) {
      this.firstChild = child
    }
    this.lastChild = child

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Ensure nodes have all required properties
    ensureNodeProperties(node)
    ensureNodeProperties(refNode)
    
    // Update node references using safe property setter
    const prevSibling = refNode.previousSibling
    updateNodeRelationships(this, node, prevSibling, refNode)
    
    // Update first child pointer if needed
    if (!prevSibling) {
      this.firstChild = node
    }

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }

    // Clear references on the removed child using safe property setter
    safeSetProperty(child, 'parentNode', null)
    safeSetProperty(child, 'previousSibling', null)
    safeSetProperty(child, 'nextSibling', null)

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild)
    }

    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalDocument()

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Implementation of a terminal template element node
 */
export class TerminalTemplateElement implements TerminalElementNode {
  nodeType = NodeType.ELEMENT
  nodeName: string
  tagName: string
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  attributes: Record<string, any> = {}
  _instanceId = generateNodeId()
  _terminalElement: TerminalElement
  content: TerminalDocumentFragment
  _document: TerminalDocumentNode
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }
  
  // Style property for Svelte compatibility
  style: {
    cssText: string
    [key: string]: any
  }
  
  // Svelte internal style cache
  __style?: any

  /**
   * Creates a new terminal template element node
   * @param tagName - Element tag name
   * @param document - The owner document
   */
  constructor(tagName: string, document: TerminalDocumentNode) {
    this.tagName = tagName.toLowerCase()
    this.nodeName = this.tagName
    this.content = new TerminalDocumentFragment(document)
    this._terminalElement = null as any
    this._document = document
    
    // Initialize style object for Svelte compatibility
    this.style = {
      cssText: '',
      display: '',
      visibility: '',
      opacity: ''
    }
    
    // Make cssText a getter/setter
    Object.defineProperty(this.style, 'cssText', {
      get: () => {
        const styles: string[] = []
        for (const [key, value] of Object.entries(this.style)) {
          if (key !== 'cssText' && value) {
            const cssKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
            styles.push(`${cssKey}: ${value}`)
          }
        }
        return styles.join('; ')
      },
      set: (value: string) => {
        if (!value) {
          for (const key in this.style) {
            if (key !== 'cssText') {
              this.style[key] = ''
            }
          }
          return
        }
        
        const declarations = value.split(';').map(s => s.trim()).filter(Boolean)
        for (const declaration of declarations) {
          const [prop, val] = declaration.split(':').map(s => s.trim())
          if (prop && val) {
            const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
            this.style[camelProp] = val
          }
        }
      },
      enumerable: true,
      configurable: true
    })
  }

  /**
   * innerHTML setter for template elements
   * Parses the HTML and populates the content fragment
   */
  set innerHTML(html: string) {
    // Clear existing content
    this.content = new TerminalDocumentFragment(this._document)
    
    if (!html) {
      return
    }

    // Use the createRange approach for better HTML parsing
    if (this._document.createRange) {
      const range = this._document.createRange()
      const fragment = range.createContextualFragment(html)
      
      // Move all nodes from the fragment to the template content
      while (fragment.firstChild) {
        this.content.appendChild(fragment.firstChild)
      }
    } else {
      // Fallback to simple parsing
      const trimmed = html.trim()
      if (trimmed.startsWith('<!>')) {
        const comment = this._document.createComment('')
        this.content.appendChild(comment)
      } else if (trimmed.startsWith('<')) {
        const tagMatch = trimmed.match(/<(\w+)/)
        if (tagMatch) {
          const element = this._document.createElement(tagMatch[1])
          this.content.appendChild(element)
        }
      } else {
        const textNode = this._document.createTextNode(trimmed)
        this.content.appendChild(textNode)
      }
    }
  }

  /**
   * innerHTML getter
   */
  get innerHTML(): string {
    // Return empty string for now - not critical for Svelte operation
    return ''
  }

  // Standard DOM methods
  setAttribute(name: string, value: any): void {
    this.attributes[name] = value
  }

  getAttribute(name: string): any {
    return this.attributes[name] ?? null
  }

  removeAttribute(name: string): void {
    delete this.attributes[name]
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes
  }

  appendChild(child: TerminalNode): TerminalNode {
    return this.content.appendChild(child)
  }

  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    return this.content.insertBefore(node, refNode)
  }

  removeChild(child: TerminalNode): TerminalNode {
    return this.content.removeChild(child)
  }

  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    return this.content.replaceChild(newChild, oldChild)
  }

  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  }

  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalTemplateElement(this.tagName, {} as TerminalDocumentNode)
    
    // Copy attributes
    for (const [name, value] of Object.entries(this.attributes)) {
      clone.setAttribute(name, value)
    }

    if (deep) {
      clone.content = this.content.cloneNode(true) as TerminalDocumentFragment
    }

    return clone
  }
}

/**
 * Implementation of a terminal element node
 */
export class TerminalElement implements TerminalElementNode {
  nodeType = NodeType.ELEMENT
  nodeName: string
  tagName: string
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  attributes: Record<string, any> = {}
  _instanceId = generateNodeId()
  _terminalElement: TerminalElement
  _eventListeners?: Record<string, Array<{ handler: Function; options?: any }>>
  _document: TerminalDocumentNode
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }
  
  // Style property for Svelte compatibility
  style: {
    cssText: string
    [key: string]: any
  }
  
  // Svelte internal style cache
  __style?: any

  /**
   * Creates a new terminal element node
   * @param tagName - Element tag name
   * @param document - The owner document
   */
  constructor(tagName: string, document: TerminalDocumentNode) {
    this.tagName = tagName.toLowerCase()
    this.nodeName = this.tagName
    this._document = document

    // Initialize with null - the terminal element will be created later
    // by the reconciler through the factory system
    this._terminalElement = null as any
    
    // Initialize style object with proxy for Svelte compatibility
    const styleTarget = {
      cssText: '',
      // Common style properties that might be accessed
      display: '',
      visibility: '',
      opacity: '',
      color: '',
      backgroundColor: '',
      width: '',
      height: '',
      position: '',
      top: '',
      left: '',
      right: '',
      bottom: '',
      margin: '',
      padding: '',
      border: '',
      fontSize: '',
      fontFamily: '',
      fontWeight: '',
      textAlign: '',
      lineHeight: '',
      zIndex: ''
    }
    
    // Create a proxy to intercept style changes
    this.style = new Proxy(styleTarget, {
      set: (target, prop, value) => {
        target[prop as string] = value
        
        // When style properties change, update the terminal element
        if (prop !== 'cssText' && this._terminalElement && this._terminalElement !== this) {
          // Convert CSS styles to blessed format
          const blessedStyle = this.convertStylesToBlessed()
          if (typeof this._terminalElement.setProps === 'function') {
            this._terminalElement.setProps({
              ...this._terminalElement.props,
              style: blessedStyle
            })
            this._terminalElement.update()
          }
        }
        
        return true
      }
    })
    
    // Make cssText a getter/setter that updates individual properties
    Object.defineProperty(this.style, 'cssText', {
      get: () => {
        // Convert style properties back to CSS text
        const styles: string[] = []
        for (const [key, value] of Object.entries(this.style)) {
          if (key !== 'cssText' && value) {
            const cssKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
            styles.push(`${cssKey}: ${value}`)
          }
        }
        return styles.join('; ')
      },
      set: (value: string) => {
        // Parse CSS text and update individual properties
        if (!value) {
          // Clear all properties
          for (const key in this.style) {
            if (key !== 'cssText') {
              this.style[key] = ''
            }
          }
          return
        }
        
        const declarations = value.split(';').map(s => s.trim()).filter(Boolean)
        for (const declaration of declarations) {
          const [prop, val] = declaration.split(':').map(s => s.trim())
          if (prop && val) {
            const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
            this.style[camelProp] = val
          }
        }
      },
      enumerable: true,
      configurable: true
    })
  }

  /**
   * Sets an attribute value
   * @param name - Attribute name
   * @param value - Attribute value
   */
  setAttribute(name: string, value: any): void {
    this.attributes[name] = value

    // If we have a terminal element already, update it
    if (this._terminalElement && this._terminalElement !== this) {
      // Convert attribute names (e.g., class-name to className)
      const propName = name.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      )
      if (typeof this._terminalElement.setProps === 'function') {
        const props = { ...this._terminalElement.props }
        props[propName] = value
        this._terminalElement.setProps(props)
        this._terminalElement.update()
      }
    }
  }

  /**
   * Gets an attribute value
   * @param name - Attribute name
   * @returns The attribute value or null if not present
   */
  getAttribute(name: string): any {
    return this.attributes[name] ?? null
  }

  /**
   * Removes an attribute
   * @param name - Attribute name
   */
  removeAttribute(name: string): void {
    delete this.attributes[name]

    // If we have a terminal element already, update it
    if (this._terminalElement && this._terminalElement !== this) {
      if (typeof this._terminalElement.setProps === 'function') {
        const props = { ...this._terminalElement.props }
        delete props[name]
        this._terminalElement.setProps(props)
        this._terminalElement.update()
      }
    }
  }

  /**
   * Checks if an attribute exists
   * @param name - Attribute name
   * @returns Whether the attribute exists
   */
  hasAttribute(name: string): boolean {
    return name in this.attributes
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // Ensure child has all required properties
    ensureNodeProperties(child)
    
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child)
    }

    this.childNodes.push(child)

    // Update child node using safe property setter
    updateNodeRelationships(this, child, this.lastChild, null)

    // Update first/last child pointers
    if (!this.firstChild) {
      this.firstChild = child
    }
    this.lastChild = child

    // If this element has a terminal element and the child is an element node,
    // we need to connect it to the terminal
    if (
      this._terminalElement &&
      this._terminalElement !== this &&
      child.nodeType === NodeType.ELEMENT
    ) {
      const childElement = child as TerminalElementNode
      if (
        childElement._terminalElement &&
        childElement._terminalElement !== childElement
      ) {
        if (typeof this._terminalElement.appendChild === 'function') {
          this._terminalElement.appendChild(childElement._terminalElement)
        }
      }
    }

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Ensure nodes have all required properties
    ensureNodeProperties(node)
    ensureNodeProperties(refNode)
    
    // Update node references using safe property setter
    const prevSibling = refNode.previousSibling
    updateNodeRelationships(this, node, prevSibling, refNode)
    
    // Update first child pointer if needed
    if (!prevSibling) {
      this.firstChild = node
    }

    // If this element has a terminal element and the node is an element node,
    // we need to connect it to the terminal
    if (
      this._terminalElement &&
      this._terminalElement !== this &&
      node.nodeType === NodeType.ELEMENT &&
      refNode.nodeType === NodeType.ELEMENT
    ) {
      const nodeElement = node as TerminalElementNode
      const refElement = refNode as TerminalElementNode
      if (
        nodeElement._terminalElement &&
        nodeElement._terminalElement !== nodeElement &&
        refElement._terminalElement &&
        refElement._terminalElement !== refElement
      ) {
        if (typeof this._terminalElement.insertBefore === 'function') {
          this._terminalElement.insertBefore(
            nodeElement._terminalElement,
            refElement._terminalElement
          )
        }
      }
    }

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }

    // If this element has a terminal element and the child is an element node,
    // we need to disconnect it from the terminal
    if (
      this._terminalElement &&
      this._terminalElement !== this &&
      child.nodeType === NodeType.ELEMENT
    ) {
      const childElement = child as TerminalElementNode
      if (
        childElement._terminalElement &&
        childElement._terminalElement !== childElement
      ) {
        if (typeof this._terminalElement.removeChild === 'function') {
          this._terminalElement.removeChild(childElement._terminalElement)
        }
      }
    }

    // Clear references on the removed child using safe property setter
    safeSetProperty(child, 'parentNode', null)
    safeSetProperty(child, 'previousSibling', null)
    safeSetProperty(child, 'nextSibling', null)

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild)
    }

    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }

    // If this element has a terminal element and both children are element nodes,
    // we need to replace them in the terminal
    if (
      this._terminalElement &&
      this._terminalElement !== this &&
      newChild.nodeType === NodeType.ELEMENT &&
      oldChild.nodeType === NodeType.ELEMENT
    ) {
      const newElement = newChild as TerminalElementNode
      const oldElement = oldChild as TerminalElementNode
      if (
        newElement._terminalElement &&
        newElement._terminalElement !== newElement &&
        oldElement._terminalElement &&
        oldElement._terminalElement !== oldElement
      ) {
        // First remove old child
        if (typeof this._terminalElement.removeChild === 'function') {
          this._terminalElement.removeChild(oldElement._terminalElement)
        }
        // Then append new child
        if (typeof this._terminalElement.appendChild === 'function') {
          this._terminalElement.appendChild(newElement._terminalElement)
        }
      }
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Removes this element from its parent (DOM Level 4)
   */
  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  }
  
  /**
   * Inserts nodes before this element (DOM Level 4)
   */
  before(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string' 
        ? new TerminalText(node, this._document)
        : node
      this.parentNode.insertBefore(nodeToInsert, this)
    }
  }
  
  /**
   * Inserts nodes after this element (DOM Level 4)
   */
  after(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    let ref = this.nextSibling
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string'
        ? new TerminalText(node, this._document)
        : node
      this.parentNode.insertBefore(nodeToInsert, ref)
    }
  }

  /**
   * Adds an event listener (DOM Level 2)
   */
  addEventListener(event: string, handler: Function, options?: any): void {
    // For now, we'll store event handlers but not execute them
    // In a full implementation, we'd connect these to blessed events
    if (!this._eventListeners) {
      this._eventListeners = {}
    }
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = []
    }
    this._eventListeners[event].push({ handler, options })
  }

  /**
   * Removes an event listener (DOM Level 2)
   */
  removeEventListener(event: string, handler: Function): void {
    if (!this._eventListeners || !this._eventListeners[event]) {
      return
    }
    this._eventListeners[event] = this._eventListeners[event].filter(
      (listener) => listener.handler !== handler
    )
  }

  /**
   * Converts CSS style properties to blessed-compatible style object
   */
  private convertStylesToBlessed(): Record<string, any> {
    const blessedStyle: Record<string, any> = {}
    
    // Convert colors
    if (this.style.color) {
      blessedStyle.fg = this.style.color
    }
    if (this.style.backgroundColor) {
      blessedStyle.bg = this.style.backgroundColor
    }
    
    // Convert font styles
    if (this.style.fontWeight === 'bold' || this.style.fontWeight === '700') {
      blessedStyle.bold = true
    }
    
    // Convert text decoration
    if (this.style.textDecoration?.includes('underline')) {
      blessedStyle.underline = true
    }
    
    // Handle border styles (e.g., "2px solid red" or complex objects)
    if (this.style.border) {
      if (typeof this.style.border === 'string') {
        const borderParts = this.style.border.split(' ')
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: 'line',
            fg: borderParts[2] || 'white'
          }
        }
      } else if (typeof this.style.border === 'object') {
        // Handle object-style borders that Svelte might set
        blessedStyle.border = this.style.border
      }
    }
    
    // Pass through any direct blessed-style properties that might be set
    for (const [key, value] of Object.entries(this.style)) {
      if (['fg', 'bg', 'bold', 'underline', 'blink', 'inverse', 'invisible'].includes(key)) {
        blessedStyle[key] = value
      }
    }
    
    return blessedStyle
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalElement(this.tagName, {} as TerminalDocumentNode)

    // Copy attributes
    for (const [name, value] of Object.entries(this.attributes)) {
      clone.setAttribute(name, value)
    }

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Implementation of a terminal text node
 */
export class TerminalText implements TerminalTextNode {
  nodeType = NodeType.TEXT
  nodeName = '#text'
  nodeValue: string | null
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()
  _document: TerminalDocumentNode
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }

  /**
   * Creates a new terminal text node
   * @param text - Text content
   * @param document - The owner document
   */
  constructor(text: string, document: TerminalDocumentNode) {
    this.nodeValue = text
    this._document = document
  }

  /**
   * Removes this text node from its parent (DOM Level 4)
   */
  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  }
  
  /**
   * Inserts nodes before this text node (DOM Level 4)
   */
  before(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string' 
        ? new TerminalText(node, {} as TerminalDocumentNode)
        : node
      this.parentNode.insertBefore(nodeToInsert, this)
    }
  }
  
  /**
   * Inserts nodes after this text node (DOM Level 4)
   */
  after(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    let ref = this.nextSibling
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string'
        ? new TerminalText(node, {} as TerminalDocumentNode)
        : node
      this.parentNode.insertBefore(nodeToInsert, ref)
    }
  }

  /**
   * Appends a child node
   * Text nodes cannot have children, so this always throws an error
   */
  appendChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot append child to text node')
  }

  /**
   * Inserts a node before a reference node
   * Text nodes cannot have children, so this always throws an error
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    throw new Error('Cannot insert before in text node')
  }

  /**
   * Removes a child node
   * Text nodes cannot have children, so this always throws an error
   */
  removeChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot remove child from text node')
  }

  /**
   * Replaces a child node with a new node
   * Text nodes cannot have children, so this always throws an error
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    throw new Error('Cannot replace child in text node')
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalText(
      this.nodeValue || '',
      {} as TerminalDocumentNode
    )
    return clone
  }
}

/**
 * Implementation of a terminal comment node
 */
export class TerminalComment implements TerminalNode {
  nodeType = NodeType.COMMENT
  nodeName = '#comment'
  nodeValue: string | null
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }

  /**
   * Creates a new terminal comment node
   * @param text - Comment text
   * @param document - The owner document
   */
  constructor(text: string, document: TerminalDocumentNode) {
    this.nodeValue = text
  }

  /**
   * Removes this comment node from its parent (DOM Level 4)
   */
  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  }
  
  /**
   * Inserts nodes before this comment node (DOM Level 4)
   */
  before(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string' 
        ? new TerminalText(node, {} as TerminalDocumentNode)
        : node
      this.parentNode.insertBefore(nodeToInsert, this)
    }
  }
  
  /**
   * Inserts nodes after this comment node (DOM Level 4)
   */
  after(...nodes: (TerminalNode | string)[]): void {
    if (!this.parentNode) return
    
    let ref = this.nextSibling
    for (const node of nodes) {
      const nodeToInsert = typeof node === 'string'
        ? new TerminalText(node, {} as TerminalDocumentNode)
        : node
      this.parentNode.insertBefore(nodeToInsert, ref)
    }
  }

  /**
   * Appends a child node
   * Comment nodes cannot have children, so this always throws an error
   */
  appendChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot append child to comment node')
  }

  /**
   * Inserts a node before a reference node
   * Comment nodes cannot have children, so this always throws an error
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    throw new Error('Cannot insert before in comment node')
  }

  /**
   * Removes a child node
   * Comment nodes cannot have children, so this always throws an error
   */
  removeChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot remove child from comment node')
  }

  /**
   * Replaces a child node with a new node
   * Comment nodes cannot have children, so this always throws an error
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    throw new Error('Cannot replace child in comment node')
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalComment(
      this.nodeValue || '',
      {} as TerminalDocumentNode
    )
    return clone
  }
}

/**
 * Implementation of a document fragment
 */
export class TerminalDocumentFragment implements TerminalNode {
  nodeType = NodeType.FRAGMENT
  nodeName = '#document-fragment'
  private _parentNode: TerminalNode | null = null
  private _firstChild: TerminalNode | null = null
  private _lastChild: TerminalNode | null = null
  private _nextSibling: TerminalNode | null = null
  private _previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()
  
  // Define getters/setters to ensure writability
  get parentNode() { return this._parentNode }
  set parentNode(value) { this._parentNode = value }
  
  get firstChild() { return this._firstChild }
  set firstChild(value) { this._firstChild = value }
  
  get lastChild() { return this._lastChild }
  set lastChild(value) { this._lastChild = value }
  
  get nextSibling() { return this._nextSibling }
  set nextSibling(value) { this._nextSibling = value }
  
  get previousSibling() { return this._previousSibling }
  set previousSibling(value) { this._previousSibling = value }
  
  constructor(document: TerminalDocumentNode) {
    // No initialization needed - properties are already set as class fields
  }


  /**
   * Appends multiple nodes (DOM Level 4 method)
   * @param nodes - Nodes to append
   */
  append(...nodes: (TerminalNode | string)[]): void {
    for (const node of nodes) {
      if (typeof node === 'string') {
        this.appendChild(document.createTextNode(node))
      } else {
        this.appendChild(node)
      }
    }
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // Ensure child has all required properties
    ensureNodeProperties(child)
    
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child)
    }

    this.childNodes.push(child)

    // Update child node using safe property setter
    updateNodeRelationships(this, child, this.lastChild, null)

    // Update first/last child pointers
    if (!this.firstChild) {
      this.firstChild = child
    }
    this.lastChild = child

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Ensure nodes have all required properties
    ensureNodeProperties(node)
    ensureNodeProperties(refNode)
    
    // Update node references using safe property setter
    const prevSibling = refNode.previousSibling
    updateNodeRelationships(this, node, prevSibling, refNode)
    
    // Update first child pointer if needed
    if (!prevSibling) {
      this.firstChild = node
    }

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }

    // Clear references on the removed child using safe property setter
    safeSetProperty(child, 'parentNode', null)
    safeSetProperty(child, 'previousSibling', null)
    safeSetProperty(child, 'nextSibling', null)

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild)
    }

    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalDocumentFragment({} as TerminalDocumentNode)

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Creates a new document node (the root of the virtual DOM)
 * @returns A new document node
 */
export function createDocument(): TerminalDocumentNode {
  return new TerminalDocument()
}

/**
 * Helper functions to create DOM nodes
 */
export function createElement(tagName: string): TerminalElementNode {
  return document.createElement(tagName)
}

export function createTextNode(text: string): TerminalTextNode {
  return document.createTextNode(text)
}

export function createComment(text: string): TerminalNode {
  return document.createComment(text)
}

export function createDocumentFragment(): TerminalNode {
  return document.createDocumentFragment()
}

/**
 * The global document instance
 */
export const document = createDocument()
