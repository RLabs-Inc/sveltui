// @bun
// src/dom/elements.ts
var elementRegistry = {};
function registerElement(type, factory) {
  elementRegistry[type] = factory;
}
function createElement(type, props) {
  const factory = elementRegistry[type];
  if (!factory) {
    throw new Error(`Unknown element type: ${type}`);
  }
  return factory(props);
}
export {
  registerElement,
  elementRegistry,
  createElement
};
