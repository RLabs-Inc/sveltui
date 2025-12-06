// @bun
// src/layout/index.ts
export * from './reactive-layout.svelte.js';
export * from './layout-context.svelte.js';
export * from "./layout-utils";
var LayoutDirection;
((LayoutDirection2) => {
  LayoutDirection2["ROW"] = "row";
  LayoutDirection2["COLUMN"] = "column";
})(LayoutDirection ||= {});
var LayoutJustify;
((LayoutJustify2) => {
  LayoutJustify2["START"] = "start";
  LayoutJustify2["CENTER"] = "center";
  LayoutJustify2["END"] = "end";
  LayoutJustify2["SPACE_BETWEEN"] = "space-between";
  LayoutJustify2["SPACE_AROUND"] = "space-around";
})(LayoutJustify ||= {});
var LayoutAlign;
((LayoutAlign2) => {
  LayoutAlign2["START"] = "start";
  LayoutAlign2["CENTER"] = "center";
  LayoutAlign2["END"] = "end";
  LayoutAlign2["STRETCH"] = "stretch";
})(LayoutAlign ||= {});
function applyLayout(container, options = {}) {
  const width = getElementWidth(container);
  const height = getElementHeight(container);
  const containerWidth = typeof width === "number" ? width : width === "100%" ? container.blessed?.screen?.width || 80 : parseInt(width) || 80;
  const containerHeight = typeof height === "number" ? height : height === "100%" ? container.blessed?.screen?.height || 24 : parseInt(height) || 24;
  const padding = calculatePadding(options.padding);
  const context = {
    containerWidth,
    containerHeight,
    availableWidth: containerWidth - padding.left - padding.right,
    availableHeight: containerHeight - padding.top - padding.bottom,
    startX: padding.left,
    startY: padding.top,
    options: {
      direction: options.direction || "column" /* COLUMN */,
      justifyContent: options.justifyContent || "start" /* START */,
      alignItems: options.alignItems || "start" /* START */,
      wrap: options.wrap || false,
      gap: options.gap || 0,
      padding: options.padding
    }
  };
  if (context.availableWidth <= 0 || context.availableHeight <= 0) {
    return;
  }
  layoutChildren(container, context);
}
function layoutChildren(container, context) {
  if (container.children.length === 0) {
    return;
  }
  const positions = context.options.direction === "row" /* ROW */ ? layoutRow(container.children, context) : layoutColumn(container.children, context);
  for (let i = 0;i < container.children.length; i++) {
    const child = container.children[i];
    const position = positions[i];
    child.setProps({
      ...child.props,
      left: context.startX + position.x,
      top: context.startY + position.y,
      width: position.width,
      height: position.height
    });
  }
}
function layoutRow(items, context) {
  const positions = [];
  const gap = context.options.gap || 0;
  const totalGap = (items.length - 1) * gap;
  let totalFixedWidth = 0;
  let flexItems = 0;
  for (const item of items) {
    const width = getElementWidth(item);
    if (typeof width === "number") {
      totalFixedWidth += width;
    } else {
      flexItems++;
    }
  }
  const remainingWidth = context.availableWidth - totalFixedWidth - totalGap;
  const flexWidth = flexItems > 0 ? Math.max(1, Math.floor(remainingWidth / flexItems)) : 0;
  let x = 0;
  for (const item of items) {
    const width = typeof getElementWidth(item) === "number" ? getElementWidth(item) : flexWidth;
    const height = typeof getElementHeight(item) === "number" ? getElementHeight(item) : context.availableHeight;
    let y = 0;
    if (context.options.alignItems === "center" /* CENTER */) {
      y = Math.floor((context.availableHeight - height) / 2);
    } else if (context.options.alignItems === "end" /* END */) {
      y = context.availableHeight - height;
    }
    positions.push({ x, y, width, height });
    x += width + gap;
  }
  applyJustification(positions, context.availableWidth, context.options.justifyContent);
  return positions;
}
function layoutColumn(items, context) {
  const positions = [];
  const gap = context.options.gap || 0;
  const totalGap = (items.length - 1) * gap;
  let totalFixedHeight = 0;
  let flexItems = 0;
  for (const item of items) {
    const height = getElementHeight(item);
    if (typeof height === "number") {
      totalFixedHeight += height;
    } else {
      flexItems++;
    }
  }
  const remainingHeight = context.availableHeight - totalFixedHeight - totalGap;
  const flexHeight = flexItems > 0 ? Math.max(1, Math.floor(remainingHeight / flexItems)) : 0;
  let y = 0;
  for (const item of items) {
    const width = typeof getElementWidth(item) === "number" ? getElementWidth(item) : context.availableWidth;
    const height = typeof getElementHeight(item) === "number" ? getElementHeight(item) : flexHeight;
    let x = 0;
    if (context.options.alignItems === "center" /* CENTER */) {
      x = Math.floor((context.availableWidth - width) / 2);
    } else if (context.options.alignItems === "end" /* END */) {
      x = context.availableWidth - width;
    }
    positions.push({ x, y, width, height });
    y += height + gap;
  }
  applyVerticalJustification(positions, context.availableHeight, context.options.justifyContent);
  return positions;
}
function applyJustification(positions, availableWidth, justify) {
  if (!positions.length)
    return;
  const totalWidth = positions.reduce((sum, pos) => sum + pos.width, 0);
  const lastPos = positions[positions.length - 1];
  const totalContentWidth = lastPos.x + lastPos.width - positions[0].x;
  const remainingSpace = availableWidth - totalContentWidth;
  if (remainingSpace <= 0)
    return;
  if (justify === "center" /* CENTER */) {
    const offset = Math.floor(remainingSpace / 2);
    for (const pos of positions) {
      pos.x += offset;
    }
  } else if (justify === "end" /* END */) {
    const offset = remainingSpace;
    for (const pos of positions) {
      pos.x += offset;
    }
  } else if (justify === "space-between" /* SPACE_BETWEEN */ && positions.length > 1) {
    const gap = Math.floor(remainingSpace / (positions.length - 1));
    for (let i = 1;i < positions.length; i++) {
      positions[i].x += gap * i;
    }
  } else if (justify === "space-around" /* SPACE_AROUND */ && positions.length > 0) {
    const gap = Math.floor(remainingSpace / (positions.length * 2));
    for (let i = 0;i < positions.length; i++) {
      positions[i].x += gap * (2 * i + 1);
    }
  }
}
function applyVerticalJustification(positions, availableHeight, justify) {
  if (!positions.length)
    return;
  const totalHeight = positions.reduce((sum, pos) => sum + pos.height, 0);
  const lastPos = positions[positions.length - 1];
  const totalContentHeight = lastPos.y + lastPos.height - positions[0].y;
  const remainingSpace = availableHeight - totalContentHeight;
  if (remainingSpace <= 0)
    return;
  if (justify === "center" /* CENTER */) {
    const offset = Math.floor(remainingSpace / 2);
    for (const pos of positions) {
      pos.y += offset;
    }
  } else if (justify === "end" /* END */) {
    const offset = remainingSpace;
    for (const pos of positions) {
      pos.y += offset;
    }
  } else if (justify === "space-between" /* SPACE_BETWEEN */ && positions.length > 1) {
    const gap = Math.floor(remainingSpace / (positions.length - 1));
    for (let i = 1;i < positions.length; i++) {
      positions[i].y += gap * i;
    }
  } else if (justify === "space-around" /* SPACE_AROUND */ && positions.length > 0) {
    const gap = Math.floor(remainingSpace / (positions.length * 2));
    for (let i = 0;i < positions.length; i++) {
      positions[i].y += gap * (2 * i + 1);
    }
  }
}
function calculatePadding(padding) {
  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding };
  } else if (padding) {
    return {
      top: padding.top || 0,
      right: padding.right || 0,
      bottom: padding.bottom || 0,
      left: padding.left || 0
    };
  } else {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}
function getElementWidth(element) {
  return element.props.width || "100%";
}
function getElementHeight(element) {
  return element.props.height || "100%";
}
function percentToPixels(value, total) {
  if (value.endsWith("%")) {
    const percent = parseFloat(value);
    return Math.floor(percent / 100 * total);
  }
  return 0;
}
function resolveWidth(element, containerWidth) {
  const width = element.props.width;
  if (typeof width === "number") {
    return width;
  } else if (typeof width === "string") {
    if (width === "100%") {
      return containerWidth;
    } else if (width === "half") {
      return Math.floor(containerWidth / 2);
    } else if (width.endsWith("%")) {
      return percentToPixels(width, containerWidth);
    }
  }
  return containerWidth;
}
function resolveHeight(element, containerHeight) {
  const height = element.props.height;
  if (typeof height === "number") {
    return height;
  } else if (typeof height === "string") {
    if (height === "100%") {
      return containerHeight;
    } else if (height === "half") {
      return Math.floor(containerHeight / 2);
    } else if (height.endsWith("%")) {
      return percentToPixels(height, containerHeight);
    }
  }
  return containerHeight;
}
export {
  resolveWidth,
  resolveHeight,
  percentToPixels,
  applyLayout,
  LayoutJustify,
  LayoutDirection,
  LayoutAlign
};
