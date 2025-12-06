// @bun
// src/dom/factories.ts
import blessed from "blessed";
import { NodeType } from "./nodes";
import { registerElement } from "./elements";
import { calculateElementPosition } from "./position-utils";
import { ReactiveTerminalElement } from "./reactive-element";
import { isReactiveEnabled } from "./config";

class BaseTerminalElement {
  type;
  blessed = null;
  props;
  parent = null;
  children = [];
  nodeType = NodeType.ELEMENT;
  domNode = null;
  constructor(type, props) {
    this.type = type;
    this.props = { ...props };
  }
  setProps(props) {
    if (props.border && typeof props.border === "string" && props.border === "[object Object]") {
      props.border = {
        type: "line",
        ch: " ",
        left: true,
        top: true,
        right: true,
        bottom: true
      };
    }
    this.props = { ...this.props, ...props };
    if (this.blessed) {
      this.update();
    }
  }
  attachToNode(node) {
    this.domNode = node;
    node._terminalElement = this;
  }
  calculatePositioning(parent) {
    const contentSize = this.getContentSize?.();
    return calculateElementPosition({
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height
    }, parent, contentSize);
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
    throw new Error("Method not implemented.");
  }
  update() {
    throw new Error("Method not implemented.");
  }
  destroy() {
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
}

class BoxElement extends BaseTerminalElement {
  constructor(props) {
    super("box", props);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for box element");
    }
    const pos = this.calculatePositioning(parent);
    let finalBorder = this.props.border;
    let finalStyle = this.props.style;
    if (this.props.style?.border && this.props.border) {
      const existingBorder = typeof this.props.border === "object" ? this.props.border : {
        type: "line",
        ch: " ",
        left: true,
        top: true,
        right: true,
        bottom: true
      };
      finalBorder = { ...existingBorder, ...this.props.style.border };
      const { border, ...styleWithoutBorder } = this.props.style;
      finalStyle = styleWithoutBorder;
    }
    const boxOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: this.props.content || "",
      tags: this.props.tags,
      border: finalBorder,
      style: finalStyle,
      label: this.props.label,
      scrollable: this.props.scrollable,
      mouse: this.props.mouse,
      focusable: this.props.focusable !== false || this.props.focused !== undefined || this.props.onkeydown !== undefined,
      keys: true,
      input: true
    };
    this.blessed = blessed.box(boxOptions);
    if (this.props.focused && this.blessed) {
      setImmediate(() => {
        this.blessed?.focus();
      });
    }
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    const box = this.blessed;
    const currentBorder = box.border;
    const pos = this.calculatePositioning(box.parent);
    box.top = pos.top;
    box.left = pos.left;
    box.width = pos.width;
    box.height = pos.height;
    box.right = pos.right !== undefined ? pos.right : this.props.right;
    box.bottom = pos.bottom !== undefined ? pos.bottom : this.props.bottom;
    if (this.props.content !== undefined) {
      box.setContent(this.props.content);
    }
    if (this.props.border !== undefined) {
      if (typeof this.props.border === "string" && this.props.border === "[object Object]") {
        box.border = {
          type: "line",
          ch: " ",
          left: true,
          top: true,
          right: true,
          bottom: true
        };
      } else {
        box.border = this.props.border;
      }
    } else if (currentBorder) {
      box.border = currentBorder;
    }
    if (this.props.style) {
      if (this.props.style.border && box.border) {
        box.border = { ...box.border, ...this.props.style.border };
        const { border, ...styleWithoutBorder } = this.props.style;
        Object.assign(box.style, styleWithoutBorder);
      } else {
        Object.assign(box.style, this.props.style);
      }
    }
    if (box.border) {
      const borderConfig = box.border;
      box.border = borderConfig;
    }
    if (this.props.label !== undefined) {
      box.setLabel(this.props.label);
    }
    if (this.props.hidden) {
      box.hide();
    } else {
      box.show();
    }
    if (box.screen) {
      box.screen.render();
    }
  }
}

class TextElement extends BaseTerminalElement {
  constructor(props) {
    super("text", props);
  }
  getContentSize() {
    let content = this.props.content || "";
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes).filter((node) => node.nodeType === 3).map((node) => node.nodeValue || "").join("");
      if (textContent) {
        content = textContent;
      }
    }
    const lines = content.split(`
`);
    const height = lines.length;
    const width = Math.max(...lines.map((line) => line.length));
    return { width, height };
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for text element");
    }
    let content = this.props.content || "";
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes).filter((node) => node.nodeType === 3).map((node) => node.nodeValue || "").join("");
      if (textContent) {
        content = textContent;
      }
    }
    const pos = this.calculatePositioning(parent);
    const blessedOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content,
      tags: this.props.tags !== false,
      style: this.props.style && typeof this.props.style === "object" ? this.props.style : {
        fg: this.props.style?.fg || "white",
        bg: this.props.style?.bg || undefined,
        hover: {
          bg: undefined
        }
      },
      align: this.props.align,
      wrap: this.props.wrap,
      border: this.props.border,
      mouse: false
    };
    this.blessed = blessed.text(blessedOptions);
    this.blessed.show();
  }
  update() {
    if (!this.blessed)
      return;
    const text = this.blessed;
    const pos = this.calculatePositioning(text.parent);
    text.top = pos.top;
    text.left = pos.left;
    text.width = pos.width;
    text.height = pos.height;
    text.right = pos.right !== undefined ? pos.right : this.props.right;
    text.bottom = pos.bottom !== undefined ? pos.bottom : this.props.bottom;
    let content = this.props.content;
    if (content === undefined && this.domNode) {
      const textNodes = Array.from(this.domNode.childNodes).filter((node) => node.nodeType === 3);
      if (textNodes.length > 0) {
        const textContent = textNodes.map((node) => node.nodeValue || "").join("");
        content = textContent;
      }
    }
    if (content !== undefined) {
      text.setContent(content);
    }
    if (this.props.style && typeof this.props.style === "object") {
      text.style = { ...text.style, ...this.props.style };
    }
    const screen = text.screen || this.blessed.parent && this.blessed.parent.screen;
    if (screen) {
      screen.render();
    }
    if (this.props.style) {
      Object.assign(text.style, this.props.style);
    }
    if (this.props.hidden) {
      text.hide();
    } else {
      text.show();
    }
    if (text.screen) {
      text.screen.render();
    }
  }
}

class ListElement extends BaseTerminalElement {
  constructor(props) {
    super("list", props);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for list element");
    }
    const listProps = this.props;
    const pos = this.calculatePositioning(parent);
    this.blessed = blessed.list({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: this.props.right,
      bottom: this.props.bottom,
      items: listProps.items || [],
      tags: this.props.tags,
      style: this.props.style,
      border: this.props.border,
      mouse: listProps.mouse !== false,
      keys: listProps.keys !== false,
      vi: listProps.vi
    });
    if (listProps.selected !== undefined && this.blessed.data.selected) {
      this.blessed.data.select(listProps.selected);
    }
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    const list = this.blessed;
    const listProps = this.props;
    const pos = this.calculatePositioning(list.parent);
    list.top = pos.top;
    list.left = pos.left;
    list.width = pos.width;
    list.height = pos.height;
    list.right = this.props.right;
    list.bottom = this.props.bottom;
    if (listProps.items) {
      list.setItems(listProps.items);
    }
    if (listProps.selected !== undefined) {
      list.select(listProps.selected);
    }
    if (this.props.style) {
      Object.assign(list.style, this.props.style);
    }
    if (this.props.border !== undefined) {
      list.border = this.props.border;
    }
    if (this.props.hidden) {
      list.hide();
    } else {
      list.show();
    }
    if (list.screen) {
      list.screen.render();
    }
  }
}

class InputElement extends BaseTerminalElement {
  constructor(props) {
    super("input", props);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for input element");
    }
    const inputProps = this.props;
    const pos = this.calculatePositioning(parent);
    this.blessed = blessed.textbox({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: this.props.right,
      bottom: this.props.bottom,
      value: inputProps.value || "",
      style: this.props.style,
      border: this.props.border,
      inputOnFocus: true,
      mouse: this.props.mouse,
      keys: true,
      focusable: this.props.focusable !== false
    });
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    const input = this.blessed;
    const inputProps = this.props;
    const pos = this.calculatePositioning(input.parent);
    input.top = pos.top;
    input.left = pos.left;
    input.width = pos.width;
    input.height = pos.height;
    input.right = this.props.right;
    input.bottom = this.props.bottom;
    if (inputProps.value !== undefined) {
      input.setValue(inputProps.value);
    }
    if (this.props.style) {
      Object.assign(input.style, this.props.style);
    }
    if (this.props.border !== undefined) {
      input.border = this.props.border;
    }
    if (this.props.hidden) {
      input.hide();
    } else {
      input.show();
    }
    if (input.screen) {
      input.screen.render();
    }
  }
}

class ButtonElement extends BaseTerminalElement {
  constructor(props) {
    super("button", props);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for button element");
    }
    const pos = this.calculatePositioning(parent);
    this.blessed = blessed.button({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: this.props.right,
      bottom: this.props.bottom,
      content: this.props.content || "",
      tags: this.props.tags,
      style: this.props.style,
      border: this.props.border,
      mouse: this.props.mouse !== false,
      keys: true,
      focusable: this.props.focusable !== false
    });
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    const button = this.blessed;
    const pos = this.calculatePositioning(button.parent);
    button.top = pos.top;
    button.left = pos.left;
    button.width = pos.width;
    button.height = pos.height;
    button.right = this.props.right;
    button.bottom = this.props.bottom;
    if (this.props.content !== undefined) {
      button.setContent(this.props.content);
    }
    if (this.props.style) {
      Object.assign(button.style, this.props.style);
    }
    if (this.props.border !== undefined) {
      button.border = this.props.border;
    }
    if (this.props.hidden) {
      button.hide();
    } else {
      button.show();
    }
    if (button.screen) {
      button.screen.render();
    }
  }
}

class ProgressBarElement extends BaseTerminalElement {
  constructor(props) {
    super("progress", props);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for progress element");
    }
    const progressProps = this.props;
    const pos = this.calculatePositioning(parent);
    this.blessed = blessed.progressbar({
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: this.props.right,
      bottom: this.props.bottom,
      orientation: progressProps.orientation || "horizontal",
      style: this.props.style,
      border: this.props.border,
      filled: progressProps.value || 0,
      pch: " "
    });
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    const progress = this.blessed;
    const progressProps = this.props;
    const pos = this.calculatePositioning(progress.parent);
    progress.top = pos.top;
    progress.left = pos.left;
    progress.width = pos.width;
    progress.height = pos.height;
    progress.right = this.props.right;
    progress.bottom = this.props.bottom;
    if (progressProps.value !== undefined) {
      progress.setProgress(progressProps.value);
    }
    if (this.props.style) {
      Object.assign(progress.style, this.props.style);
    }
    if (this.props.border !== undefined) {
      progress.border = this.props.border;
    }
    if (this.props.hidden) {
      progress.hide();
    } else {
      progress.show();
    }
    if (progress.screen) {
      progress.screen.render();
    }
  }
}

class ReactiveBoxElement extends ReactiveTerminalElement {
  constructor(props) {
    super("box", props);
  }
  getContentSize() {
    return;
  }
  calculatePositioning(parent) {
    const contentSize = this.getContentSize?.();
    return calculateElementPosition({
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height
    }, parent, contentSize);
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for box element");
    }
    const pos = this.calculatePositioning(parent);
    let finalBorder = this.props.border;
    let finalStyle = this.props.style;
    if (this.props.style?.border && this.props.border) {
      const existingBorder = typeof this.props.border === "object" ? this.props.border : {
        type: "line",
        ch: " ",
        left: true,
        top: true,
        right: true,
        bottom: true
      };
      finalBorder = { ...existingBorder, ...this.props.style.border };
      const { border, ...styleWithoutBorder } = this.props.style;
      finalStyle = styleWithoutBorder;
    }
    const boxOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content: this.props.content || "",
      tags: this.props.tags,
      border: finalBorder,
      style: finalStyle,
      label: this.props.label,
      scrollable: this.props.scrollable,
      mouse: this.props.mouse,
      focusable: this.props.focusable !== false || this.props.focused !== undefined || this.props.onkeydown !== undefined,
      keys: true,
      input: true
    };
    this.blessed = blessed.box(boxOptions);
    if (this.props.focused && this.blessed) {
      setImmediate(() => {
        this.blessed?.focus();
      });
    }
    for (const child of this.children) {
      child.create(this.blessed);
    }
  }
  update() {
    if (!this.blessed)
      return;
    super.update();
  }
}

class ReactiveTextElement extends ReactiveTerminalElement {
  constructor(props) {
    super("text", props);
  }
  calculatePositioning(parent) {
    const contentSize = this.getContentSize?.();
    return calculateElementPosition({
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom,
      width: this.props.width,
      height: this.props.height
    }, parent, contentSize);
  }
  getContentSize() {
    let content = this.props.content || "";
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes).filter((node) => node.nodeType === 3).map((node) => node.nodeValue || "").join("");
      if (textContent) {
        content = textContent;
      }
    }
    const lines = content.split(`
`);
    const height = lines.length;
    const width = Math.max(...lines.map((line) => line.length));
    return { width, height };
  }
  create(parent) {
    if (!parent) {
      throw new Error("Parent is required for text element");
    }
    let content = this.props.content || "";
    if (!content && this.domNode) {
      const textContent = Array.from(this.domNode.childNodes).filter((node) => node.nodeType === 3).map((node) => node.nodeValue || "").join("");
      if (textContent) {
        content = textContent;
      }
    }
    const pos = this.calculatePositioning(parent);
    const blessedOptions = {
      parent,
      top: pos.top,
      left: pos.left,
      width: pos.width,
      height: pos.height,
      right: pos.right !== undefined ? pos.right : this.props.right,
      bottom: pos.bottom !== undefined ? pos.bottom : this.props.bottom,
      content,
      tags: this.props.tags !== false,
      style: this.props.style && typeof this.props.style === "object" ? this.props.style : {
        fg: this.props.style?.fg || "white",
        bg: this.props.style?.bg || undefined,
        hover: {
          bg: undefined
        }
      },
      align: this.props.align,
      wrap: this.props.wrap,
      border: this.props.border,
      mouse: false
    };
    this.blessed = blessed.text(blessedOptions);
    this.blessed.show();
  }
  update() {
    if (!this.blessed)
      return;
    super.update();
  }
}
var factories = {
  box: (props) => new BoxElement(props),
  text: (props) => new TextElement(props),
  ttext: (props) => new TextElement(props),
  list: (props) => new ListElement(props),
  input: (props) => new InputElement(props),
  button: (props) => new ButtonElement(props),
  progress: (props) => new ProgressBarElement(props),
  div: (props) => new BoxElement(props),
  span: (props) => new TextElement(props),
  p: (props) => new TextElement(props)
};
var reactiveFactories = {
  box: (props) => new ReactiveBoxElement(props),
  text: (props) => new ReactiveTextElement(props),
  ttext: (props) => new ReactiveTextElement(props),
  list: (props) => new ReactiveTerminalElement("list", props),
  input: (props) => new ReactiveTerminalElement("input", props),
  button: (props) => new ReactiveTerminalElement("button", props),
  progress: (props) => new ReactiveTerminalElement("progress", props),
  div: (props) => new ReactiveBoxElement(props),
  span: (props) => new ReactiveTextElement(props),
  p: (props) => new ReactiveTextElement(props)
};
function createElement(type, props, domNode, options) {
  const normalizedType = type.toLowerCase();
  const useReactive = options?.reactive ?? isReactiveEnabled();
  const factoryMap = useReactive ? reactiveFactories : factories;
  let factory = factoryMap[normalizedType];
  if (!factory) {
    console.warn(`Unknown element type: ${type}, falling back to div`);
    factory = factoryMap.div;
  }
  const element = factory(props);
  if (domNode) {
    element.attachToNode(domNode);
  }
  return element;
}
function registerElementFactories() {
  for (const [type, factory] of Object.entries(factories)) {
    registerElement(type, factory);
  }
  for (const [type, factory] of Object.entries(reactiveFactories)) {
    registerElement(`reactive-${type}`, factory);
  }
}
function createReactiveElement(type, props, domNode) {
  return createElement(type, props, domNode, { reactive: true });
}
export {
  registerElementFactories,
  reactiveFactories,
  factories,
  createReactiveElement,
  createElement,
  TextElement,
  ReactiveTextElement,
  ReactiveBoxElement,
  ProgressBarElement,
  ListElement,
  InputElement,
  ButtonElement,
  BoxElement,
  BaseTerminalElement
};
