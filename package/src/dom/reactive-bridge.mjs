// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = import.meta.require;

// src/dom/reactive-bridge.ts
var batch;
var tick;
var flushSync;
async function loadSvelteInternals() {
  if (!batch || !tick || !flushSync) {
    try {
      const client = await import("svelte/internal/client");
      batch = client.batch;
      tick = client.tick;
      flushSync = client.flushSync;
      return true;
    } catch (e) {
      console.warn("Failed to load Svelte internals:", e);
      return false;
    }
  }
  return true;
}
var PROP_CONVERSIONS = {
  top: (value) => normalizePosition(value),
  left: (value) => normalizePosition(value),
  right: (value) => normalizePosition(value),
  bottom: (value) => normalizePosition(value),
  width: (value) => normalizeSize(value),
  height: (value) => normalizeSize(value),
  fg: (value) => normalizeColor(value),
  bg: (value) => normalizeColor(value),
  borderFg: (value) => normalizeColor(value),
  content: (value) => String(value || ""),
  label: (value) => String(value || ""),
  hidden: (value) => Boolean(value),
  focused: (value) => Boolean(value),
  border: (value) => normalizeBorder(value)
};
function normalizePosition(value) {
  if (typeof value === "number")
    return value;
  if (typeof value === "string")
    return value;
  if (value == null)
    return 0;
  return String(value);
}
function normalizeSize(value) {
  if (typeof value === "number")
    return value;
  if (typeof value === "string")
    return value;
  if (value == null)
    return "100%";
  return String(value);
}
function normalizeColor(value) {
  if (typeof value === "string")
    return value;
  if (value == null)
    return "default";
  return String(value);
}
function normalizeBorder(value) {
  if (typeof value === "boolean")
    return value;
  if (typeof value === "object" && value !== null)
    return value;
  if (value === "line")
    return { type: "line" };
  if (value === "bg")
    return { type: "bg" };
  return Boolean(value);
}

class UpdateQueue {
  updates = new Map;
  scheduled = false;
  renderScheduled = false;
  async add(element, prop) {
    if (!this.updates.has(element)) {
      this.updates.set(element, new Set);
    }
    this.updates.get(element).add(prop);
    if (!this.scheduled) {
      this.scheduled = true;
      await loadSvelteInternals();
      if (tick) {
        tick().then(() => this.flush());
      } else {
        setImmediate(() => this.flush());
      }
    }
  }
  async flush() {
    await loadSvelteInternals();
    const screensToRender = new Set;
    for (const [element] of this.updates) {
      if (element.blessed?.screen) {
        screensToRender.add(element.blessed.screen);
      }
    }
    this.updates.clear();
    this.scheduled = false;
    if (screensToRender.size > 0 && !this.renderScheduled) {
      this.renderScheduled = true;
      setImmediate(() => {
        this.renderScheduled = false;
        for (const screen of screensToRender) {
          screen.render();
        }
      });
    }
  }
  forceFlush() {
    if (this.scheduled) {
      this.scheduled = false;
      this.flush();
    }
  }
}
var updateQueue = new UpdateQueue;
function createReactiveBridge(element, options = {}) {
  const {
    batching = true,
    validation = true,
    converters = {}
  } = options;
  const propConverters = { ...PROP_CONVERSIONS, ...converters };
  function updateProp(prop, value) {
    const converter = propConverters[prop];
    const convertedValue = converter ? converter(value) : value;
    if (element.setProps) {
      element.setProps({ [prop]: convertedValue });
    }
    if (batching) {
      updateQueue.add(element, prop);
    } else if (element.blessed?.screen) {
      element.blessed.screen.render();
    }
  }
  function updateProps(props) {
    const convertedProps = {};
    for (const [key, value] of Object.entries(props)) {
      const converter = propConverters[key];
      convertedProps[key] = converter ? converter(value) : value;
    }
    if (element.setProps) {
      element.setProps(convertedProps);
    }
    if (batching) {
      for (const prop of Object.keys(props)) {
        updateQueue.add(element, prop);
      }
    } else if (element.blessed?.screen) {
      element.blessed.screen.render();
    }
  }
  function destroy() {}
  return {
    updateProp,
    updateProps,
    destroy
  };
}
function isReactiveElement(element) {
  return element && typeof element.getReactiveProps === "function";
}
function getReactiveProps(element) {
  if (isReactiveElement(element)) {
    return element.getReactiveProps();
  }
  return null;
}
function createPropWatcher(element, props, mapping) {
  const bridge = createReactiveBridge(element);
  let cleanup = null;
  import("svelte/internal/client").then(({ effect }) => {
    cleanup = effect(() => {
      const currentProps = props();
      const updates = {};
      for (const [key, value] of Object.entries(currentProps)) {
        const targetKey = mapping?.[key] || key;
        updates[targetKey] = value;
      }
      bridge.updateProps(updates);
    });
  }).catch((e) => {
    console.warn("Failed to create prop watcher:", e);
  });
  return () => {
    cleanup?.();
    bridge.destroy();
  };
}
async function batchElementUpdates(fn) {
  await loadSvelteInternals();
  if (batch) {
    batch(fn);
  } else {
    fn();
  }
}
function forceRender() {
  updateQueue.forceFlush();
}
async function flushUpdates() {
  await loadSvelteInternals();
  if (flushSync) {
    flushSync(() => {
      updateQueue.forceFlush();
    });
  } else {
    updateQueue.forceFlush();
  }
}
function bindDerivedToElement(element, propName, getDerivedValue) {
  if (!isReactiveElement(element)) {
    console.warn("bindDerivedToElement: Element is not reactive");
    return () => {};
  }
  return element.bindReactiveProp(propName, getDerivedValue);
}
function createTextBinding(element, getText) {
  return bindDerivedToElement(element, "content", getText);
}
function createStyleBinding(element, getStyle) {
  const bridge = createReactiveBridge(element);
  let cleanup = null;
  import("svelte/internal/client").then(({ effect }) => {
    cleanup = effect(() => {
      const style = getStyle();
      const updates = {};
      if (style.fg !== undefined)
        updates.fg = style.fg;
      if (style.bg !== undefined)
        updates.bg = style.bg;
      if (style.border !== undefined)
        updates.border = style.border;
      bridge.updateProps({ style: updates });
    });
  }).catch((e) => {
    console.warn("Failed to create style binding:", e);
  });
  return () => {
    cleanup?.();
    bridge.destroy();
  };
}
function createPositionBinding(element, getPosition) {
  const bridge = createReactiveBridge(element);
  let cleanup = null;
  import("svelte/internal/client").then(({ effect }) => {
    cleanup = effect(() => {
      const position = getPosition();
      bridge.updateProps(position);
    });
  }).catch((e) => {
    console.warn("Failed to create position binding:", e);
  });
  return () => {
    cleanup?.();
    bridge.destroy();
  };
}
export {
  isReactiveElement,
  getReactiveProps,
  forceRender,
  flushUpdates,
  createTextBinding,
  createStyleBinding,
  createReactiveBridge,
  createPropWatcher,
  createPositionBinding,
  bindDerivedToElement,
  batchElementUpdates
};
