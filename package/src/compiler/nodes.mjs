// @bun
// src/compiler/nodes.ts
import {
  isCallExpression,
  isMemberExpression,
  isIdentifier,
  isAssignmentExpression
} from "./types";
import { transformDOMMethod } from "./transform";
function handleCallExpression(node, s) {
  if (node.callee.type === "MemberExpression") {
    return transformDOMMethod(node, s);
  }
  return false;
}
function handleMemberExpression(node, s) {
  if (node.object.type === "Identifier" && (node.object.name === "document" || node.object.name === "window") && node.property.type === "Identifier") {
    const objectName = node.object.name;
    const propertyName = node.property.name;
    if (objectName === "document" && (propertyName === "body" || propertyName === "head" || propertyName === "documentElement")) {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_root`);
      }
      return true;
    }
    if (objectName === "window") {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_window.${propertyName}`);
      }
      return true;
    }
  }
  return false;
}
function handleIdentifier(node, s) {
  if (node.name === "document" || node.name === "window") {
    const parent = node.parent;
    if (!parent || (parent.type !== "MemberExpression" || parent.object === node) && parent.type !== "ImportSpecifier") {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_${node.name}`);
      }
      return true;
    }
  }
  return false;
}
function handleAssignmentExpression(node, s) {
  if (isMemberExpression(node.left)) {
    const leftNode = node.left;
    if (isIdentifier(leftNode.property) && leftNode.property.name === "textContent") {
      const objectStart = leftNode.object.start;
      const objectEnd = leftNode.object.end;
      const valueStart = node.right.start;
      const valueEnd = node.right.end;
      if (objectStart !== undefined && objectEnd !== undefined && valueStart !== undefined && valueEnd !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const valueCode = s.slice(valueStart, valueEnd);
        s.overwrite(node.start, node.end, `__sveltui_setText(${objectCode}, ${valueCode})`);
      }
      return true;
    }
    if (isIdentifier(leftNode.property) && leftNode.property.name === "innerHTML") {
      const objectStart = leftNode.object.start;
      const objectEnd = leftNode.object.end;
      const valueStart = node.right.start;
      const valueEnd = node.right.end;
      if (objectStart !== undefined && objectEnd !== undefined && valueStart !== undefined && valueEnd !== undefined && node.start !== undefined && node.end !== undefined) {
        const objectCode = s.slice(objectStart, objectEnd);
        const valueCode = s.slice(valueStart, valueEnd);
        s.overwrite(node.start, node.end, `__sveltui_setAttribute(${objectCode}, "content", ${valueCode})`);
      }
      return true;
    }
  }
  return false;
}
function handleClassDeclaration(node, s) {
  if (node.body && node.body.type === "ClassBody") {
    if (node.superClass && node.superClass.type === "Identifier" && node.superClass.name === "HTMLElement") {
      return false;
    }
  }
  return false;
}
function handleNode(node, s) {
  switch (node.type) {
    case "CallExpression":
      return isCallExpression(node) ? handleCallExpression(node, s) : false;
    case "MemberExpression":
      return isMemberExpression(node) ? handleMemberExpression(node, s) : false;
    case "Identifier":
      return isIdentifier(node) ? handleIdentifier(node, s) : false;
    case "AssignmentExpression":
      return isAssignmentExpression(node) ? handleAssignmentExpression(node, s) : false;
    case "ClassDeclaration":
      return handleClassDeclaration(node, s);
    default:
      return false;
  }
}
export {
  handleNode,
  handleMemberExpression,
  handleIdentifier,
  handleClassDeclaration,
  handleCallExpression,
  handleAssignmentExpression
};
