// @bun
// src/dom/event-bridge.ts
import { createElementEventEmitter, getElementEventEmitter } from './reactive-events.svelte.js';
var BLESSED_EVENT_MAP = {
  mouse: "mouse",
  mousedown: "mousedown",
  mouseup: "mouseup",
  mouseover: "mouseover",
  mouseout: "mouseout",
  mousemove: "mousemove",
  click: "click",
  wheeldown: "wheel",
  wheelup: "wheel",
  keypress: "keypress",
  key: "keydown",
  focus: "focus",
  blur: "blur",
  attach: "attach",
  detach: "detach",
  show: "show",
  hide: "hide",
  resize: "resize",
  move: "move",
  destroy: "destroy",
  select: "select",
  "select item": "selectitem",
  cancel: "cancel",
  action: "action",
  submit: "submit",
  cancel: "cancel",
  error: "error"
};
function normalizeBlessedEvent(blessedEventType, blessedData, element) {
  const eventType = BLESSED_EVENT_MAP[blessedEventType] || blessedEventType;
  let normalizedData = blessedData;
  switch (blessedEventType) {
    case "mouse":
    case "mousedown":
    case "mouseup":
    case "mouseover":
    case "mouseout":
    case "mousemove":
      normalizedData = {
        x: blessedData.x,
        y: blessedData.y,
        button: blessedData.button,
        shift: blessedData.shift,
        ctrl: blessedData.ctrl,
        meta: blessedData.meta
      };
      break;
    case "wheeldown":
    case "wheelup":
      normalizedData = {
        direction: blessedEventType === "wheeldown" ? "down" : "up",
        x: blessedData.x,
        y: blessedData.y,
        shift: blessedData.shift,
        ctrl: blessedData.ctrl,
        meta: blessedData.meta
      };
      break;
    case "keypress":
    case "key":
      if (typeof blessedData === "object" && blessedData !== null) {
        normalizedData = {
          key: blessedData.name || blessedData.full || blessedData.ch,
          ch: blessedData.ch,
          shift: blessedData.shift,
          ctrl: blessedData.ctrl,
          meta: blessedData.meta,
          sequence: blessedData.sequence
        };
      }
      break;
    case "resize":
      normalizedData = {
        width: element.blessed?.width,
        height: element.blessed?.height
      };
      break;
    case "move":
      normalizedData = {
        left: element.blessed?.left,
        top: element.blessed?.top
      };
      break;
    case "select":
    case "select item":
      normalizedData = {
        index: blessedData,
        item: element.blessed && "items" in element.blessed ? element.blessed.items[blessedData] : null
      };
      break;
  }
  return {
    type: eventType,
    timestamp: Date.now(),
    data: normalizedData,
    target: element
  };
}
function bridgeElementEvents(element, parentEmitter) {
  let emitter = getElementEventEmitter(element);
  if (!emitter) {
    emitter = createElementEventEmitter(element, parentEmitter);
  }
  if (!element.blessed) {
    return emitter;
  }
  const blessed = element.blessed;
  const eventsTobridge = Object.keys(BLESSED_EVENT_MAP);
  for (const blessedEvent of eventsTobridge) {
    if (typeof blessed.on === "function") {
      blessed.on(blessedEvent, (...args) => {
        const eventData = normalizeBlessedEvent(blessedEvent, args[0], element);
        emitter.emit(eventData.type, eventData.data);
      });
    }
  }
  return emitter;
}
function createCustomEvent(type, data, target) {
  return {
    type,
    timestamp: Date.now(),
    data,
    target
  };
}

class EventDelegator {
  rootEmitter;
  delegatedTypes = new Set;
  elementSelectors = new Map;
  constructor(rootEmitter) {
    this.rootEmitter = rootEmitter;
  }
  delegate(eventType, selector, handler) {
    this.delegatedTypes.add(eventType);
    if (selector) {
      const key = `${eventType}:${handler ? handler.toString() : "default"}`;
      this.elementSelectors.set(key, selector);
    }
    return this.rootEmitter.on(eventType, (event) => {
      if (selector && event.target) {
        if (!selector(event.target)) {
          return;
        }
      }
      if (handler) {
        handler(event);
      }
    });
  }
  isDelegated(eventType) {
    return this.delegatedTypes.has(eventType);
  }
  clear() {
    this.delegatedTypes.clear();
    this.elementSelectors.clear();
  }
}
function bridgeScreenEvents(screen, globalEmitter) {
  screen.on("keypress", (ch, key) => {
    globalEmitter.emit("keypress", {
      ch,
      key: key.name || key.full || ch,
      shift: key.shift,
      ctrl: key.ctrl,
      meta: key.meta
    });
  });
  screen.on("mouse", (data) => {
    globalEmitter.emit("mouse", {
      x: data.x,
      y: data.y,
      button: data.button,
      action: data.action
    });
  });
  screen.on("resize", () => {
    globalEmitter.emit("resize", {
      width: screen.width,
      height: screen.height
    });
  });
  screen.key(["q", "C-c"], () => {
    globalEmitter.emit("exit", {});
    process.exit(0);
  });
}
function createBlessedUpdater(element, updateFn) {
  return (event) => {
    if (!event || !element.blessed)
      return;
    updateFn(element.blessed, event.data);
  };
}
var blessedUpdaters = {
  content: (blessed, content) => {
    if ("setContent" in blessed && typeof blessed.setContent === "function") {
      blessed.setContent(content);
      blessed.screen?.render();
    }
  },
  label: (blessed, label) => {
    if ("setLabel" in blessed && typeof blessed.setLabel === "function") {
      blessed.setLabel(label);
      blessed.screen?.render();
    }
  },
  style: (blessed, style) => {
    if (blessed.style) {
      Object.assign(blessed.style, style);
      blessed.screen?.render();
    }
  },
  focus: (blessed) => {
    if ("focus" in blessed && typeof blessed.focus === "function") {
      blessed.focus();
    }
  },
  visibility: (blessed, visible) => {
    if (visible) {
      blessed.show();
    } else {
      blessed.hide();
    }
    blessed.screen?.render();
  }
};
export {
  createCustomEvent,
  createBlessedUpdater,
  bridgeScreenEvents,
  bridgeElementEvents,
  blessedUpdaters,
  EventDelegator
};
