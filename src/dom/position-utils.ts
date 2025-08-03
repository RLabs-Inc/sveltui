/**
 * Position Utilities for Blessed-Compatible Positioning
 * 
 * Implements blessed's positioning system with support for:
 * - Percentages: "50%", "100%"
 * - Center keyword: "center"
 * - Relative offsets: "50%-10", "100%+5"
 * - Half keyword: "half" (converts to "50%")
 * - Shrink sizing
 */

import type { Widgets } from 'blessed'

/**
 * Parsed position expression
 */
interface PositionExpression {
  /** Base value (percentage or 'center') */
  base: string | number
  /** Offset to add/subtract */
  offset: number
}

/**
 * Position calculation context
 */
interface PositionContext {
  /** Parent width */
  parentWidth: number
  /** Parent height */
  parentHeight: number
  /** Element's own width (for center calculations) */
  elementWidth?: number
  /** Element's own height (for center calculations) */
  elementHeight?: number
  /** Parent's inner left padding (blessed autoPadding) */
  parentILeft?: number
  /** Parent's inner top padding (blessed autoPadding) */
  parentITop?: number
  /** Parent's inner right padding (blessed autoPadding) */
  parentIRight?: number
  /** Parent's inner bottom padding (blessed autoPadding) */
  parentIBottom?: number
}

/**
 * Parses a position value into base and offset
 * @param value - Position value (e.g., "50%-10", "center", 100)
 * @returns Parsed expression
 */
export function parsePositionExpression(value: string | number): PositionExpression {
  // Handle numeric values
  if (typeof value === 'number') {
    return { base: value, offset: 0 }
  }

  // Handle special keywords
  if (value === 'center') {
    return { base: 'center', offset: 0 }
  }

  if (value === 'half') {
    return { base: 50, offset: 0 }
  }

  // Parse expressions like "50%-10" or "100%+5"
  const expr = value.split(/(?=\+|-)/);
  const baseStr = expr[0];
  const offset = +(expr[1] || 0);

  // Check if base is a percentage
  if (baseStr.endsWith('%')) {
    const percent = +baseStr.slice(0, -1);
    return { base: percent, offset }
  }

  // Otherwise treat as numeric
  return { base: +baseStr, offset }
}

/**
 * Calculates a horizontal position (left/width)
 * @param value - Position value
 * @param context - Calculation context
 * @param isWidth - Whether this is a width calculation
 * @returns Calculated position
 */
export function calculateHorizontalPosition(
  value: string | number | undefined,
  context: PositionContext,
  isWidth: boolean = false
): number | string {
  if (value === undefined || value === null) {
    return isWidth ? 'shrink' : 0;
  }

  // Handle 'shrink' for width
  if (value === 'shrink' && isWidth) {
    return 'shrink';
  }

  const expr = parsePositionExpression(value);

  // Handle center keyword
  if (expr.base === 'center') {
    if (isWidth) {
      // 'center' doesn't make sense for width
      return context.parentWidth;
    }
    // For left position with center
    const elementWidth = context.elementWidth || 0;
    const centered = Math.floor((context.parentWidth - elementWidth) / 2);
    return centered + expr.offset;
  }

  // Handle percentage
  if (typeof expr.base === 'number' && value.toString().includes('%')) {
    const baseValue = Math.floor(context.parentWidth * (expr.base / 100));
    return baseValue + expr.offset;
  }

  // Handle numeric values
  if (typeof expr.base === 'number') {
    return expr.base + expr.offset;
  }

  // Fallback
  return value;
}

/**
 * Calculates a vertical position (top/height)
 * @param value - Position value
 * @param context - Calculation context
 * @param isHeight - Whether this is a height calculation
 * @returns Calculated position
 */
export function calculateVerticalPosition(
  value: string | number | undefined,
  context: PositionContext,
  isHeight: boolean = false
): number | string {
  if (value === undefined || value === null) {
    return isHeight ? 'shrink' : 0;
  }

  // Handle 'shrink' for height
  if (value === 'shrink' && isHeight) {
    return 'shrink';
  }

  const expr = parsePositionExpression(value);

  // Handle center keyword
  if (expr.base === 'center') {
    if (isHeight) {
      // 'center' doesn't make sense for height
      return context.parentHeight;
    }
    // For top position with center
    const elementHeight = context.elementHeight || 0;
    const centered = Math.floor((context.parentHeight - elementHeight) / 2);
    return centered + expr.offset;
  }

  // Handle percentage
  if (typeof expr.base === 'number' && value.toString().includes('%')) {
    const baseValue = Math.floor(context.parentHeight * (expr.base / 100));
    return baseValue + expr.offset;
  }

  // Handle numeric values
  if (typeof expr.base === 'number') {
    return expr.base + expr.offset;
  }

  // Fallback
  return value;
}

/**
 * Calculates full positioning for an element
 * Matches blessed's algorithm from _getWidth, _getHeight, _getLeft, _getTop
 * @param props - Element position properties
 * @param parent - Parent element for dimension reference
 * @param contentSize - Optional content size for shrink calculations
 * @returns Calculated positions
 */
export function calculateElementPosition(
  props: {
    top?: number | string
    left?: number | string
    right?: number | string
    bottom?: number | string
    width?: number | string
    height?: number | string
  },
  parent?: Widgets.Node,
  contentSize?: { width: number; height: number }
): {
  top: number | string
  left: number | string
  width: number | string
  height: number | string
  right?: number | string
  bottom?: number | string
} {
  // Get parent dimensions
  let parentWidth = 0;
  let parentHeight = 0;
  
  if (parent) {
    // For screen objects, use cols/rows
    if ('cols' in parent && typeof parent.cols === 'number') {
      parentWidth = parent.cols;
    } else if ('width' in parent && typeof parent.width === 'number') {
      parentWidth = parent.width;
    } else if ('screen' in parent && parent.screen) {
      parentWidth = parent.screen.cols || parent.screen.width;
    }
    
    if ('rows' in parent && typeof parent.rows === 'number') {
      parentHeight = parent.rows;
    } else if ('height' in parent && typeof parent.height === 'number') {
      parentHeight = parent.height;
    } else if ('screen' in parent && parent.screen) {
      parentHeight = parent.screen.rows || parent.screen.height;
    }
  }

  const context: PositionContext = {
    parentWidth,
    parentHeight,
    elementWidth: contentSize?.width,
    elementHeight: contentSize?.height
  };

  // Calculate width first (needed for center calculations)
  let width: number | string;
  if (props.width !== undefined) {
    width = calculateHorizontalPosition(props.width, context, true);
  } else if (props.left !== undefined && props.right !== undefined) {
    // Width calculated from left and right constraints
    const left = calculateHorizontalPosition(props.left, context, false);
    const right = calculateHorizontalPosition(props.right, context, false);
    if (typeof left === 'number' && typeof right === 'number') {
      width = parentWidth - left - right;
    } else {
      width = 'shrink';
    }
  } else if (contentSize && (props.width === 'shrink' || props.width === undefined)) {
    // Use content size for shrink
    width = contentSize.width;
  } else {
    width = props.width || 'shrink';
  }

  // Calculate height
  let height: number | string;
  if (props.height !== undefined) {
    height = calculateVerticalPosition(props.height, context, true);
  } else if (props.top !== undefined && props.bottom !== undefined) {
    // Height calculated from top and bottom constraints
    const top = calculateVerticalPosition(props.top, context, false);
    const bottom = calculateVerticalPosition(props.bottom, context, false);
    if (typeof top === 'number' && typeof bottom === 'number') {
      height = parentHeight - top - bottom;
    } else {
      height = 'shrink';
    }
  } else if (contentSize && (props.height === 'shrink' || props.height === undefined)) {
    // Use content size for shrink
    height = contentSize.height;
  } else {
    height = props.height || 'shrink';
  }

  // Update context with calculated dimensions for center positioning
  if (typeof width === 'number') {
    context.elementWidth = width;
  }
  if (typeof height === 'number') {
    context.elementHeight = height;
  }

  // Calculate left position
  let left: number | string;
  if (props.left !== undefined) {
    left = calculateHorizontalPosition(props.left, context, false);
  } else if (props.right !== undefined) {
    // Calculate left from right
    const right = calculateHorizontalPosition(props.right, context, false);
    if (typeof right === 'number' && typeof width === 'number') {
      left = parentWidth - width - right;
    } else {
      left = 0;
    }
  } else {
    left = 0;
  }

  // Calculate top position
  let top: number | string;
  if (props.top !== undefined) {
    top = calculateVerticalPosition(props.top, context, false);
  } else if (props.bottom !== undefined) {
    // Calculate top from bottom
    const bottom = calculateVerticalPosition(props.bottom, context, false);
    if (typeof bottom === 'number' && typeof height === 'number') {
      top = parentHeight - height - bottom;
    } else {
      top = 0;
    }
  } else {
    top = 0;
  }

  // Return calculated positions
  // Only include right/bottom if they were explicitly set
  const result: any = { top, left, width, height };
  if (props.right !== undefined) result.right = props.right;
  if (props.bottom !== undefined) result.bottom = props.bottom;
  
  return result;
}

/**
 * Helper to get parent dimensions from a blessed node
 * @param parent - Parent blessed node
 * @returns Parent dimensions
 */
export function getParentDimensions(parent?: Widgets.Node): { width: number; height: number } {
  if (!parent) {
    return { width: 0, height: 0 };
  }

  let width = 0;
  let height = 0;

  // Try to get dimensions from the parent
  // For screen objects, use cols/rows
  if ('cols' in parent && typeof parent.cols === 'number') {
    width = parent.cols;
  } else if ('width' in parent && typeof parent.width === 'number') {
    width = parent.width;
  } else if ('_getWidth' in parent && typeof parent._getWidth === 'function') {
    width = parent._getWidth();
  } else if ('screen' in parent && parent.screen) {
    width = parent.screen.cols || parent.screen.width;
  }

  if ('rows' in parent && typeof parent.rows === 'number') {
    height = parent.rows;
  } else if ('height' in parent && typeof parent.height === 'number') {
    height = parent.height;
  } else if ('_getHeight' in parent && typeof parent._getHeight === 'function') {
    height = parent._getHeight();
  } else if ('screen' in parent && parent.screen) {
    height = parent.screen.rows || parent.screen.height;
  }

  return { width, height };
}