// @bun
// src/dom/binding-utils.ts
function createBinding(element, svelteProp, config) {
  let debounceTimer = null;
  const updateBlessed = () => {
    const blessedValue = config.toBlessed ? config.toBlessed(svelteProp.value) : svelteProp.value;
    if (element.blessed && element.blessed[config.blessedProp] !== blessedValue) {
      element.blessed[config.blessedProp] = blessedValue;
      if ("setValue" in element.blessed && config.blessedProp === "value") {
        element.blessed.setValue(blessedValue);
      }
      element.blessed.screen?.render();
    }
  };
  const updateSvelte = (blessedValue) => {
    const svelteValue = config.fromBlessed ? config.fromBlessed(blessedValue) : blessedValue;
    if (svelteProp.value !== svelteValue) {
      if (config.debounce && debounceTimer) {
        clearTimeout(debounceTimer);
      }
      const doUpdate = () => {
        svelteProp.value = svelteValue;
      };
      if (config.debounce) {
        debounceTimer = setTimeout(doUpdate, config.debounce);
      } else {
        doUpdate();
      }
    }
  };
  if (config.blessedEvent && element.blessed) {
    element.blessed.on(config.blessedEvent, (data) => {
      const value = data?.[config.blessedProp] ?? data?.value ?? data;
      updateSvelte(value);
    });
  }
  updateBlessed();
  return {
    update: updateBlessed,
    destroy: () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    }
  };
}
var CommonBindings = {
  inputValue: {
    blessedProp: "value",
    blessedEvent: "submit",
    toBlessed: (v) => String(v),
    fromBlessed: (v) => String(v)
  },
  checkboxChecked: {
    blessedProp: "checked",
    blessedEvent: "check",
    toBlessed: (v) => Boolean(v),
    fromBlessed: (v) => Boolean(v)
  },
  listSelected: {
    blessedProp: "selected",
    blessedEvent: "select",
    toBlessed: (v) => Number(v),
    fromBlessed: (data) => {
      return typeof data === "number" ? data : data?.index ?? 0;
    }
  },
  textareaValue: {
    blessedProp: "value",
    blessedEvent: "submit",
    toBlessed: (v) => String(v),
    fromBlessed: (v) => String(v),
    debounce: 300
  }
};
function syncProperty(element, propName, getValue, setValue, options = {}) {
  const updateBlessed = () => {
    const value = getValue();
    const blessedValue = options.toBlessed ? options.toBlessed(value) : value;
    if (element.blessed && element.blessed[propName] !== blessedValue) {
      element.blessed[propName] = blessedValue;
      element.blessed.screen?.render();
    }
  };
  if (options.blessedEvent && element.blessed) {
    element.blessed.on(options.blessedEvent, (data) => {
      const blessedValue = data?.[propName] ?? data?.value ?? data;
      const value = options.fromBlessed ? options.fromBlessed(blessedValue) : blessedValue;
      setValue(value);
    });
  }
  updateBlessed();
  return updateBlessed;
}

class ManagedBinding {
  bindings = [];
  add(element, svelteProp, config) {
    const binding = createBinding(element, svelteProp, config);
    this.bindings.push(binding);
    return binding;
  }
  updateAll() {
    for (const binding of this.bindings) {
      binding.update();
    }
  }
  destroy() {
    for (const binding of this.bindings) {
      binding.destroy();
    }
    this.bindings = [];
  }
}
export {
  syncProperty,
  createBinding,
  ManagedBinding,
  CommonBindings
};
