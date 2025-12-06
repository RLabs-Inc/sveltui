// @bun
// src/compiler/index.ts
import { walk } from "estree-walker";
import MagicString from "magic-string";
import { parse } from "acorn";
import { handleNode } from "./nodes";
import { transformDOMMethod } from "./transform";
import { isCallExpression } from "./types";
var DEFAULT_OPTIONS = {
  debug: false,
  sourcemap: true,
  customElements: {},
  terminalEvents: [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "keydown",
    "keyup",
    "keypress",
    "focus",
    "blur",
    "select",
    "submit",
    "change"
  ],
  additionalImports: {
    "svelte/internal": "svelte/internal"
  }
};
function sveltuiPlugin(userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  return {
    name: "sveltui",
    transform(code, id) {
      if (!id.endsWith(".svelte") && !id.endsWith(".svelte.ts")) {
        return null;
      }
      if (options.debug) {}
      const s = new MagicString(code);
      try {
        const ast = parse(code, {
          ecmaVersion: 2020,
          sourceType: "module"
        });
        const runtimePath = getRelativeImportPath(id, "../api/runtime");
        s.prepend(`
// SvelTUI runtime imports
import {
  __sveltui_createElement,
  __sveltui_createTextNode,
  __sveltui_createComment,
  __sveltui_appendChild,
  __sveltui_insertBefore,
  __sveltui_removeChild,
  __sveltui_setAttribute,
  __sveltui_removeAttribute,
  __sveltui_setText,
  __sveltui_addEventListener,
  __sveltui_removeEventListener,
  __sveltui_document,
  __sveltui_window,
  __sveltui_root
} from '${runtimePath}';

`);
        transformCode(ast, s, options);
        const map = options.sourcemap ? s.generateMap({ hires: true }) : null;
        return {
          code: s.toString(),
          map
        };
      } catch (error) {
        console.error(`[SvelTUI] Error processing ${id}:`, error);
        return null;
      }
    }
  };
}
function getRelativeImportPath(sourceFilePath, targetModule) {
  let runtimePath = targetModule;
  if (sourceFilePath.includes("/src/components/")) {
    runtimePath = "../../api/runtime";
  } else if (sourceFilePath.includes("/examples/")) {
    runtimePath = "../src/api/runtime";
  } else if (sourceFilePath.includes("/src/")) {
    const parts = sourceFilePath.split("/src/")[1].split("/");
    const depth = parts.length - 1;
    runtimePath = "../".repeat(depth) + "api/runtime";
  }
  return runtimePath;
}
function transformCode(ast, s, options) {
  const replacedOperations = new Set;
  replaceGlobalReferences(s, ast);
  walk(ast, {
    enter(node, parent) {
      const extNode = node;
      extNode.parent = parent;
      if (options.debug) {}
      if (handleNode(extNode, s)) {
        return;
      }
      if (isCallExpression(extNode)) {
        if (transformDOMMethod(extNode, s)) {
          const callee = extNode.callee;
          if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
            replacedOperations.add(callee.property.name);
          }
        }
      }
    }
  });
  appendInitializationCode(s, options);
}
function replaceGlobalReferences(s, ast) {
  walk(ast, {
    enter(node, parent) {
      const extNode = node;
      extNode.parent = parent;
      if (extNode.type === "Identifier") {
        const idNode = extNode;
        if ((idNode.name === "document" || idNode.name === "window") && !(idNode.parent?.type === "MemberExpression" && idNode.parent.property === idNode) && !(idNode.parent?.type === "ImportSpecifier")) {
          if (idNode.start !== undefined && idNode.end !== undefined) {
            s.overwrite(idNode.start, idNode.end, `__sveltui_${idNode.name}`);
          }
        }
      }
    }
  });
}
function appendInitializationCode(s, options) {
  s.append(`
// SvelTUI: This file was processed by the SvelTUI compiler plugin
`);
}
var ELEMENT_MAP = {
  div: "box",
  span: "text",
  p: "text",
  h1: "text",
  h2: "text",
  h3: "text",
  h4: "text",
  h5: "text",
  h6: "text",
  ul: "list",
  ol: "list",
  li: "list-item",
  input: "input",
  button: "button",
  table: "table",
  tr: "table-row",
  td: "table-cell",
  th: "table-cell",
  progress: "progress",
  form: "form",
  label: "text",
  select: "list",
  option: "list-item",
  textarea: "textbox",
  box: "box",
  text: "text",
  list: "list",
  checkbox: "checkbox"
};
var compiler_default = sveltuiPlugin;
export {
  sveltuiPlugin,
  compiler_default as default,
  ELEMENT_MAP
};
