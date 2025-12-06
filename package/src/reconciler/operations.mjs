// @bun
// src/reconciler/operations.ts
import { OperationType } from "./index";
import { createElement } from "../dom/factories";
function parseStyleAttribute(styleStr) {
  const result = {};
  const styles = styleStr.split(";");
  for (const style of styles) {
    const [key, value] = style.split(":").map((s) => s.trim());
    if (key && value) {
      const propName = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      result[propName] = value;
    }
  }
  return result;
}
function convertCssToBlessed(cssStyles) {
  const blessedStyle = {};
  for (const [key, value] of Object.entries(cssStyles)) {
    switch (key) {
      case "color":
        blessedStyle.fg = value;
        break;
      case "backgroundColor":
      case "background":
        blessedStyle.bg = value;
        break;
      case "fontWeight":
        if (value === "bold" || value === "700" || value === "800" || value === "900") {
          blessedStyle.bold = true;
        }
        break;
      case "textDecoration":
        if (value.includes("underline")) {
          blessedStyle.underline = true;
        }
        break;
      case "fontStyle":
        if (value === "italic") {
          blessedStyle.italic = true;
        }
        break;
      case "border":
        const borderParts = value.split(" ");
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: "line",
            fg: borderParts[2] || "white"
          };
        }
        break;
      case "borderColor":
        if (!blessedStyle.border) {
          blessedStyle.border = { type: "line" };
        }
        blessedStyle.border.fg = value;
        break;
      case "padding":
      case "margin":
      case "marginTop":
      case "marginRight":
      case "marginBottom":
      case "marginLeft":
        break;
      case "width":
      case "height":
      case "top":
      case "left":
      case "right":
      case "bottom":
        break;
      case "visibility":
        if (value === "hidden") {
          blessedStyle.invisible = true;
        }
        break;
      default:
        break;
    }
  }
  return blessedStyle;
}
function ensureTerminalElement(node, parent) {
  if (node._terminalElement) {
    return node._terminalElement;
  }
  const tag = node.tagName.toLowerCase();
  const props = extractElementProps(node);
  try {
    const element = createElement(tag, props, node);
    if (parent) {
      parent.appendChild(element);
    }
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        const childElement = ensureTerminalElement(child, element);
        if (childElement && !element.children.includes(childElement)) {
          element.appendChild(childElement);
        }
      } else if (child.nodeType === 3) {
        processTextNode(child, element);
      }
    }
    return element;
  } catch (error) {
    if (process.env.DEBUG || tag !== "text") {
      console.error(`Error creating terminal element for ${tag}:`, error);
    }
    return null;
  }
}
function processTextNode(node, parent) {
  const content = node.nodeValue || "";
  if (parent.type === "text" || parent.type === "button" || parent.type === "input") {
    parent.setProps({ ...parent.props, content });
  } else if (parent.type === "box" && content.trim()) {
    const textElement = createElement("text", {
      top: parent.props.top || 0,
      left: parent.props.left || 0,
      bottom: parent.props.bottom || 0,
      right: parent.props.right || 0,
      width: parent.props.width || "100%",
      height: parent.props.height || "100%",
      content: content.trim(),
      fg: parent.props.fg || "white",
      style: parent.props.style
    });
    parent.appendChild(textElement);
    if (parent.blessed && !textElement.blessed) {
      textElement.create(parent.blessed);
    }
  }
}
function updateTerminalElement(node, oldProps, newProps) {
  const element = node._terminalElement;
  if (!element) {
    console.warn(`[Operations] Cannot update terminal element: Element not found for node ${node._instanceId}`);
    return;
  }
  const updatedProps = { ...element.props, ...newProps };
  element.setProps(updatedProps);
}
function deleteTerminalElement(node) {
  if (node.nodeType !== 1) {
    return;
  }
  const elementNode = node;
  const element = elementNode._terminalElement;
  if (!element) {
    console.warn(`[Operations] Cannot delete terminal element: Element not found for node ${node._instanceId}`);
    return;
  }
  element.destroy();
}
function appendTerminalChild(parentNode, childNode) {
  if (parentNode.nodeType !== 1) {
    return;
  }
  const parentElementNode = parentNode;
  const parentElement = parentElementNode._terminalElement;
  if (!parentElement) {
    console.warn(`[Operations] Cannot append child: Parent element not found for node ${parentNode._instanceId}`);
    return;
  }
  if (childNode.nodeType === 1) {
    const childElementNode = childNode;
    const childElement = ensureTerminalElement(childElementNode, parentElement);
    if (!childElement) {
      console.warn(`[Operations] Cannot append child: Failed to create element for node ${childNode._instanceId}`);
      return;
    }
    if (!parentElement.children.includes(childElement)) {
      parentElement.appendChild(childElement);
    }
  } else if (childNode.nodeType === 3) {
    processTextNode(childNode, parentElement);
  }
}
function insertTerminalBefore(parentNode, childNode, referenceNode) {
  if (parentNode.nodeType !== 1) {
    return;
  }
  const parentElementNode = parentNode;
  const parentElement = parentElementNode._terminalElement;
  if (!parentElement) {
    console.warn(`[Operations] Cannot insert child: Parent element not found for node ${parentNode._instanceId}`);
    return;
  }
  if (childNode.nodeType === 1) {
    const childElementNode = childNode;
    const childElement = ensureTerminalElement(childElementNode, parentElement);
    if (!childElement) {
      console.warn(`[Operations] Cannot insert child: Failed to create element for node ${childNode._instanceId}`);
      return;
    }
    if (referenceNode.nodeType === 1) {
      const refElementNode = referenceNode;
      const refElement = refElementNode._terminalElement;
      if (refElement) {
        parentElement.insertBefore(childElement, refElement);
      } else {
        parentElement.appendChild(childElement);
      }
    } else {
      parentElement.appendChild(childElement);
    }
  } else if (childNode.nodeType === 3) {
    processTextNode(childNode, parentElement);
  }
}
function replaceTerminalNode(oldNode, newNode) {
  if (oldNode.nodeType !== 1) {
    return;
  }
  const oldElementNode = oldNode;
  const oldElement = oldElementNode._terminalElement;
  if (!oldElement) {
    console.warn(`[Operations] Cannot replace node: Old element not found for node ${oldNode._instanceId}`);
    return;
  }
  const parentElement = oldElement.parent;
  if (!parentElement) {
    console.warn(`[Operations] Cannot replace node: No parent found for element`);
    return;
  }
  if (newNode.nodeType === 1) {
    const newElementNode = newNode;
    const newElement = ensureTerminalElement(newElementNode);
    if (!newElement) {
      console.warn(`[Operations] Cannot replace node: Failed to create element for node ${newNode._instanceId}`);
      return;
    }
    const index = parentElement.children.indexOf(oldElement);
    if (index !== -1) {
      parentElement.removeChild(oldElement);
      parentElement.appendChild(newElement);
    }
  } else if (newNode.nodeType === 3) {
    const textContent = newNode.nodeValue || "";
    if (parentElement.type === "text" || parentElement.type === "button") {
      parentElement.setProps({ ...parentElement.props, content: textContent });
    }
    parentElement.removeChild(oldElement);
  }
}
function extractElementProps(node) {
  const props = {};
  for (const [name, value] of Object.entries(node.attributes)) {
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (name === "style" && typeof value === "string") {
      const cssStyles = parseStyleAttribute(value);
      props[propName] = convertCssToBlessed(cssStyles);
    } else {
      props[propName] = value;
    }
  }
  const defaultStyle = {
    fg: "white",
    bg: "black",
    border: {
      fg: "white"
    },
    scrollbar: {
      bg: "white"
    },
    focus: {
      bg: "blue"
    },
    hover: {
      bg: "blue"
    }
  };
  const finalStyle = props.style ? { ...defaultStyle, ...props.style } : defaultStyle;
  const result = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "20%",
    height: "5",
    ...props,
    style: finalStyle
  };
  return result;
}
function processOperation(operation) {
  try {
    switch (operation.type) {
      case OperationType.CREATE:
        if (operation.target.nodeType === 1) {
          const parentElement = operation.parent?.nodeType === 1 ? operation.parent._terminalElement : undefined;
          ensureTerminalElement(operation.target, parentElement);
        }
        break;
      case OperationType.UPDATE:
        if (operation.target.nodeType === 1 && operation.oldProps && operation.newProps) {
          updateTerminalElement(operation.target, operation.oldProps, operation.newProps);
        }
        break;
      case OperationType.DELETE:
        deleteTerminalElement(operation.target);
        break;
      case OperationType.APPEND:
        if (operation.child) {
          appendTerminalChild(operation.target, operation.child);
        }
        break;
      case OperationType.INSERT:
        if (operation.child && operation.beforeChild) {
          insertTerminalBefore(operation.target, operation.child, operation.beforeChild);
        }
        break;
      case OperationType.REPLACE:
        if (operation.newNode) {
          replaceTerminalNode(operation.target, operation.newNode);
        }
        break;
      default:
        console.warn(`[Operations] Unknown operation type: ${operation.type}`);
    }
  } catch (error) {
    console.error(`[Operations] Error processing operation ${operation.type}:`, error);
  }
}
export {
  updateTerminalElement,
  replaceTerminalNode,
  processOperation,
  insertTerminalBefore,
  extractElementProps,
  ensureTerminalElement,
  deleteTerminalElement,
  appendTerminalChild
};
