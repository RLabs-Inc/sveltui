// @bun
// src/input/simple-mouse-state.ts
import { globalEventBus } from '../dom/reactive-events.svelte.js';
import { getElementAtPosition, convertToElementCoordinates } from "./mouse-utils";

class SimpleMouseState {
  position = { x: 0, y: 0, screenX: 0, screenY: 0 };
  buttons = { left: false, middle: false, right: false };
  movementHistory = [];
  historyLimit = 20;
  dragStartPosition = null;
  draggedElement = null;
  rootElement = null;
  scrollDelta = { x: 0, y: 0 };
  lastScrollTime = 0;
  changeCallbacks = new Set;
  constructor() {
    this.setupEventListeners();
  }
  subscribe(callback) {
    this.changeCallbacks.add(callback);
    return () => this.changeCallbacks.delete(callback);
  }
  notifyChange() {
    this.changeCallbacks.forEach((cb) => cb());
  }
  getPosition() {
    return { ...this.position };
  }
  getButtons() {
    return { ...this.buttons };
  }
  getHoveredElement() {
    if (!this.rootElement)
      return null;
    return getElementAtPosition(this.rootElement, this.position.x, this.position.y);
  }
  getDragState() {
    const isDragging = this.dragStartPosition !== null;
    if (!isDragging) {
      return {
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: this.position.x,
        currentY: this.position.y,
        deltaX: 0,
        deltaY: 0,
        draggedElement: null
      };
    }
    return {
      isDragging: true,
      startX: this.dragStartPosition.x,
      startY: this.dragStartPosition.y,
      currentX: this.position.x,
      currentY: this.position.y,
      deltaX: this.position.x - this.dragStartPosition.x,
      deltaY: this.position.y - this.dragStartPosition.y,
      draggedElement: this.draggedElement
    };
  }
  getVelocity() {
    if (this.movementHistory.length < 2) {
      return { x: 0, y: 0 };
    }
    const recent = this.movementHistory.slice(-5);
    if (recent.length < 2) {
      return { x: 0, y: 0 };
    }
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDelta = last.timestamp - first.timestamp;
    if (timeDelta === 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: (last.x - first.x) / timeDelta * 1000,
      y: (last.y - first.y) / timeDelta * 1000
    };
  }
  getScrollDelta() {
    return { ...this.scrollDelta };
  }
  isOverElement(element) {
    const hovered = this.getHoveredElement();
    if (!hovered)
      return false;
    let current = hovered;
    while (current) {
      if (current === element)
        return true;
      current = current.parent;
    }
    return false;
  }
  getRelativePosition(element) {
    return convertToElementCoordinates(element, this.position.x, this.position.y);
  }
  setRootElement(element) {
    this.rootElement = element;
    this.notifyChange();
  }
  updatePosition(x, y) {
    this.position = { x, y, screenX: x, screenY: y };
    const movement = {
      x,
      y,
      timestamp: Date.now()
    };
    this.movementHistory = [
      ...this.movementHistory.slice(-(this.historyLimit - 1)),
      movement
    ];
    this.notifyChange();
  }
  updateButton(button, pressed) {
    this.buttons = {
      ...this.buttons,
      [button]: pressed
    };
    this.notifyChange();
  }
  startDrag(element) {
    this.dragStartPosition = {
      x: this.position.x,
      y: this.position.y
    };
    this.draggedElement = element;
    this.notifyChange();
  }
  endDrag() {
    this.dragStartPosition = null;
    this.draggedElement = null;
    this.notifyChange();
  }
  updateScroll(deltaX, deltaY) {
    this.scrollDelta = { x: deltaX, y: deltaY };
    this.lastScrollTime = Date.now();
    setTimeout(() => {
      if (Date.now() - this.lastScrollTime >= 100) {
        this.scrollDelta = { x: 0, y: 0 };
        this.notifyChange();
      }
    }, 100);
    this.notifyChange();
  }
  mapButton(button) {
    if (button === "left" || button === 0)
      return "left";
    if (button === "middle" || button === 1)
      return "middle";
    if (button === "right" || button === 2)
      return "right";
    return null;
  }
  setupEventListeners() {
    globalEventBus.on("mousemove", (event) => {
      if (event.data) {
        this.updatePosition(event.data.x, event.data.y);
      }
    });
    globalEventBus.on("mousedown", (event) => {
      if (event.data) {
        const button = this.mapButton(event.data.button);
        if (button) {
          this.updateButton(button, true);
          if (button === "left") {
            const element = this.getHoveredElement();
            this.startDrag(element);
          }
        }
      }
    });
    globalEventBus.on("mouseup", (event) => {
      if (event.data) {
        const button = this.mapButton(event.data.button);
        if (button) {
          this.updateButton(button, false);
          if (button === "left" && this.getDragState().isDragging) {
            this.endDrag();
          }
        }
      }
    });
    globalEventBus.on("wheel", (event) => {
      if (event.data) {
        const deltaY = event.data.direction === "down" ? 1 : -1;
        this.updateScroll(0, deltaY);
      }
    });
    globalEventBus.on("mouse", (event) => {
      if (event.data) {
        this.updatePosition(event.data.x, event.data.y);
        if (event.data.action === "mousedown") {
          const button = this.mapButton(event.data.button);
          if (button) {
            this.updateButton(button, true);
            if (button === "left") {
              const element = this.getHoveredElement();
              this.startDrag(element);
            }
          }
        } else if (event.data.action === "mouseup") {
          const button = this.mapButton(event.data.button);
          if (button) {
            this.updateButton(button, false);
            if (button === "left" && this.getDragState().isDragging) {
              this.endDrag();
            }
          }
        }
      }
    });
  }
  clearHistory() {
    this.movementHistory = [];
    this.notifyChange();
  }
  reset() {
    this.position = { x: 0, y: 0, screenX: 0, screenY: 0 };
    this.buttons = { left: false, middle: false, right: false };
    this.movementHistory = [];
    this.dragStartPosition = null;
    this.draggedElement = null;
    this.scrollDelta = { x: 0, y: 0 };
    this.lastScrollTime = 0;
    this.notifyChange();
  }
}
var mouseState = new SimpleMouseState;
function isMouseOver(element) {
  return mouseState.isOverElement(element);
}
function getMouseRelativePosition(element) {
  return mouseState.getRelativePosition(element);
}
export {
  mouseState,
  isMouseOver,
  getMouseRelativePosition,
  SimpleMouseState
};
