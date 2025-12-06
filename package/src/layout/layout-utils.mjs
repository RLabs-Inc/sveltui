// @bun
// src/layout/layout-utils.ts
var LayoutPattern;
((LayoutPattern2) => {
  LayoutPattern2["VERTICAL_STACK"] = "vertical_stack";
  LayoutPattern2["HORIZONTAL_STACK"] = "horizontal_stack";
  LayoutPattern2["GRID"] = "grid";
  LayoutPattern2["WRAP"] = "wrap";
  LayoutPattern2["ABSOLUTE"] = "absolute";
  LayoutPattern2["CENTER"] = "center";
  LayoutPattern2["FILL"] = "fill";
})(LayoutPattern ||= {});
function calculatePatternLayout(elements, pattern, containerWidth, containerHeight, options = {}) {
  switch (pattern) {
    case "vertical_stack" /* VERTICAL_STACK */:
      return calculateVerticalStack(elements, containerWidth, containerHeight, options);
    case "horizontal_stack" /* HORIZONTAL_STACK */:
      return calculateHorizontalStack(elements, containerWidth, containerHeight, options);
    case "grid" /* GRID */:
      return calculateGridLayout(elements, containerWidth, containerHeight, options);
    case "wrap" /* WRAP */:
      return calculateWrapLayout(elements, containerWidth, containerHeight, options);
    case "center" /* CENTER */:
      return calculateCenterLayout(elements, containerWidth, containerHeight, options);
    case "fill" /* FILL */:
      return calculateFillLayout(elements, containerWidth, containerHeight, options);
    default:
      return elements.map((el) => ({
        x: el.props.left || 0,
        y: el.props.top || 0,
        width: el.props.width || containerWidth,
        height: el.props.height || containerHeight
      }));
  }
}
function calculateVerticalStack(elements, containerWidth, containerHeight, options = {}) {
  const gap = options.gap || 0;
  const padding = options.padding || 0;
  const positions = [];
  let currentY = padding;
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  let totalFixedHeight = 0;
  let flexItems = 0;
  for (const element of elements) {
    if (typeof element.props.height === "number") {
      totalFixedHeight += element.props.height;
    } else {
      flexItems++;
    }
  }
  const totalGaps = Math.max(0, elements.length - 1) * gap;
  const remainingHeight = availableHeight - totalFixedHeight - totalGaps;
  const flexHeight = flexItems > 0 ? Math.max(1, Math.floor(remainingHeight / flexItems)) : 0;
  for (const element of elements) {
    const width = typeof element.props.width === "number" ? Math.min(element.props.width, availableWidth) : availableWidth;
    const height = typeof element.props.height === "number" ? element.props.height : flexHeight;
    const x = padding + Math.floor((availableWidth - width) / 2);
    positions.push({ x, y: currentY, width, height });
    currentY += height + gap;
  }
  return positions;
}
function calculateHorizontalStack(elements, containerWidth, containerHeight, options = {}) {
  const gap = options.gap || 0;
  const padding = options.padding || 0;
  const positions = [];
  let currentX = padding;
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  let totalFixedWidth = 0;
  let flexItems = 0;
  for (const element of elements) {
    if (typeof element.props.width === "number") {
      totalFixedWidth += element.props.width;
    } else {
      flexItems++;
    }
  }
  const totalGaps = Math.max(0, elements.length - 1) * gap;
  const remainingWidth = availableWidth - totalFixedWidth - totalGaps;
  const flexWidth = flexItems > 0 ? Math.max(1, Math.floor(remainingWidth / flexItems)) : 0;
  for (const element of elements) {
    const width = typeof element.props.width === "number" ? element.props.width : flexWidth;
    const height = typeof element.props.height === "number" ? Math.min(element.props.height, availableHeight) : availableHeight;
    const y = padding + Math.floor((availableHeight - height) / 2);
    positions.push({ x: currentX, y, width, height });
    currentX += width + gap;
  }
  return positions;
}
function calculateGridLayout(elements, containerWidth, containerHeight, options) {
  const { columns, gap = 0 } = options;
  const padding = gap;
  const positions = [];
  const availableWidth = containerWidth - padding * 2 - gap * (columns - 1);
  const availableHeight = containerHeight - padding * 2;
  const cellWidth = options.cellWidth || Math.floor(availableWidth / columns);
  const rows = options.rows || Math.ceil(elements.length / columns);
  const cellHeight = options.cellHeight || Math.floor((availableHeight - gap * (rows - 1)) / rows);
  for (let i = 0;i < elements.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = padding + col * (cellWidth + gap);
    const y = padding + row * (cellHeight + gap);
    positions.push({ x, y, width: cellWidth, height: cellHeight });
  }
  return positions;
}
function calculateWrapLayout(elements, containerWidth, containerHeight, options = {}) {
  const gap = options.gap || 1;
  const padding = options.padding || 0;
  const positions = [];
  const availableWidth = containerWidth - padding * 2;
  let currentX = padding;
  let currentY = padding;
  let rowHeight = 0;
  for (const element of elements) {
    const width = options.itemWidth || (typeof element.props.width === "number" ? element.props.width : 10);
    const height = typeof element.props.height === "number" ? element.props.height : 3;
    if (currentX + width > containerWidth - padding && currentX > padding) {
      currentX = padding;
      currentY += rowHeight + gap;
      rowHeight = 0;
    }
    positions.push({ x: currentX, y: currentY, width, height });
    currentX += width + gap;
    rowHeight = Math.max(rowHeight, height);
  }
  return positions;
}
function calculateCenterLayout(elements, containerWidth, containerHeight, options = {}) {
  const gap = options.gap || 1;
  const positions = [];
  let totalHeight = 0;
  const heights = [];
  for (const element of elements) {
    const height = typeof element.props.height === "number" ? element.props.height : 3;
    heights.push(height);
    totalHeight += height;
  }
  totalHeight += gap * (elements.length - 1);
  let currentY = Math.floor((containerHeight - totalHeight) / 2);
  for (let i = 0;i < elements.length; i++) {
    const element = elements[i];
    const width = typeof element.props.width === "number" ? element.props.width : Math.floor(containerWidth * 0.8);
    const height = heights[i];
    const x = Math.floor((containerWidth - width) / 2);
    positions.push({ x, y: currentY, width, height });
    currentY += height + gap;
  }
  return positions;
}
function calculateFillLayout(elements, containerWidth, containerHeight, options = {}) {
  const direction = options.direction || "vertical";
  const positions = [];
  if (elements.length === 0)
    return positions;
  if (direction === "vertical") {
    const itemHeight = Math.floor(containerHeight / elements.length);
    const remainder = containerHeight % elements.length;
    let currentY = 0;
    for (let i = 0;i < elements.length; i++) {
      const height = itemHeight + (i < remainder ? 1 : 0);
      positions.push({
        x: 0,
        y: currentY,
        width: containerWidth,
        height
      });
      currentY += height;
    }
  } else {
    const itemWidth = Math.floor(containerWidth / elements.length);
    const remainder = containerWidth % elements.length;
    let currentX = 0;
    for (let i = 0;i < elements.length; i++) {
      const width = itemWidth + (i < remainder ? 1 : 0);
      positions.push({
        x: currentX,
        y: 0,
        width,
        height: containerHeight
      });
      currentX += width;
    }
  }
  return positions;
}
function applyConstraints(position, constraints, containerWidth, containerHeight) {
  let { x, y, width, height } = position;
  if (constraints.minWidth !== undefined) {
    width = Math.max(width, constraints.minWidth);
  }
  if (constraints.maxWidth !== undefined) {
    width = Math.min(width, constraints.maxWidth);
  }
  if (constraints.minHeight !== undefined) {
    height = Math.max(height, constraints.minHeight);
  }
  if (constraints.maxHeight !== undefined) {
    height = Math.min(height, constraints.maxHeight);
  }
  if (constraints.aspectRatio !== undefined) {
    const currentRatio = width / height;
    if (currentRatio > constraints.aspectRatio) {
      width = Math.floor(height * constraints.aspectRatio);
    } else if (currentRatio < constraints.aspectRatio) {
      height = Math.floor(width / constraints.aspectRatio);
    }
  }
  width = Math.min(width, containerWidth - x);
  height = Math.min(height, containerHeight - y);
  if (x + width > containerWidth) {
    x = Math.max(0, containerWidth - width);
  }
  if (y + height > containerHeight) {
    y = Math.max(0, containerHeight - height);
  }
  return { x, y, width, height };
}
function calculateRelativePosition(element, relativeTo, offset = {}) {
  const relativePos = {
    x: relativeTo.props.left || 0,
    y: relativeTo.props.top || 0
  };
  const relativeSize = {
    width: relativeTo.props.width || 0,
    height: relativeTo.props.height || 0
  };
  let x = relativePos.x + (offset.x || 0);
  let y = relativePos.y + (offset.y || 0);
  if (element.props.left === "after") {
    x = relativePos.x + (typeof relativeSize.width === "number" ? relativeSize.width : 0);
  } else if (element.props.left === "before") {
    x = relativePos.x - (typeof element.props.width === "number" ? element.props.width : 0);
  }
  if (element.props.top === "below") {
    y = relativePos.y + (typeof relativeSize.height === "number" ? relativeSize.height : 0);
  } else if (element.props.top === "above") {
    y = relativePos.y - (typeof element.props.height === "number" ? element.props.height : 0);
  }
  return { x, y };
}
function calculateResponsiveDimensions(screenWidth, screenHeight, breakpoints) {
  const SMALL = 40;
  const MEDIUM = 80;
  let config = breakpoints.large || {};
  if (screenWidth < SMALL) {
    config = breakpoints.small || config;
  } else if (screenWidth < MEDIUM) {
    config = breakpoints.medium || config;
  }
  return {
    width: config.width || "100%",
    height: config.height || "100%"
  };
}
var layoutHelpers = {
  modal: (width = "80%", height = "60%") => ({
    position: "absolute",
    left: "center",
    top: "center",
    width,
    height
  }),
  fullscreen: () => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  }),
  sidebar: (side = "left", width = 20) => ({
    position: "absolute",
    [side]: 0,
    top: 0,
    width,
    height: "100%"
  }),
  bar: (position = "top", height = 3) => ({
    position: "absolute",
    left: 0,
    [position]: 0,
    width: "100%",
    height
  })
};
export {
  layoutHelpers,
  calculateResponsiveDimensions,
  calculateRelativePosition,
  calculatePatternLayout,
  applyConstraints,
  LayoutPattern
};
