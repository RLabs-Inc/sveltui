// @bun
// src/input/mouse.ts
var MouseButton;
((MouseButton2) => {
  MouseButton2[MouseButton2["LEFT"] = 0] = "LEFT";
  MouseButton2[MouseButton2["MIDDLE"] = 1] = "MIDDLE";
  MouseButton2[MouseButton2["RIGHT"] = 2] = "RIGHT";
  MouseButton2[MouseButton2["WHEEL_UP"] = 64] = "WHEEL_UP";
  MouseButton2[MouseButton2["WHEEL_DOWN"] = 65] = "WHEEL_DOWN";
  MouseButton2[MouseButton2["NONE"] = -1] = "NONE";
})(MouseButton ||= {});
var MouseAction;
((MouseAction2) => {
  MouseAction2[MouseAction2["PRESS"] = 0] = "PRESS";
  MouseAction2[MouseAction2["RELEASE"] = 1] = "RELEASE";
  MouseAction2[MouseAction2["MOVE"] = 2] = "MOVE";
  MouseAction2[MouseAction2["DRAG"] = 3] = "DRAG";
})(MouseAction ||= {});

class HitGrid {
  grid;
  width;
  height;
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Int16Array(width * height).fill(-1);
  }
  set(x, y, componentIndex) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return;
    this.grid[y * this.width + x] = componentIndex;
  }
  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return -1;
    return this.grid[y * this.width + x] ?? -1;
  }
  fillRect(x, y, width, height, componentIndex) {
    const x1 = Math.max(0, x);
    const y1 = Math.max(0, y);
    const x2 = Math.min(this.width, x + width);
    const y2 = Math.min(this.height, y + height);
    for (let row = y1;row < y2; row++) {
      const offset = row * this.width;
      for (let col = x1;col < x2; col++) {
        this.grid[offset + col] = componentIndex;
      }
    }
  }
  clear() {
    this.grid.fill(-1);
  }
  resize(width, height) {
    if (width === this.width && height === this.height)
      return;
    const newGrid = new Int16Array(width * height).fill(-1);
    const copyWidth = Math.min(this.width, width);
    const copyHeight = Math.min(this.height, height);
    for (let y = 0;y < copyHeight; y++) {
      const oldOffset = y * this.width;
      const newOffset = y * width;
      for (let x = 0;x < copyWidth; x++) {
        newGrid[newOffset + x] = this.grid[oldOffset + x] ?? -1;
      }
    }
    this.grid = newGrid;
    this.width = width;
    this.height = height;
  }
}

class SGRMouseProtocol {
  enabled = false;
  handlers = new Map;
  enable(stream = process.stdout) {
    if (this.enabled)
      return;
    stream.write("\x1B[?1006h");
    stream.write("\x1B[?1002h");
    stream.write("\x1B[?1003h");
    this.enabled = true;
  }
  disable(stream = process.stdout) {
    if (!this.enabled)
      return;
    stream.write("\x1B[?1006l");
    stream.write("\x1B[?1002l");
    stream.write("\x1B[?1003l");
    this.enabled = false;
  }
  parseSequence(data) {
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    if (!match)
      return null;
    const [, buttonStr, xStr, yStr, actionChar] = match;
    const buttonCode = parseInt(buttonStr);
    const x = parseInt(xStr) - 1;
    const y = parseInt(yStr) - 1;
    const button = this.parseButton(buttonCode);
    const modifiers = this.parseModifiers(buttonCode);
    let action;
    if (actionChar === "M") {
      action = buttonCode & 32 ? 3 /* DRAG */ : 0 /* PRESS */;
    } else {
      action = 1 /* RELEASE */;
    }
    if (buttonCode & 32) {
      action = buttonCode & 3 ? 3 /* DRAG */ : 2 /* MOVE */;
    }
    return {
      x,
      y,
      button,
      action,
      modifiers
    };
  }
  parseButton(code) {
    const buttonBits = code & 195;
    if (buttonBits & 64) {
      return buttonBits & 1 ? 65 /* WHEEL_DOWN */ : 64 /* WHEEL_UP */;
    }
    const button = buttonBits & 3;
    if (button === 3)
      return -1 /* NONE */;
    return button;
  }
  parseModifiers(code) {
    return {
      shift: !!(code & 4),
      alt: !!(code & 8),
      ctrl: !!(code & 16),
      meta: false
    };
  }
  installHandler(stream = process.stdin, callback) {
    const handler = (data) => {
      const str = data.toString();
      const event = this.parseSequence(str);
      if (event) {
        callback(event);
      }
    };
    stream.on("data", handler);
    return () => {
      stream.removeListener("data", handler);
    };
  }
}

class MouseEventDispatcher {
  hitGrid;
  handlers = new Map;
  hoveredComponent = -1;
  pressedComponent = -1;
  pressedButton = -1 /* NONE */;
  constructor(width, height) {
    this.hitGrid = new HitGrid(width, height);
  }
  setHandlers(componentIndex, handlers) {
    this.handlers.set(componentIndex, handlers);
  }
  removeHandlers(componentIndex) {
    this.handlers.delete(componentIndex);
  }
  updateHitGrid(hitGrid) {
    this.hitGrid = hitGrid;
  }
  dispatch(event) {
    const componentIndex = this.hitGrid.get(event.x, event.y);
    if (componentIndex !== this.hoveredComponent) {
      if (this.hoveredComponent >= 0) {
        const handlers2 = this.handlers.get(this.hoveredComponent);
        if (handlers2?.onMouseLeave) {
          handlers2.onMouseLeave(event);
        }
      }
      if (componentIndex >= 0) {
        const handlers2 = this.handlers.get(componentIndex);
        if (handlers2?.onMouseEnter) {
          handlers2.onMouseEnter(event);
        }
      }
      this.hoveredComponent = componentIndex;
    }
    if (componentIndex < 0) {
      if (event.action === 1 /* RELEASE */) {
        this.pressedComponent = -1;
        this.pressedButton = -1 /* NONE */;
      }
      return false;
    }
    const handlers = this.handlers.get(componentIndex);
    if (!handlers)
      return false;
    let handled = false;
    switch (event.action) {
      case 0 /* PRESS */:
        this.pressedComponent = componentIndex;
        this.pressedButton = event.button;
        if (handlers.onMouseDown) {
          handled = handlers.onMouseDown(event) ?? false;
        }
        break;
      case 1 /* RELEASE */:
        if (handlers.onMouseUp) {
          handled = handlers.onMouseUp(event) ?? false;
        }
        if (this.pressedComponent === componentIndex && this.pressedButton === event.button && handlers.onClick) {
          handled = handlers.onClick(event) ?? handled;
        }
        this.pressedComponent = -1;
        this.pressedButton = -1 /* NONE */;
        break;
      case 2 /* MOVE */:
        if (handlers.onMouseMove) {
          handled = handlers.onMouseMove(event) ?? false;
        }
        break;
      case 3 /* DRAG */:
        if (handlers.onDrag) {
          handled = handlers.onDrag(event) ?? false;
        }
        break;
    }
    if (event.button === 64 /* WHEEL_UP */ || event.button === 65 /* WHEEL_DOWN */) {
      if (handlers.onWheel) {
        handled = handlers.onWheel(event) ?? false;
      }
    }
    return handled;
  }
  clear() {
    this.handlers.clear();
    this.hoveredComponent = -1;
    this.pressedComponent = -1;
    this.pressedButton = -1 /* NONE */;
    this.hitGrid.clear();
  }
  resize(width, height) {
    this.hitGrid.resize(width, height);
  }
}
var mouse_default = {
  HitGrid,
  SGRMouseProtocol,
  MouseEventDispatcher,
  MouseButton,
  MouseAction
};
export {
  mouse_default as default,
  SGRMouseProtocol,
  MouseEventDispatcher,
  MouseButton,
  MouseAction,
  HitGrid
};
