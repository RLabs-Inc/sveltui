// @bun
// src/input/mouse-utils.ts
function convertToElementCoordinates(element, screenX, screenY) {
  const bounds = getElementBounds(element);
  if (!bounds)
    return null;
  if (screenX < bounds.left || screenX >= bounds.left + bounds.width || screenY < bounds.top || screenY >= bounds.top + bounds.height) {
    return null;
  }
  return {
    x: screenX - bounds.left,
    y: screenY - bounds.top
  };
}
function getElementBounds(element) {
  if (!element.blessed)
    return null;
  const blessed = element.blessed;
  const left = blessed.aleft ?? blessed.left ?? 0;
  const top = blessed.atop ?? blessed.top ?? 0;
  const width = blessed.width ?? 0;
  const height = blessed.height ?? 0;
  return {
    left: typeof left === "number" ? left : 0,
    top: typeof top === "number" ? top : 0,
    width: typeof width === "number" ? width : 0,
    height: typeof height === "number" ? height : 0
  };
}
function hitTest(element, x, y) {
  const bounds = getElementBounds(element);
  if (!bounds)
    return false;
  return x >= bounds.left && x < bounds.left + bounds.width && y >= bounds.top && y < bounds.top + bounds.height;
}
function getElementAtPosition(root, x, y) {
  if (!hitTest(root, x, y)) {
    return null;
  }
  for (let i = root.children.length - 1;i >= 0; i--) {
    const child = root.children[i];
    if (child.blessed && child.blessed.hidden) {
      continue;
    }
    const found = getElementAtPosition(child, x, y);
    if (found) {
      return found;
    }
  }
  return root;
}
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}
function normalizeMouseEvent(blessedData) {
  const x = blessedData.x ?? 0;
  const y = blessedData.y ?? 0;
  let button = null;
  if (blessedData.button === "left" || blessedData.button === 0) {
    button = "left";
  } else if (blessedData.button === "middle" || blessedData.button === 1) {
    button = "middle";
  } else if (blessedData.button === "right" || blessedData.button === 2) {
    button = "right";
  }
  let action = null;
  if (blessedData.action === "mousedown") {
    action = "mousedown";
  } else if (blessedData.action === "mouseup") {
    action = "mouseup";
  } else if (blessedData.action === "mousemove") {
    action = "mousemove";
  } else if (blessedData.action === "wheelup" || blessedData.action === "wheeldown") {
    action = "wheel";
  }
  return {
    x,
    y,
    button,
    shift: blessedData.shift ?? false,
    ctrl: blessedData.ctrl ?? false,
    meta: blessedData.meta ?? false,
    action
  };
}
function isDraggable(element) {
  if (element.props.draggable === true) {
    return true;
  }
  if (element.props.onDragStart || element.props.onDrag || element.props.onDragEnd) {
    return true;
  }
  return false;
}
function isDropTarget(element) {
  if (element.props.droppable === true) {
    return true;
  }
  if (element.props.onDragEnter || element.props.onDragOver || element.props.onDragLeave || element.props.onDrop) {
    return true;
  }
  return false;
}
function calculateDragOffset(element, mouseX, mouseY) {
  const bounds = getElementBounds(element);
  if (!bounds)
    return null;
  return {
    offsetX: mouseX - bounds.left,
    offsetY: mouseY - bounds.top
  };
}
function applyDragConstraints(x, y, width, height, constraints) {
  let newX = x;
  let newY = y;
  if (constraints) {
    if (constraints.minX !== undefined) {
      newX = Math.max(constraints.minX, newX);
    }
    if (constraints.maxX !== undefined) {
      newX = Math.min(constraints.maxX - width, newX);
    }
    if (constraints.minY !== undefined) {
      newY = Math.max(constraints.minY, newY);
    }
    if (constraints.maxY !== undefined) {
      newY = Math.min(constraints.maxY - height, newY);
    }
    if (constraints.snapToGrid) {
      const grid = constraints.snapToGrid;
      newX = Math.round(newX / grid) * grid;
      newY = Math.round(newY / grid) * grid;
    }
  }
  return { x: newX, y: newY };
}
function detectGesture(movements, threshold = 50) {
  if (movements.length < 2) {
    return { type: "none" };
  }
  const first = movements[0];
  const last = movements[movements.length - 1];
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const timeDelta = last.timestamp - first.timestamp;
  if (dist < threshold || timeDelta === 0) {
    return { type: "none" };
  }
  const velocity = dist / timeDelta * 1000;
  let direction;
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? "right" : "left";
  } else {
    direction = dy > 0 ? "down" : "up";
  }
  return {
    type: "swipe",
    direction,
    velocity,
    distance: dist
  };
}
function createDebouncedMouseHandler(handler, delay = 50) {
  let timeoutId = null;
  let lastArgs = [];
  const debouncedHandler = (...args) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      handler(...lastArgs);
      timeoutId = null;
    }, delay);
  };
  return debouncedHandler;
}
function createThrottledMouseHandler(handler, limit = 16) {
  let lastTime = 0;
  let pendingArgs = null;
  let timeoutId = null;
  const throttledHandler = (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastTime;
    if (timeSinceLastCall >= limit) {
      lastTime = now;
      handler(...args);
    } else {
      pendingArgs = args;
      if (!timeoutId) {
        const remainingTime = limit - timeSinceLastCall;
        timeoutId = setTimeout(() => {
          if (pendingArgs) {
            lastTime = Date.now();
            handler(...pendingArgs);
            pendingArgs = null;
          }
          timeoutId = null;
        }, remainingTime);
      }
    }
  };
  return throttledHandler;
}
export {
  normalizeMouseEvent,
  isDropTarget,
  isDraggable,
  hitTest,
  getElementBounds,
  getElementAtPosition,
  distance,
  detectGesture,
  createThrottledMouseHandler,
  createDebouncedMouseHandler,
  convertToElementCoordinates,
  calculateDragOffset,
  applyDragConstraints,
  angle
};
