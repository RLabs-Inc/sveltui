/**
 * Blessed-compatible Positioning System for SvelTUI
 * 
 * This module implements blessed's positioning calculations including:
 * - Percentage-based positioning ("50%")
 * - Center alignment ("center")
 * - Relative positioning with offsets ("50%-10", "100%-4")
 * - Absolute positioning
 */

/**
 * Position value can be a number, percentage string, "center", or expression
 */
export type PositionValue = number | string | undefined;

/**
 * Parsed position expression components
 */
interface ParsedPosition {
  base: number | 'center';
  offset: number;
}

/**
 * Parent dimensions for position calculations
 */
interface ParentDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
}

/**
 * Element dimensions for center calculations
 */
interface ElementDimensions {
  width: number;
  height: number;
}

/**
 * Parses a position value into base and offset components
 * Examples: "50%" -> {base: 0.5, offset: 0}
 *          "center" -> {base: 'center', offset: 0}
 *          "50%-10" -> {base: 0.5, offset: -10}
 *          "100%-4" -> {base: 1.0, offset: -4}
 */
export function parsePositionValue(value: PositionValue): ParsedPosition | null {
  if (value === undefined || value === null) {
    return null;
  }

  // Handle numeric values
  if (typeof value === 'number') {
    return { base: value, offset: 0 };
  }

  // Handle string values
  if (typeof value === 'string') {
    // Handle "center" keyword
    if (value === 'center') {
      return { base: 'center', offset: 0 };
    }

    // Handle percentage and expression strings
    // Match patterns like "50%", "50%-10", "50%+10"
    const expr = value.split(/(?=\+|-)/);
    const baseStr = expr[0];
    const offsetStr = expr[1] || '0';

    let base: number | 'center' = 0;
    
    // Parse base value
    if (baseStr.endsWith('%')) {
      base = parseFloat(baseStr) / 100;
    } else {
      base = parseFloat(baseStr);
    }

    // Parse offset
    const offset = parseFloat(offsetStr) || 0;

    return { base, offset };
  }

  return null;
}

/**
 * Calculates the actual left position based on blessed's algorithm
 */
export function calculateLeft(
  left: PositionValue,
  right: PositionValue,
  width: number,
  parent: ParentDimensions,
  element: ElementDimensions
): number {
  const parsed = parsePositionValue(left);
  
  if (parsed) {
    if (parsed.base === 'center') {
      // Center horizontally: parent.width / 2 - element.width / 2
      const centered = Math.floor(parent.width / 2 - element.width / 2);
      return parent.left + centered + parsed.offset;
    } else if (typeof parsed.base === 'number') {
      if (parsed.base <= 1 && left?.toString().includes('%')) {
        // Percentage-based positioning
        const calculated = Math.floor(parent.width * parsed.base);
        return parent.left + calculated + parsed.offset;
      } else {
        // Absolute positioning
        return parent.left + parsed.base + parsed.offset;
      }
    }
  }

  // If left is not specified but right is, calculate from right
  if (left === undefined && right !== undefined) {
    const parsedRight = parsePositionValue(right);
    if (parsedRight && typeof parsedRight.base === 'number') {
      if (parsedRight.base <= 1 && right.toString().includes('%')) {
        const rightOffset = Math.floor(parent.width * parsedRight.base) + parsedRight.offset;
        return parent.left + parent.width - rightOffset - element.width;
      } else {
        return parent.left + parent.width - parsedRight.base - parsedRight.offset - element.width;
      }
    }
  }

  // Default to parent's left
  return parent.left;
}

/**
 * Calculates the actual top position based on blessed's algorithm
 */
export function calculateTop(
  top: PositionValue,
  bottom: PositionValue,
  height: number,
  parent: ParentDimensions,
  element: ElementDimensions
): number {
  const parsed = parsePositionValue(top);
  
  if (parsed) {
    if (parsed.base === 'center') {
      // Center vertically: parent.height / 2 - element.height / 2
      const centered = Math.floor(parent.height / 2 - element.height / 2);
      return parent.top + centered + parsed.offset;
    } else if (typeof parsed.base === 'number') {
      if (parsed.base <= 1 && top?.toString().includes('%')) {
        // Percentage-based positioning
        const calculated = Math.floor(parent.height * parsed.base);
        return parent.top + calculated + parsed.offset;
      } else {
        // Absolute positioning
        return parent.top + parsed.base + parsed.offset;
      }
    }
  }

  // If top is not specified but bottom is, calculate from bottom
  if (top === undefined && bottom !== undefined) {
    const parsedBottom = parsePositionValue(bottom);
    if (parsedBottom && typeof parsedBottom.base === 'number') {
      if (parsedBottom.base <= 1 && bottom.toString().includes('%')) {
        const bottomOffset = Math.floor(parent.height * parsedBottom.base) + parsedBottom.offset;
        return parent.top + parent.height - bottomOffset - element.height;
      } else {
        return parent.top + parent.height - parsedBottom.base - parsedBottom.offset - element.height;
      }
    }
  }

  // Default to parent's top
  return parent.top;
}

/**
 * Calculates the actual width based on blessed's algorithm
 */
export function calculateWidth(
  width: PositionValue,
  left: PositionValue,
  right: PositionValue,
  parent: ParentDimensions
): number {
  const parsed = parsePositionValue(width);
  
  if (parsed && typeof parsed.base === 'number') {
    if (parsed.base <= 1 && width?.toString().includes('%')) {
      // Percentage-based width
      return Math.floor(parent.width * parsed.base) + parsed.offset;
    } else {
      // Absolute width
      return parsed.base + parsed.offset;
    }
  }

  // If width is not specified, calculate from left/right
  if (width === undefined && left !== undefined && right !== undefined) {
    const leftParsed = parsePositionValue(left);
    const rightParsed = parsePositionValue(right);
    
    if (leftParsed && rightParsed && 
        typeof leftParsed.base === 'number' && 
        typeof rightParsed.base === 'number') {
      
      let leftPos = leftParsed.base + leftParsed.offset;
      let rightPos = rightParsed.base + rightParsed.offset;
      
      // Handle percentage values
      if (left.toString().includes('%')) {
        leftPos = Math.floor(parent.width * leftParsed.base) + leftParsed.offset;
      }
      if (right.toString().includes('%')) {
        rightPos = Math.floor(parent.width * rightParsed.base) + rightParsed.offset;
      }
      
      return parent.width - leftPos - rightPos;
    }
  }

  // Handle 'shrink' width
  if (width === 'shrink') {
    // This should be handled by the element itself based on content
    return 0;
  }

  // Default to parent width
  return parent.width;
}

/**
 * Calculates the actual height based on blessed's algorithm
 */
export function calculateHeight(
  height: PositionValue,
  top: PositionValue,
  bottom: PositionValue,
  parent: ParentDimensions
): number {
  const parsed = parsePositionValue(height);
  
  if (parsed && typeof parsed.base === 'number') {
    if (parsed.base <= 1 && height?.toString().includes('%')) {
      // Percentage-based height
      return Math.floor(parent.height * parsed.base) + parsed.offset;
    } else {
      // Absolute height
      return parsed.base + parsed.offset;
    }
  }

  // If height is not specified, calculate from top/bottom
  if (height === undefined && top !== undefined && bottom !== undefined) {
    const topParsed = parsePositionValue(top);
    const bottomParsed = parsePositionValue(bottom);
    
    if (topParsed && bottomParsed && 
        typeof topParsed.base === 'number' && 
        typeof bottomParsed.base === 'number') {
      
      let topPos = topParsed.base + topParsed.offset;
      let bottomPos = bottomParsed.base + bottomParsed.offset;
      
      // Handle percentage values
      if (top.toString().includes('%')) {
        topPos = Math.floor(parent.height * topParsed.base) + topParsed.offset;
      }
      if (bottom.toString().includes('%')) {
        bottomPos = Math.floor(parent.height * bottomParsed.base) + bottomParsed.offset;
      }
      
      return parent.height - topPos - bottomPos;
    }
  }

  // Handle 'shrink' height
  if (height === 'shrink') {
    // This should be handled by the element itself based on content
    return 0;
  }

  // Default to parent height
  return parent.height;
}

/**
 * Calculates complete positioning for an element
 */
export function calculatePosition(
  props: {
    left?: PositionValue;
    top?: PositionValue;
    right?: PositionValue;
    bottom?: PositionValue;
    width?: PositionValue;
    height?: PositionValue;
  },
  parent: ParentDimensions,
  contentSize?: { width: number; height: number }
): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  // First calculate dimensions (width/height)
  let width = calculateWidth(props.width, props.left, props.right, parent);
  let height = calculateHeight(props.height, props.top, props.bottom, parent);
  
  // Handle shrink sizing based on content
  if (props.width === 'shrink' && contentSize) {
    width = contentSize.width;
  }
  if (props.height === 'shrink' && contentSize) {
    height = contentSize.height;
  }
  
  // Then calculate positions using the calculated dimensions
  const element = { width, height };
  const left = calculateLeft(props.left, props.right, width, parent, element);
  const top = calculateTop(props.top, props.bottom, height, parent, element);
  
  return { left, top, width, height };
}

/**
 * Helper to get parent dimensions from a blessed element or screen
 */
export function getParentDimensions(parent: any): ParentDimensions {
  if (!parent) {
    return { width: 0, height: 0, left: 0, top: 0 };
  }
  
  // For screen, use cols/rows
  if (parent.cols !== undefined && parent.rows !== undefined) {
    return {
      width: parent.cols,
      height: parent.rows,
      left: 0,
      top: 0
    };
  }
  
  // For regular elements
  return {
    width: parent.width || 0,
    height: parent.height || 0,
    left: parent.aleft || parent.left || 0,
    top: parent.atop || parent.top || 0
  };
}