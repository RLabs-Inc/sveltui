// @bun
// src/dom/position-utils.ts
function parsePositionExpression(value) {
  if (typeof value === "number") {
    return { base: value, offset: 0 };
  }
  if (value === "center") {
    return { base: "center", offset: 0 };
  }
  if (value === "half") {
    return { base: 50, offset: 0 };
  }
  const expr = value.split(/(?=\+|-)/);
  const baseStr = expr[0];
  const offset = +(expr[1] || 0);
  if (baseStr.endsWith("%")) {
    const percent = +baseStr.slice(0, -1);
    return { base: percent, offset };
  }
  return { base: +baseStr, offset };
}
function calculateHorizontalPosition(value, context, isWidth = false) {
  if (value === undefined || value === null) {
    return isWidth ? "shrink" : 0;
  }
  if (value === "shrink" && isWidth) {
    return "shrink";
  }
  const expr = parsePositionExpression(value);
  if (expr.base === "center") {
    if (isWidth) {
      return context.parentWidth;
    }
    const elementWidth = context.elementWidth || 0;
    const centered = Math.floor((context.parentWidth - elementWidth) / 2);
    return centered + expr.offset;
  }
  if (typeof expr.base === "number" && value.toString().includes("%")) {
    const baseValue = Math.floor(context.parentWidth * (expr.base / 100));
    return baseValue + expr.offset;
  }
  if (typeof expr.base === "number") {
    return expr.base + expr.offset;
  }
  return value;
}
function calculateVerticalPosition(value, context, isHeight = false) {
  if (value === undefined || value === null) {
    return isHeight ? "shrink" : 0;
  }
  if (value === "shrink" && isHeight) {
    return "shrink";
  }
  const expr = parsePositionExpression(value);
  if (expr.base === "center") {
    if (isHeight) {
      return context.parentHeight;
    }
    const elementHeight = context.elementHeight || 0;
    const centered = Math.floor((context.parentHeight - elementHeight) / 2);
    return centered + expr.offset;
  }
  if (typeof expr.base === "number" && value.toString().includes("%")) {
    const baseValue = Math.floor(context.parentHeight * (expr.base / 100));
    return baseValue + expr.offset;
  }
  if (typeof expr.base === "number") {
    return expr.base + expr.offset;
  }
  return value;
}
function calculateElementPosition(props, parent, contentSize) {
  let parentWidth = 0;
  let parentHeight = 0;
  if (parent) {
    if ("cols" in parent && typeof parent.cols === "number") {
      parentWidth = parent.cols;
    } else if ("width" in parent && typeof parent.width === "number") {
      parentWidth = parent.width;
    } else if ("screen" in parent && parent.screen) {
      parentWidth = parent.screen.cols || parent.screen.width;
    }
    if ("rows" in parent && typeof parent.rows === "number") {
      parentHeight = parent.rows;
    } else if ("height" in parent && typeof parent.height === "number") {
      parentHeight = parent.height;
    } else if ("screen" in parent && parent.screen) {
      parentHeight = parent.screen.rows || parent.screen.height;
    }
  }
  const context = {
    parentWidth,
    parentHeight,
    elementWidth: contentSize?.width,
    elementHeight: contentSize?.height
  };
  let width;
  if (props.width !== undefined) {
    width = calculateHorizontalPosition(props.width, context, true);
  } else if (props.left !== undefined && props.right !== undefined) {
    const left2 = calculateHorizontalPosition(props.left, context, false);
    const right = calculateHorizontalPosition(props.right, context, false);
    if (typeof left2 === "number" && typeof right === "number") {
      width = parentWidth - left2 - right;
    } else {
      width = "shrink";
    }
  } else if (contentSize && (props.width === "shrink" || props.width === undefined)) {
    width = contentSize.width;
  } else {
    width = props.width || "shrink";
  }
  let height;
  if (props.height !== undefined) {
    height = calculateVerticalPosition(props.height, context, true);
  } else if (props.top !== undefined && props.bottom !== undefined) {
    const top2 = calculateVerticalPosition(props.top, context, false);
    const bottom = calculateVerticalPosition(props.bottom, context, false);
    if (typeof top2 === "number" && typeof bottom === "number") {
      height = parentHeight - top2 - bottom;
    } else {
      height = "shrink";
    }
  } else if (contentSize && (props.height === "shrink" || props.height === undefined)) {
    height = contentSize.height;
  } else {
    height = props.height || "shrink";
  }
  if (typeof width === "number") {
    context.elementWidth = width;
  }
  if (typeof height === "number") {
    context.elementHeight = height;
  }
  let left;
  if (props.left !== undefined) {
    left = calculateHorizontalPosition(props.left, context, false);
  } else if (props.right !== undefined) {
    const right = calculateHorizontalPosition(props.right, context, false);
    if (typeof right === "number" && typeof width === "number") {
      left = parentWidth - width - right;
    } else {
      left = 0;
    }
  } else {
    left = 0;
  }
  let top;
  if (props.top !== undefined) {
    top = calculateVerticalPosition(props.top, context, false);
  } else if (props.bottom !== undefined) {
    const bottom = calculateVerticalPosition(props.bottom, context, false);
    if (typeof bottom === "number" && typeof height === "number") {
      top = parentHeight - height - bottom;
    } else {
      top = 0;
    }
  } else {
    top = 0;
  }
  const result = { top, left, width, height };
  if (props.right !== undefined)
    result.right = props.right;
  if (props.bottom !== undefined)
    result.bottom = props.bottom;
  return result;
}
function getParentDimensions(parent) {
  if (!parent) {
    return { width: 0, height: 0 };
  }
  let width = 0;
  let height = 0;
  if ("cols" in parent && typeof parent.cols === "number") {
    width = parent.cols;
  } else if ("width" in parent && typeof parent.width === "number") {
    width = parent.width;
  } else if ("_getWidth" in parent && typeof parent._getWidth === "function") {
    width = parent._getWidth();
  } else if ("screen" in parent && parent.screen) {
    width = parent.screen.cols || parent.screen.width;
  }
  if ("rows" in parent && typeof parent.rows === "number") {
    height = parent.rows;
  } else if ("height" in parent && typeof parent.height === "number") {
    height = parent.height;
  } else if ("_getHeight" in parent && typeof parent._getHeight === "function") {
    height = parent._getHeight();
  } else if ("screen" in parent && parent.screen) {
    height = parent.screen.rows || parent.screen.height;
  }
  return { width, height };
}
export {
  parsePositionExpression,
  getParentDimensions,
  calculateVerticalPosition,
  calculateHorizontalPosition,
  calculateElementPosition
};
