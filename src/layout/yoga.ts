/**
 * Yoga Layout Integration
 * 
 * This module provides integration with the Yoga layout engine for more
 * complex and powerful layout calculations.
 */

import Yoga from 'yoga-layout-prebuilt';
import type { Node as YogaNode } from 'yoga-layout-prebuilt';
import type { TerminalElement } from '../dom/elements';

/**
 * Yoga layout options (commonly used CSS Flexbox properties)
 */
export interface YogaLayoutOptions {
  /** Flex direction */
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  
  /** How to justify content along the main axis */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /** How to align items along the cross axis */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  
  /** How to align content when there is extra space in the cross axis */
  alignContent?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'space-between' | 'space-around';
  
  /** How to align individual items */
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  
  /** Flex grow factor */
  flexGrow?: number;
  
  /** Flex shrink factor */
  flexShrink?: number;
  
  /** Flex basis */
  flexBasis?: number | 'auto';
  
  /** Whether to wrap items */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /** Width */
  width?: number | string;
  
  /** Height */
  height?: number | string;
  
  /** Minimum width */
  minWidth?: number;
  
  /** Minimum height */
  minHeight?: number;
  
  /** Maximum width */
  maxWidth?: number;
  
  /** Maximum height */
  maxHeight?: number;
  
  /** Padding */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  
  /** Margin */
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  
  /** Position type */
  position?: 'relative' | 'absolute';
  
  /** Left position */
  left?: number;
  
  /** Top position */
  top?: number;
  
  /** Right position */
  right?: number;
  
  /** Bottom position */
  bottom?: number;
}

/**
 * A result of layout calculation
 */
interface YogaLayoutResult {
  left: number;
  top: number;
  width: number;
  height: number;
  children: YogaLayoutResult[];
}

/**
 * A cache of yoga nodes to avoid recreating them
 */
const nodeCache = new WeakMap<TerminalElement, YogaNode>();

/**
 * Applies Yoga layout to a container and its children
 * 
 * @param container - The container element
 * @param containerWidth - The container width
 * @param containerHeight - The container height
 * @param options - Layout options
 */
export function applyYogaLayout(
  container: TerminalElement,
  containerWidth: number,
  containerHeight: number,
  options: YogaLayoutOptions = {}
): void {
  // Create root yoga node
  const rootNode = createYogaNode(container, options);
  
  // Set container dimensions
  rootNode.setWidth(containerWidth);
  rootNode.setHeight(containerHeight);
  
  // Create yoga nodes for all children recursively
  for (const child of container.children) {
    const childNode = createYogaNodeForElement(child, rootNode);
    rootNode.insertChild(childNode, rootNode.getChildCount());
  }
  
  // Calculate layout
  rootNode.calculateLayout();
  
  // Apply layout to elements
  applyLayoutToElements(container, rootNode);
  
  // Free yoga nodes
  freeYogaNodes(container);
}

/**
 * Creates a yoga node for an element
 * 
 * @param element - The element
 * @param options - Layout options
 * @returns The yoga node
 */
function createYogaNode(
  element: TerminalElement,
  options: YogaLayoutOptions = {}
): YogaNode {
  // Check if node already exists
  let node = nodeCache.get(element);
  
  if (!node) {
    // Create new node
    node = Yoga.Node.create();
    nodeCache.set(element, node);
  }
  
  // Apply flex direction
  if (options.flexDirection) {
    switch (options.flexDirection) {
      case 'row':
        node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
        break;
      case 'column':
        node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
        break;
      case 'row-reverse':
        node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW_REVERSE);
        break;
      case 'column-reverse':
        node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN_REVERSE);
        break;
    }
  }
  
  // Apply justify content
  if (options.justifyContent) {
    switch (options.justifyContent) {
      case 'flex-start':
        node.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
        break;
      case 'center':
        node.setJustifyContent(Yoga.JUSTIFY_CENTER);
        break;
      case 'flex-end':
        node.setJustifyContent(Yoga.JUSTIFY_FLEX_END);
        break;
      case 'space-between':
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
        break;
      case 'space-around':
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_AROUND);
        break;
      case 'space-evenly':
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_EVENLY);
        break;
    }
  }
  
  // Apply align items
  if (options.alignItems) {
    switch (options.alignItems) {
      case 'flex-start':
        node.setAlignItems(Yoga.ALIGN_FLEX_START);
        break;
      case 'center':
        node.setAlignItems(Yoga.ALIGN_CENTER);
        break;
      case 'flex-end':
        node.setAlignItems(Yoga.ALIGN_FLEX_END);
        break;
      case 'stretch':
        node.setAlignItems(Yoga.ALIGN_STRETCH);
        break;
      case 'baseline':
        node.setAlignItems(Yoga.ALIGN_BASELINE);
        break;
    }
  }
  
  // Apply flex wrap
  if (options.flexWrap) {
    switch (options.flexWrap) {
      case 'nowrap':
        node.setFlexWrap(Yoga.WRAP_NO_WRAP);
        break;
      case 'wrap':
        node.setFlexWrap(Yoga.WRAP_WRAP);
        break;
      case 'wrap-reverse':
        node.setFlexWrap(Yoga.WRAP_WRAP_REVERSE);
        break;
    }
  }
  
  // Apply flex grow
  if (options.flexGrow !== undefined) {
    node.setFlexGrow(options.flexGrow);
  }
  
  // Apply flex shrink
  if (options.flexShrink !== undefined) {
    node.setFlexShrink(options.flexShrink);
  }
  
  // Apply padding
  if (options.padding) {
    if (typeof options.padding === 'number') {
      node.setPadding(Yoga.EDGE_ALL, options.padding);
    } else {
      if (options.padding.top !== undefined) {
        node.setPadding(Yoga.EDGE_TOP, options.padding.top);
      }
      if (options.padding.right !== undefined) {
        node.setPadding(Yoga.EDGE_RIGHT, options.padding.right);
      }
      if (options.padding.bottom !== undefined) {
        node.setPadding(Yoga.EDGE_BOTTOM, options.padding.bottom);
      }
      if (options.padding.left !== undefined) {
        node.setPadding(Yoga.EDGE_LEFT, options.padding.left);
      }
    }
  }
  
  // Apply margin
  if (options.margin) {
    if (typeof options.margin === 'number') {
      node.setMargin(Yoga.EDGE_ALL, options.margin);
    } else {
      if (options.margin.top !== undefined) {
        node.setMargin(Yoga.EDGE_TOP, options.margin.top);
      }
      if (options.margin.right !== undefined) {
        node.setMargin(Yoga.EDGE_RIGHT, options.margin.right);
      }
      if (options.margin.bottom !== undefined) {
        node.setMargin(Yoga.EDGE_BOTTOM, options.margin.bottom);
      }
      if (options.margin.left !== undefined) {
        node.setMargin(Yoga.EDGE_LEFT, options.margin.left);
      }
    }
  }
  
  // Apply position type
  if (options.position) {
    node.setPositionType(
      options.position === 'absolute'
        ? Yoga.POSITION_TYPE_ABSOLUTE
        : Yoga.POSITION_TYPE_RELATIVE
    );
  }
  
  // Apply position
  if (options.left !== undefined) {
    node.setPosition(Yoga.EDGE_LEFT, options.left);
  }
  if (options.top !== undefined) {
    node.setPosition(Yoga.EDGE_TOP, options.top);
  }
  if (options.right !== undefined) {
    node.setPosition(Yoga.EDGE_RIGHT, options.right);
  }
  if (options.bottom !== undefined) {
    node.setPosition(Yoga.EDGE_BOTTOM, options.bottom);
  }
  
  return node;
}

/**
 * Creates a yoga node for an element and its children
 * 
 * @param element - The element
 * @param parentNode - The parent yoga node
 * @returns The yoga node
 */
function createYogaNodeForElement(
  element: TerminalElement,
  parentNode: YogaNode
): YogaNode {
  // Extract layout options from element properties
  const options: YogaLayoutOptions = extractLayoutOptions(element);
  
  // Create yoga node
  const node = createYogaNode(element, options);
  
  // Set width and height
  if (typeof element.props.width === 'number') {
    node.setWidth(element.props.width);
  } else if (element.props.width === '100%') {
    node.setWidthPercent(100);
  } else if (typeof element.props.width === 'string' && element.props.width.endsWith('%')) {
    const percent = parseFloat(element.props.width);
    node.setWidthPercent(percent);
  } else {
    node.setWidthAuto();
  }
  
  if (typeof element.props.height === 'number') {
    node.setHeight(element.props.height);
  } else if (element.props.height === '100%') {
    node.setHeightPercent(100);
  } else if (typeof element.props.height === 'string' && element.props.height.endsWith('%')) {
    const percent = parseFloat(element.props.height);
    node.setHeightPercent(percent);
  } else {
    node.setHeightAuto();
  }
  
  // Create nodes for children
  for (const child of element.children) {
    const childNode = createYogaNodeForElement(child, node);
    node.insertChild(childNode, node.getChildCount());
  }
  
  return node;
}

/**
 * Extracts layout options from element properties
 * 
 * @param element - The element
 * @returns Layout options
 */
function extractLayoutOptions(element: TerminalElement): YogaLayoutOptions {
  const props = element.props;
  
  return {
    flexDirection: props.flexDirection as any,
    justifyContent: props.justifyContent as any,
    alignItems: props.alignItems as any,
    alignContent: props.alignContent as any,
    alignSelf: props.alignSelf as any,
    flexGrow: props.flexGrow as number,
    flexShrink: props.flexShrink as number,
    flexBasis: props.flexBasis as any,
    flexWrap: props.flexWrap as any,
    padding: props.padding as any,
    margin: props.margin as any,
    position: props.position as any,
  };
}

/**
 * Applies calculated layout to elements
 * 
 * @param container - The container element
 * @param node - The yoga node
 */
function applyLayoutToElements(container: TerminalElement, node: YogaNode): void {
  // Apply layout to container
  const left = Math.round(node.getComputedLeft());
  const top = Math.round(node.getComputedTop());
  const width = Math.round(node.getComputedWidth());
  const height = Math.round(node.getComputedHeight());
  
  // Don't apply to root container, as it already has its dimensions set
  
  // Apply layout to children
  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i];
    const childNode = node.getChild(i);
    
    // Apply layout to child
    const childLeft = Math.round(childNode.getComputedLeft());
    const childTop = Math.round(childNode.getComputedTop());
    const childWidth = Math.round(childNode.getComputedWidth());
    const childHeight = Math.round(childNode.getComputedHeight());
    
    // Update child props
    child.setProps({
      ...child.props,
      left: childLeft,
      top: childTop,
      width: childWidth,
      height: childHeight,
    });
    
    // Apply layout to child's children
    if (child.children.length > 0) {
      applyLayoutToElements(child, childNode);
    }
  }
}

/**
 * Frees yoga nodes recursively
 * 
 * @param container - The container element
 */
function freeYogaNodes(container: TerminalElement): void {
  // Free child nodes first
  for (const child of container.children) {
    freeYogaNodes(child);
  }
  
  // Free this node
  const node = nodeCache.get(container);
  if (node) {
    node.free();
    nodeCache.delete(container);
  }
}