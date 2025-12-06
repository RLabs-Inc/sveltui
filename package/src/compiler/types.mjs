// @bun
// src/compiler/types.ts
function isCallExpression(node) {
  return node.type === "CallExpression";
}
function isMemberExpression(node) {
  return node.type === "MemberExpression";
}
function isIdentifier(node) {
  return node.type === "Identifier";
}
function isAssignmentExpression(node) {
  return node.type === "AssignmentExpression";
}
export {
  isMemberExpression,
  isIdentifier,
  isCallExpression,
  isAssignmentExpression
};
