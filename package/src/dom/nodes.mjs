// @bun
// src/dom/nodes.ts
var NodeType;
((NodeType2) => {
  NodeType2[NodeType2["ELEMENT"] = 1] = "ELEMENT";
  NodeType2[NodeType2["TEXT"] = 3] = "TEXT";
  NodeType2[NodeType2["COMMENT"] = 8] = "COMMENT";
  NodeType2[NodeType2["DOCUMENT"] = 9] = "DOCUMENT";
  NodeType2[NodeType2["FRAGMENT"] = 11] = "FRAGMENT";
})(NodeType ||= {});
function createDocument() {
  throw new Error("Use document.ts createDocument implementation instead");
}
var nextNodeId = 1;
function generateNodeId() {
  return nextNodeId++;
}
export {
  generateNodeId,
  createDocument,
  NodeType
};
