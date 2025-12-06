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

// src/dom/reactive-element.ts
import { NodeType } from "./nodes";
var source;
var effect;
var untrack;
async function loadSvelteInternals() {
  if (!source || !effect || !untrack) {
    try {
      const client = await import("svelte/internal/client");
      source = client.source;
      effect = client.effect;
      untrack = client.untrack;
      return true;
    } catch (e) {
      console.warn("Failed to load Svelte internals:", e);
      return false;
    }
  }
  return true;
}

class ReactiveTerminalElement {
  type;
  blessed = null;
  props;
  parent = null;
  children = [];
  nodeType = NodeType.ELEMENT;
  domNode = null;
  sources = null;
  effects = [];
  isUpdating = false;
  internalsLoaded = false;
  initPromise = null;
  constructor(type, props) {
    this.type = type;
    this.props = { ...props };
    this.initPromise = this.initializeSources(props);
  }
  async initializeSources(props) {
    const loaded = await loadSvelteInternals();
    if (!loaded) {
      console.warn("ReactiveTerminalElement: Svelte internals not available, falling back to non-reactive mode");
      return;
    }
    this.internalsLoaded = true;
    if (!source) {
      console.warn("ReactiveTerminalElement: source function not available after loading internals");
      return;
    }
    this.sources = {
      top: source(props.top ?? 0),
      left: source(props.left ?? 0),
      right: source(props.right),
      bottom: source(props.bottom),
      width: source(props.width ?? "100%"),
      height: source(props.height ?? "100%"),
      fg: source(props.style?.fg || "white"),
      bg: source(props.style?.bg || "black"),
      borderFg: source(props.style?.border?.fg || "white"),
      content: source(props.content || ""),
      label: source(props.label || ""),
      hidden: source(props.hidden || false),
      focused: source(props.focused || false),
      border: source(props.border || false)
    };
    if (this.blessed) {
      this.setupEffects();
    }
  }
  setupEffects() {
    this.cleanupEffects();
    if (!this.sources || !effect || !this.blessed)
      return;
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const value = this.sources.top.get();
      if (this.blessed.top !== value) {
        this.blessed.top = value;
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const value = this.sources.left.get();
      if (this.blessed.left !== value) {
        this.blessed.left = value;
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const value = this.sources.width.get();
      if (this.blessed.width !== value) {
        this.blessed.width = value;
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const value = this.sources.height.get();
      if (this.blessed.height !== value) {
        this.blessed.height = value;
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const value = this.sources.content.get();
      if ("setContent" in this.blessed && typeof this.blessed.setContent === "function") {
        this.blessed.setContent(value);
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const fg = this.sources.fg.get();
      const bg = this.sources.bg.get();
      if (this.blessed.style) {
        this.blessed.style.fg = fg;
        this.blessed.style.bg = bg;
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const hidden = this.sources.hidden.get();
      if (hidden) {
        this.blessed.hide();
      } else {
        this.blessed.show();
      }
      this.scheduleRender();
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const border = this.sources.border.get();
      const borderFg = this.sources.borderFg.get();
      if (this.blessed.border !== border) {
        this.blessed.border = border;
        if (border && this.blessed.style?.border) {
          this.blessed.style.border.fg = borderFg;
        }
        this.scheduleRender();
      }
    }));
    this.effects.push(effect(() => {
      if (!this.blessed || this.isUpdating)
        return;
      const label = this.sources.label.get();
      if ("setLabel" in this.blessed && typeof this.blessed.setLabel === "function") {
        this.blessed.setLabel(label);
        this.scheduleRender();
      }
    }));
  }
  renderScheduled = false;
  scheduleRender() {
    if (this.renderScheduled || !this.blessed)
      return;
    this.renderScheduled = true;
    setImmediate(() => {
      this.renderScheduled = false;
      if (this.blessed && this.blessed.screen) {
        this.blessed.screen.render();
      }
    });
  }
  cleanupEffects() {
    this.effects.forEach((cleanup) => cleanup());
    this.effects = [];
  }
  attachToNode(node) {
    this.domNode = node;
    node._terminalElement = this;
  }
  appendChild(child) {
    this.children.push(child);
    child.parent = this;
    if (this.blessed && !child.blessed) {
      child.create(this.blessed);
    }
  }
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
      if (child.blessed) {
        child.destroy();
      }
    }
  }
  insertBefore(child, beforeChild) {
    const index = this.children.indexOf(beforeChild);
    if (index !== -1) {
      this.children.splice(index, 0, child);
      child.parent = this;
      if (this.blessed && !child.blessed) {
        child.create(this.blessed);
      }
    } else {
      this.appendChild(child);
    }
  }
  create(parent) {
    throw new Error("ReactiveTerminalElement.create must be implemented by subclasses");
  }
  setProps(props) {
    if (!this.sources || !this.internalsLoaded) {
      super.setProps(props);
      return;
    }
    this.isUpdating = true;
    if (untrack) {
      untrack(() => {
        if (props.top !== undefined)
          this.sources.top.set(props.top);
        if (props.left !== undefined)
          this.sources.left.set(props.left);
        if (props.right !== undefined)
          this.sources.right.set(props.right);
        if (props.bottom !== undefined)
          this.sources.bottom.set(props.bottom);
        if (props.width !== undefined)
          this.sources.width.set(props.width);
        if (props.height !== undefined)
          this.sources.height.set(props.height);
        if (props.style) {
          if (props.style.fg !== undefined)
            this.sources.fg.set(props.style.fg);
          if (props.style.bg !== undefined)
            this.sources.bg.set(props.style.bg);
          if (props.style.border?.fg !== undefined)
            this.sources.borderFg.set(props.style.border.fg);
        }
        if (props.content !== undefined)
          this.sources.content.set(props.content);
        if (props.label !== undefined)
          this.sources.label.set(props.label);
        if (props.hidden !== undefined)
          this.sources.hidden.set(props.hidden);
        if (props.focused !== undefined)
          this.sources.focused.set(props.focused);
        if (props.border !== undefined)
          this.sources.border.set(props.border);
      });
    } else {
      if (props.top !== undefined)
        this.sources.top.set(props.top);
      if (props.left !== undefined)
        this.sources.left.set(props.left);
      if (props.right !== undefined)
        this.sources.right.set(props.right);
      if (props.bottom !== undefined)
        this.sources.bottom.set(props.bottom);
      if (props.width !== undefined)
        this.sources.width.set(props.width);
      if (props.height !== undefined)
        this.sources.height.set(props.height);
      if (props.style) {
        if (props.style.fg !== undefined)
          this.sources.fg.set(props.style.fg);
        if (props.style.bg !== undefined)
          this.sources.bg.set(props.style.bg);
        if (props.style.border?.fg !== undefined)
          this.sources.borderFg.set(props.style.border.fg);
      }
      if (props.content !== undefined)
        this.sources.content.set(props.content);
      if (props.label !== undefined)
        this.sources.label.set(props.label);
      if (props.hidden !== undefined)
        this.sources.hidden.set(props.hidden);
      if (props.focused !== undefined)
        this.sources.focused.set(props.focused);
      if (props.border !== undefined)
        this.sources.border.set(props.border);
    }
    this.isUpdating = false;
    super.setProps(props);
  }
  getReactiveProps() {
    if (!this.sources) {
      return this.props;
    }
    return {
      top: this.sources.top.get(),
      left: this.sources.left.get(),
      right: this.sources.right.get(),
      bottom: this.sources.bottom.get(),
      width: this.sources.width.get(),
      height: this.sources.height.get(),
      style: {
        fg: this.sources.fg.get(),
        bg: this.sources.bg.get(),
        border: {
          fg: this.sources.borderFg.get()
        }
      },
      label: this.sources.label.get(),
      hidden: this.sources.hidden.get(),
      focused: this.sources.focused.get(),
      border: this.sources.border.get()
    };
  }
  getSource(name) {
    return this.sources?.[name];
  }
  update() {
    if (!this.blessed || !this.internalsLoaded) {
      super.update();
      return;
    }
    this.scheduleRender();
  }
  destroy() {
    this.cleanupEffects();
    if (this.parent) {
      this.parent.removeChild(this);
    }
    while (this.children.length > 0) {
      this.children[0].destroy();
    }
    if (this.blessed) {
      this.blessed.detach();
      if (this.blessed.parent) {
        this.blessed.parent.remove(this.blessed);
      }
      this.blessed = null;
    }
    if (this.domNode) {
      this.domNode._terminalElement = null;
      this.domNode = null;
    }
  }
  bindReactiveProp(propName, getValue) {
    if (!this.sources || !effect) {
      console.warn("ReactiveTerminalElement: Cannot bind reactive prop, internals not loaded");
      return () => {};
    }
    const cleanup = effect(() => {
      const value = getValue();
      const source2 = this.sources[propName];
      if (source2 && untrack) {
        untrack(() => source2.set(value));
      } else if (source2) {
        source2.set(value);
      }
    });
    this.effects.push(cleanup);
    return cleanup;
  }
}
function createReactiveElement(type, props) {
  return new ReactiveTerminalElement(type, props);
}
export {
  createReactiveElement,
  ReactiveTerminalElement
};
