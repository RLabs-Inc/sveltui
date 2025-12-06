// @bun
// src/dom/positioning.ts
function parsePositionValue(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "number") {
    return { base: value, offset: 0 };
  }
  if (typeof value === "string") {
    if (value === "center") {
      return { base: "center", offset: 0 };
    }
    const expr = value.split(/(?=\+|-)/);
    const baseStr = expr[0];
    const offsetStr = expr[1] || "0";
    let base = 0;
    if (baseStr.endsWith("%")) {
      base = parseFloat(baseStr) / 100;
    } else {
      base = parseFloat(baseStr);
    }
    const offset = parseFloat(offsetStr) || 0;
    return { base, offset };
  }
  return null;
}
function calculateLeft(left, right, width, parent, element) {
  const parsed = parsePositionValue(left);
  if (parsed) {
    if (parsed.base === "center") {
      const centered = Math.floor(parent.width / 2 - element.width / 2);
      return parent.left + centered + parsed.offset;
    } else if (typeof parsed.base === "number") {
      if (parsed.base <= 1 && left?.toString().includes("%")) {
        const calculated = Math.floor(parent.width * parsed.base);
        return parent.left + calculated + parsed.offset;
      } else {
        return parent.left + parsed.base + parsed.offset;
      }
    }
  }
  if (left === undefined && right !== undefined) {
    const parsedRight = parsePositionValue(right);
    if (parsedRight && typeof parsedRight.base === "number") {
      if (parsedRight.base <= 1 && right.toString().includes("%")) {
        const rightOffset = Math.floor(parent.width * parsedRight.base) + parsedRight.offset;
        return parent.left + parent.width - rightOffset - element.width;
      } else {
        return parent.left + parent.width - parsedRight.base - parsedRight.offset - element.width;
      }
    }
  }
  return parent.left;
}
function calculateTop(top, bottom, height, parent, element) {
  const parsed = parsePositionValue(top);
  if (parsed) {
    if (parsed.base === "center") {
      const centered = Math.floor(parent.height / 2 - element.height / 2);
      return parent.top + centered + parsed.offset;
    } else if (typeof parsed.base === "number") {
      if (parsed.base <= 1 && top?.toString().includes("%")) {
        const calculated = Math.floor(parent.height * parsed.base);
        return parent.top + calculated + parsed.offset;
      } else {
        return parent.top + parsed.base + parsed.offset;
      }
    }
  }
  if (top === undefined && bottom !== undefined) {
    const parsedBottom = parsePositionValue(bottom);
    if (parsedBottom && typeof parsedBottom.base === "number") {
      if (parsedBottom.base <= 1 && bottom.toString().includes("%")) {
        const bottomOffset = Math.floor(parent.height * parsedBottom.base) + parsedBottom.offset;
        return parent.top + parent.height - bottomOffset - element.height;
      } else {
        return parent.top + parent.height - parsedBottom.base - parsedBottom.offset - element.height;
      }
    }
  }
  return parent.top;
}
function calculateWidth(width, left, right, parent) {
  const parsed = parsePositionValue(width);
  if (parsed && typeof parsed.base === "number") {
    if (parsed.base <= 1 && width?.toString().includes("%")) {
      return Math.floor(parent.width * parsed.base) + parsed.offset;
    } else {
      return parsed.base + parsed.offset;
    }
  }
  if (width === undefined && left !== undefined && right !== undefined) {
    const leftParsed = parsePositionValue(left);
    const rightParsed = parsePositionValue(right);
    if (leftParsed && rightParsed && typeof leftParsed.base === "number" && typeof rightParsed.base === "number") {
      let leftPos = leftParsed.base + leftParsed.offset;
      let rightPos = rightParsed.base + rightParsed.offset;
      if (left.toString().includes("%")) {
        leftPos = Math.floor(parent.width * leftParsed.base) + leftParsed.offset;
      }
      if (right.toString().includes("%")) {
        rightPos = Math.floor(parent.width * rightParsed.base) + rightParsed.offset;
      }
      return parent.width - leftPos - rightPos;
    }
  }
  if (width === "shrink") {
    return 0;
  }
  return parent.width;
}
function calculateHeight(height, top, bottom, parent) {
  const parsed = parsePositionValue(height);
  if (parsed && typeof parsed.base === "number") {
    if (parsed.base <= 1 && height?.toString().includes("%")) {
      return Math.floor(parent.height * parsed.base) + parsed.offset;
    } else {
      return parsed.base + parsed.offset;
    }
  }
  if (height === undefined && top !== undefined && bottom !== undefined) {
    const topParsed = parsePositionValue(top);
    const bottomParsed = parsePositionValue(bottom);
    if (topParsed && bottomParsed && typeof topParsed.base === "number" && typeof bottomParsed.base === "number") {
      let topPos = topParsed.base + topParsed.offset;
      let bottomPos = bottomParsed.base + bottomParsed.offset;
      if (top.toString().includes("%")) {
        topPos = Math.floor(parent.height * topParsed.base) + topParsed.offset;
      }
      if (bottom.toString().includes("%")) {
        bottomPos = Math.floor(parent.height * bottomParsed.base) + bottomParsed.offset;
      }
      return parent.height - topPos - bottomPos;
    }
  }
  if (height === "shrink") {
    return 0;
  }
  return parent.height;
}
function calculatePosition(props, parent, contentSize) {
  let width = calculateWidth(props.width, props.left, props.right, parent);
  let height = calculateHeight(props.height, props.top, props.bottom, parent);
  if (props.width === "shrink" && contentSize) {
    width = contentSize.width;
  }
  if (props.height === "shrink" && contentSize) {
    height = contentSize.height;
  }
  const element = { width, height };
  const left = calculateLeft(props.left, props.right, width, parent, element);
  const top = calculateTop(props.top, props.bottom, height, parent, element);
  return { left, top, width, height };
}
function getParentDimensions(parent) {
  if (!parent) {
    return { width: 0, height: 0, left: 0, top: 0 };
  }
  if (parent.cols !== undefined && parent.rows !== undefined) {
    return {
      width: parent.cols,
      height: parent.rows,
      left: 0,
      top: 0
    };
  }
  return {
    width: parent.width || 0,
    height: parent.height || 0,
    left: parent.aleft || parent.left || 0,
    top: parent.atop || parent.top || 0
  };
}
export {
  parsePositionValue,
  getParentDimensions,
  calculateWidth,
  calculateTop,
  calculatePosition,
  calculateLeft,
  calculateHeight
};
