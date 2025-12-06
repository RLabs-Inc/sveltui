// @bun
// src/dom/config.ts
var config = {
  reactive: false,
  debug: false
};
function setDOMConfig(newConfig) {
  config = { ...config, ...newConfig };
}
function getDOMConfig() {
  return { ...config };
}
function isReactiveEnabled() {
  return config.reactive;
}
export {
  setDOMConfig,
  isReactiveEnabled,
  getDOMConfig
};
