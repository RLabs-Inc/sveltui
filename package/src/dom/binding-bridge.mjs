// @bun
// src/dom/binding-bridge.ts
var BINDING_REGISTRY = {
  input: {
    value: {
      svelteProp: "value",
      blessedProp: "value",
      updateEvent: "submit",
      toBlessed: (v) => String(v || ""),
      fromBlessed: (v) => String(v || "")
    }
  },
  checkbox: {
    checked: {
      svelteProp: "checked",
      blessedProp: "checked",
      updateEvent: "check",
      toBlessed: (v) => Boolean(v),
      fromBlessed: (v) => Boolean(v)
    }
  },
  list: {
    selected: {
      svelteProp: "selected",
      blessedProp: "selected",
      updateEvent: "select",
      toBlessed: (v) => Number(v) || 0,
      fromBlessed: (event) => {
        if (typeof event === "number")
          return event;
        if (event && typeof event.index === "number")
          return event.index;
        if (event && event.detail && typeof event.detail.index === "number")
          return event.detail.index;
        return 0;
      }
    }
  },
  textarea: {
    value: {
      svelteProp: "value",
      blessedProp: "value",
      updateEvent: "submit",
      toBlessed: (v) => String(v || ""),
      fromBlessed: (v) => String(v || "")
    }
  }
};
function setupBinding(element, propName, getValue, setValue) {
  const elementType = element.type;
  const bindings = BINDING_REGISTRY[elementType];
  if (!bindings || !bindings[propName]) {
    return;
  }
  const metadata = bindings[propName];
  const syncToBlessed = () => {
    if (!element.blessed)
      return;
    const svelteValue = getValue();
    const blessedValue = metadata.toBlessed ? metadata.toBlessed(svelteValue) : svelteValue;
    if (element.blessed[metadata.blessedProp] !== blessedValue) {
      element.blessed[metadata.blessedProp] = blessedValue;
      if (elementType === "input" && "setValue" in element.blessed) {
        element.blessed.setValue(blessedValue);
      }
      element.blessed.screen?.render();
    }
  };
  const syncFromBlessed = (eventData) => {
    const blessedValue = metadata.fromBlessed ? metadata.fromBlessed(eventData) : eventData;
    const currentValue = getValue();
    if (currentValue !== blessedValue) {
      setValue(blessedValue);
    }
  };
  if (metadata.updateEvent && element.blessed) {
    element.blessed.on(metadata.updateEvent, syncFromBlessed);
    element._bindingCleanup = element._bindingCleanup || [];
    element._bindingCleanup.push(() => {
      element.blessed?.off(metadata.updateEvent, syncFromBlessed);
    });
  }
  syncToBlessed();
  return syncToBlessed;
}
function cleanupBindings(element) {
  if (element._bindingCleanup) {
    for (const cleanup of element._bindingCleanup) {
      cleanup();
    }
    element._bindingCleanup = [];
  }
}
function needsBinding(elementType, propName) {
  return !!BINDING_REGISTRY[elementType]?.[propName];
}
function getBindingMetadata(elementType, propName) {
  return BINDING_REGISTRY[elementType]?.[propName] || null;
}
export {
  setupBinding,
  needsBinding,
  getBindingMetadata,
  cleanupBindings
};
