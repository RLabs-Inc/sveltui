// @bun
// src/core/layout/yoga-helpers.ts
import { yogaNodes } from '../state/engine.svelte.js';
function getParentIndex(index) {
  const node = yogaNodes[index];
  if (!node)
    return null;
  const parentNode = node.getParent();
  if (!parentNode)
    return -1;
  for (let i = 0;i < yogaNodes.length; i++) {
    if (yogaNodes[i] === parentNode) {
      return i;
    }
  }
  return null;
}
function getChildIndices(index) {
  const node = yogaNodes[index];
  if (!node)
    return [];
  const count = node.getChildCount();
  const children = [];
  for (let i = 0;i < count; i++) {
    const childNode = node.getChild(i);
    if (!childNode)
      continue;
    for (let j = 0;j < yogaNodes.length; j++) {
      if (yogaNodes[j] === childNode) {
        children.push(j);
        break;
      }
    }
  }
  return children;
}
function getAbsolutePosition(index) {
  const node = yogaNodes[index];
  if (!node)
    return { x: 0, y: 0 };
  const layout = node.getComputedLayout();
  let x = Math.round(layout.left);
  let y = Math.round(layout.top);
  const parentNode = node.getParent();
  if (parentNode) {
    for (let i = 0;i < yogaNodes.length; i++) {
      if (yogaNodes[i] === parentNode) {
        const parentAbsolute = getAbsolutePosition(i);
        x += parentAbsolute.x;
        y += parentAbsolute.y;
        break;
      }
    }
  }
  return { x, y };
}
function getComputedDimensions(index) {
  const node = yogaNodes[index];
  if (!node)
    return { width: 0, height: 0 };
  return {
    width: Math.round(node.getComputedWidth()),
    height: Math.round(node.getComputedHeight())
  };
}
function needsLayout(index) {
  const node = yogaNodes[index];
  if (!node)
    return false;
  return node.isDirty() || node.hasNewLayout();
}
function getStyleValue(index, property) {
  const node = yogaNodes[index];
  if (!node)
    return null;
  switch (property) {
    case "width":
      return node.getWidth();
    case "height":
      return node.getHeight();
    case "flexBasis":
      return node.getFlexBasis();
    default:
      return null;
  }
}
function getDisplay(index) {
  const node = yogaNodes[index];
  if (!node)
    return 0;
  return node.getDisplay();
}
function getPositionType(index) {
  const node = yogaNodes[index];
  if (!node)
    return 1;
  return node.getPositionType();
}
function markDirtyRecursive(index) {
  const node = yogaNodes[index];
  if (!node)
    return;
  node.markDirty();
  const count = node.getChildCount();
  for (let i = 0;i < count; i++) {
    const child = node.getChild(i);
    if (child) {
      for (let j = 0;j < yogaNodes.length; j++) {
        if (yogaNodes[j] === child) {
          markDirtyRecursive(j);
          break;
        }
      }
    }
  }
}
function getComputedSpacing(index, type, edge) {
  const node = yogaNodes[index];
  if (!node)
    return 0;
  switch (type) {
    case "margin":
      return node.getComputedMargin(edge);
    case "padding":
      return node.getComputedPadding(edge);
    case "border":
      return node.getComputedBorder(edge);
    default:
      return 0;
  }
}
export {
  needsLayout,
  markDirtyRecursive,
  getStyleValue,
  getPositionType,
  getParentIndex,
  getDisplay,
  getComputedSpacing,
  getComputedDimensions,
  getChildIndices,
  getAbsolutePosition
};
