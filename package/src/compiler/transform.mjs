// @bun
// src/compiler/transform.ts
import { isMemberExpression } from "./types";
import { ELEMENT_MAP } from "./index";
var DOM_METHODS = [
  "createElement",
  "createElementNS",
  "createTextNode",
  "createComment",
  "appendChild",
  "insertBefore",
  "removeChild",
  "replaceChild",
  "setAttribute",
  "getAttribute",
  "removeAttribute",
  "addEventListener",
  "removeEventListener"
];
function isDocumentMethodCall(node, methodName) {
  return node.callee.type === "MemberExpression" && node.callee.object.type === "Identifier" && node.callee.object.name === "document" && node.callee.property.type === "Identifier" && node.callee.property.name === methodName;
}
function isElementMethodCall(node, methodName) {
  return node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier" && node.callee.property.name === methodName;
}
function transformCreateElement(node, s) {
  if (isDocumentMethodCall(node, "createElement")) {
    if (node.arguments.length > 0 && node.arguments[0].type === "Literal") {
      const elementType = node.arguments[0].value;
      const terminalType = mapElementType(elementType);
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_createElement("${terminalType}")`);
      }
      return true;
    } else if (node.arguments.length > 0) {
      const arg = node.arguments[0];
      if (arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const elementArg = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_createElement(${elementArg}.toLowerCase() in ${JSON.stringify(ELEMENT_MAP)} ? ${JSON.stringify(ELEMENT_MAP)}[${elementArg}.toLowerCase()] : "box")`);
      }
      return true;
    }
  }
  return false;
}
function mapElementType(elementType) {
  return ELEMENT_MAP[elementType.toLowerCase()] || "box";
}
function transformCreateTextNode(node, s) {
  if (isDocumentMethodCall(node, "createTextNode")) {
    if (node.arguments.length > 0) {
      const arg = node.arguments[0];
      if (arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const contentArg = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_createTextNode(${contentArg})`);
      }
      return true;
    }
  }
  return false;
}
function transformCreateComment(node, s) {
  if (isDocumentMethodCall(node, "createComment")) {
    if (node.arguments.length > 0) {
      const arg = node.arguments[0];
      if (arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const contentArg = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_createComment(${contentArg})`);
      }
      return true;
    }
  }
  return false;
}
function transformAppendChild(node, s) {
  if (isElementMethodCall(node, "appendChild")) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg = node.arguments[0];
      if (objectStart !== undefined && objectEnd !== undefined && arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const argCode = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_appendChild(${objectCode}, ${argCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformInsertBefore(node, s) {
  if (isElementMethodCall(node, "insertBefore")) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg1 = node.arguments[0];
      const arg2 = node.arguments[1];
      if (objectStart !== undefined && objectEnd !== undefined && arg1.start !== undefined && arg1.end !== undefined && arg2.start !== undefined && arg2.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const newNodeCode = s.slice(arg1.start, arg1.end);
        const refNodeCode = s.slice(arg2.start, arg2.end);
        s.overwrite(node.start, node.end, `__sveltui_insertBefore(${objectCode}, ${newNodeCode}, ${refNodeCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformRemoveChild(node, s) {
  if (isElementMethodCall(node, "removeChild")) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg = node.arguments[0];
      if (objectStart !== undefined && objectEnd !== undefined && arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const argCode = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_removeChild(${objectCode}, ${argCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformSetAttribute(node, s) {
  if (isElementMethodCall(node, "setAttribute")) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg1 = node.arguments[0];
      const arg2 = node.arguments[1];
      if (objectStart !== undefined && objectEnd !== undefined && arg1.start !== undefined && arg1.end !== undefined && arg2.start !== undefined && arg2.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const nameCode = s.slice(arg1.start, arg1.end);
        const valueCode = s.slice(arg2.start, arg2.end);
        s.overwrite(node.start, node.end, `__sveltui_setAttribute(${objectCode}, ${nameCode}, ${valueCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformRemoveAttribute(node, s) {
  if (isElementMethodCall(node, "removeAttribute")) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg = node.arguments[0];
      if (objectStart !== undefined && objectEnd !== undefined && arg.start !== undefined && arg.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const nameCode = s.slice(arg.start, arg.end);
        s.overwrite(node.start, node.end, `__sveltui_removeAttribute(${objectCode}, ${nameCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformAddEventListener(node, s) {
  if (isElementMethodCall(node, "addEventListener")) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg1 = node.arguments[0];
      const arg2 = node.arguments[1];
      if (objectStart !== undefined && objectEnd !== undefined && arg1.start !== undefined && arg1.end !== undefined && arg2.start !== undefined && arg2.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const eventCode = s.slice(arg1.start, arg1.end);
        const handlerCode = s.slice(arg2.start, arg2.end);
        s.overwrite(node.start, node.end, `__sveltui_addEventListener(${objectCode}, ${eventCode}, ${handlerCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformRemoveEventListener(node, s) {
  if (isElementMethodCall(node, "removeEventListener")) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee;
      const objectStart = callee.object.start;
      const objectEnd = callee.object.end;
      const arg1 = node.arguments[0];
      const arg2 = node.arguments[1];
      if (objectStart !== undefined && objectEnd !== undefined && arg1.start !== undefined && arg1.end !== undefined && arg2.start !== undefined && arg2.end !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const eventCode = s.slice(arg1.start, arg1.end);
        const handlerCode = s.slice(arg2.start, arg2.end);
        s.overwrite(node.start, node.end, `__sveltui_removeEventListener(${objectCode}, ${eventCode})`);
      }
      return true;
    }
  }
  return false;
}
function transformDOMMethod(node, s) {
  return transformCreateElement(node, s) || transformCreateTextNode(node, s) || transformCreateComment(node, s) || transformAppendChild(node, s) || transformInsertBefore(node, s) || transformRemoveChild(node, s) || transformSetAttribute(node, s) || transformRemoveAttribute(node, s) || transformAddEventListener(node, s) || transformRemoveEventListener(node, s);
}
export {
  transformSetAttribute,
  transformRemoveEventListener,
  transformRemoveChild,
  transformRemoveAttribute,
  transformInsertBefore,
  transformDOMMethod,
  transformCreateTextNode,
  transformCreateElement,
  transformCreateComment,
  transformAppendChild,
  transformAddEventListener,
  DOM_METHODS
};
