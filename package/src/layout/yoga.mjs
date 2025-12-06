// @bun
// src/layout/yoga.ts
import Yoga from "yoga-layout-prebuilt";
var nodeCache = new WeakMap;
function applyYogaLayout(container, containerWidth, containerHeight, options = {}) {
  const rootNode = createYogaNode(container, options);
  rootNode.setWidth(containerWidth);
  rootNode.setHeight(containerHeight);
  for (const child of container.children) {
    const childNode = createYogaNodeForElement(child, rootNode);
    rootNode.insertChild(childNode, rootNode.getChildCount());
  }
  rootNode.calculateLayout();
  applyLayoutToElements(container, rootNode);
  freeYogaNodes(container);
}
function createYogaNode(element, options = {}) {
  let node = nodeCache.get(element);
  if (!node) {
    node = Yoga.Node.create();
    nodeCache.set(element, node);
  }
  if (options.flexDirection) {
    switch (options.flexDirection) {
      case "row":
        node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
        break;
      case "column":
        node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
        break;
      case "row-reverse":
        node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW_REVERSE);
        break;
      case "column-reverse":
        node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN_REVERSE);
        break;
    }
  }
  if (options.justifyContent) {
    switch (options.justifyContent) {
      case "flex-start":
        node.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
        break;
      case "center":
        node.setJustifyContent(Yoga.JUSTIFY_CENTER);
        break;
      case "flex-end":
        node.setJustifyContent(Yoga.JUSTIFY_FLEX_END);
        break;
      case "space-between":
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
        break;
      case "space-around":
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_AROUND);
        break;
      case "space-evenly":
        node.setJustifyContent(Yoga.JUSTIFY_SPACE_EVENLY);
        break;
    }
  }
  if (options.alignItems) {
    switch (options.alignItems) {
      case "flex-start":
        node.setAlignItems(Yoga.ALIGN_FLEX_START);
        break;
      case "center":
        node.setAlignItems(Yoga.ALIGN_CENTER);
        break;
      case "flex-end":
        node.setAlignItems(Yoga.ALIGN_FLEX_END);
        break;
      case "stretch":
        node.setAlignItems(Yoga.ALIGN_STRETCH);
        break;
      case "baseline":
        node.setAlignItems(Yoga.ALIGN_BASELINE);
        break;
    }
  }
  if (options.flexWrap) {
    switch (options.flexWrap) {
      case "nowrap":
        node.setFlexWrap(Yoga.WRAP_NO_WRAP);
        break;
      case "wrap":
        node.setFlexWrap(Yoga.WRAP_WRAP);
        break;
      case "wrap-reverse":
        node.setFlexWrap(Yoga.WRAP_WRAP_REVERSE);
        break;
    }
  }
  if (options.flexGrow !== undefined) {
    node.setFlexGrow(options.flexGrow);
  }
  if (options.flexShrink !== undefined) {
    node.setFlexShrink(options.flexShrink);
  }
  if (options.padding) {
    if (typeof options.padding === "number") {
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
  if (options.margin) {
    if (typeof options.margin === "number") {
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
  if (options.position) {
    node.setPositionType(options.position === "absolute" ? Yoga.POSITION_TYPE_ABSOLUTE : Yoga.POSITION_TYPE_RELATIVE);
  }
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
function createYogaNodeForElement(element, parentNode) {
  const options = extractLayoutOptions(element);
  const node = createYogaNode(element, options);
  if (typeof element.props.width === "number") {
    node.setWidth(element.props.width);
  } else if (element.props.width === "100%") {
    node.setWidthPercent(100);
  } else if (typeof element.props.width === "string" && element.props.width.endsWith("%")) {
    const percent = parseFloat(element.props.width);
    node.setWidthPercent(percent);
  } else {
    node.setWidthAuto();
  }
  if (typeof element.props.height === "number") {
    node.setHeight(element.props.height);
  } else if (element.props.height === "100%") {
    node.setHeightPercent(100);
  } else if (typeof element.props.height === "string" && element.props.height.endsWith("%")) {
    const percent = parseFloat(element.props.height);
    node.setHeightPercent(percent);
  } else {
    node.setHeightAuto();
  }
  for (const child of element.children) {
    const childNode = createYogaNodeForElement(child, node);
    node.insertChild(childNode, node.getChildCount());
  }
  return node;
}
function extractLayoutOptions(element) {
  const props = element.props;
  return {
    flexDirection: props.flexDirection,
    justifyContent: props.justifyContent,
    alignItems: props.alignItems,
    alignContent: props.alignContent,
    alignSelf: props.alignSelf,
    flexGrow: props.flexGrow,
    flexShrink: props.flexShrink,
    flexBasis: props.flexBasis,
    flexWrap: props.flexWrap,
    padding: props.padding,
    margin: props.margin,
    position: props.position
  };
}
function applyLayoutToElements(container, node) {
  const left = Math.round(node.getComputedLeft());
  const top = Math.round(node.getComputedTop());
  const width = Math.round(node.getComputedWidth());
  const height = Math.round(node.getComputedHeight());
  for (let i = 0;i < container.children.length; i++) {
    const child = container.children[i];
    const childNode = node.getChild(i);
    const childLeft = Math.round(childNode.getComputedLeft());
    const childTop = Math.round(childNode.getComputedTop());
    const childWidth = Math.round(childNode.getComputedWidth());
    const childHeight = Math.round(childNode.getComputedHeight());
    child.setProps({
      ...child.props,
      left: childLeft,
      top: childTop,
      width: childWidth,
      height: childHeight
    });
    if (child.children.length > 0) {
      applyLayoutToElements(child, childNode);
    }
  }
}
function freeYogaNodes(container) {
  for (const child of container.children) {
    freeYogaNodes(child);
  }
  const node = nodeCache.get(container);
  if (node) {
    node.free();
    nodeCache.delete(container);
  }
}
export {
  applyYogaLayout
};
