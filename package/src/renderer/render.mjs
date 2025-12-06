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

// src/renderer/render.ts
import { mount, unmount } from "svelte";
import { getScreen, createRootBox } from "./screen";
import { createElement } from '../dom/factories.mjs';
import { happyDomToTerminal, observeHappyDom, setupKeyboardEvents, setupGlobalKeyboardHandler } from './bridge.mjs';
import { setupReactiveSync } from './dom-sync.mjs';
import { getReconciler } from '../reconciler/index.mjs';
import path from "path";
import"../utils/browser-globals";
var mountedComponents = [];
function renderComponent(component, options = {}) {
  const reconciler = getReconciler({
    debug: options.debug,
    batchUpdates: true
  });
  const screen = getScreen(options);
  const rootBox = createRootBox(screen, options);
  const rootElement = createElement("box", {
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    content: "",
    style: {
      fg: "white",
      bg: undefined,
      transparent: true
    }
  });
  rootElement.create(rootBox);
  setupGlobalKeyboardHandler(screen);
  const happyDomTarget = document.createElement("div");
  document.body.appendChild(happyDomTarget);
  let instance = null;
  let componentMounted = false;
  const rootNode = {
    appendChild: () => {},
    removeChild: () => {},
    childNodes: [],
    nodeName: "div"
  };
  try {
    import("svelte").then(async (svelteModule) => {
      try {
        if (options.debug) {
          console.log("[Renderer] Creating component instance");
        }
        if (false) {}
        if (options.debug) {
          console.log("[Renderer] Using client-side Svelte mounting");
          console.log("[Renderer] mount function available:", typeof mount);
        }
        if (mount) {
          if (options.debug) {
            console.log("[Renderer] Using Svelte 5 client mount API");
          }
          const mountComponent = async () => {
            let componentToMount = component;
            if (typeof component === "string") {
              if (options.debug) {
                console.log("[Renderer] Component is a path, importing:", component);
              }
              try {
                if (options.debug) {
                  console.log("[Renderer] Loading component from path:", component);
                }
                const fullPath = path.isAbsolute(component) ? component : path.resolve(process.cwd(), component);
                if (options.debug) {
                  console.log("[Renderer] Resolved component path:", fullPath);
                }
                try {
                  const required = __require(fullPath);
                  componentToMount = required.default || required;
                  if (options.debug) {
                    console.log("[Renderer] Loaded component with require:", typeof componentToMount);
                  }
                } catch (requireError) {
                  console.error("[Renderer] Failed to load with require, trying import:", requireError);
                  const importPath = `file://${fullPath}`;
                  if (options.debug) {
                    console.log("[Renderer] Importing from:", importPath);
                  }
                  const module = await import(importPath);
                  componentToMount = module.default || module;
                  if (options.debug) {
                    console.log("[Renderer] Imported component:", typeof componentToMount);
                  }
                }
              } catch (importError) {
                console.error("[Renderer] Failed to import component:", importError);
                throw new Error(`Failed to import component: ${importError.message}`);
              }
            }
            if (typeof componentToMount !== "function") {
              console.error("[Renderer] Component is not a function after import:", typeof componentToMount);
              throw new Error("Component must be a function (component class)");
            }
            try {
              if (options.debug) {
                console.log("[Renderer] About to call mount with:");
                console.log("  Component:", typeof componentToMount);
                console.log("  Target:", happyDomTarget.tagName);
                console.log("  Props:", options.props || {});
              }
              const mountResult = mount(componentToMount, {
                target: happyDomTarget,
                props: options.props || {}
              });
              if (options.debug) {
                console.log("[Renderer] Mount returned successfully");
              }
              return mountResult;
            } catch (mountError) {
              console.error("[Renderer] Mount error:", mountError);
              console.error("[Renderer] Mount error stack:", mountError.stack);
              throw mountError;
            }
          };
          mountComponent().then((mountedInstance) => {
            instance = mountedInstance;
            if (options.debug) {
              console.log("[Renderer] Component mounted, bridging Happy DOM to Terminal");
              console.log("[Renderer] Happy DOM content:", happyDomTarget.innerHTML);
            }
            while (rootElement.children.length > 0) {
              const child = rootElement.children[0];
              rootElement.removeChild(child);
              child.destroy();
            }
            for (const child of happyDomTarget.childNodes) {
              const terminalChild = happyDomToTerminal(child, rootElement);
              if (terminalChild && child instanceof Element) {
                setupKeyboardForElement(child, terminalChild, screen);
              }
            }
            const observer = observeHappyDom(happyDomTarget, rootElement, screen);
            function setupKeyboardForElement(domEl, termEl, screen2) {
              const tagName = domEl.tagName.toLowerCase();
              if (tagName === "box" || tagName === "text" || tagName === "button" || tagName === "input") {
                if (domEl.hasAttribute("focused") || domEl.hasAttribute("onfocus") || domEl.hasAttribute("onblur") || domEl.hasAttribute("onkeydown")) {
                  setupKeyboardEvents(domEl, termEl, screen2);
                  if (domEl.getAttribute("focused") === "true" || domEl.getAttribute("focused") === "") {
                    termEl.blessed?.focus();
                  }
                }
              }
              const domChildren = Array.from(domEl.children);
              termEl.children.forEach((termChild, index) => {
                if (domChildren[index]) {
                  setupKeyboardForElement(domChildren[index], termChild, screen2);
                }
              });
            }
            const cleanupSync = setupReactiveSync(happyDomTarget, rootElement, screen);
            globalThis.__sveltui_cleanup_sync = cleanupSync;
            function ensureBlessedElements(element) {
              if (element.children) {
                for (const child of element.children) {
                  if (!child.blessed && element.blessed) {
                    child.create(element.blessed);
                  }
                  ensureBlessedElements(child);
                }
              }
            }
            ensureBlessedElements(rootElement);
            reconciler.forceFlush();
            screen.render();
            componentMounted = true;
            if (options.debug) {
              console.log("[Renderer] Component mounted successfully");
            }
          }).catch((mountError) => {
            console.error("[Renderer] Error mounting component:", mountError);
            if (options.debug) {
              showErrorUI(rootElement, mountError);
            } else {
              createPlaceholderUI(rootElement, screen);
            }
          });
          return;
        } else {
          console.error("Component:", typeof component, component);
          console.error("Available Svelte exports:", Object.keys(svelteModule));
          throw new Error("Unable to mount component: Svelte 5 mount API not available");
        }
      } catch (mountError) {
        console.error("[Renderer] Error mounting component:", mountError);
        if (options.debug) {
          showErrorUI(rootElement, mountError);
        } else {
          createPlaceholderUI(rootElement, screen);
        }
      }
    }).catch((importError) => {
      console.error("[Renderer] Error importing Svelte:", importError);
      if (options.debug) {
        showErrorUI(rootElement, importError);
      } else {
        createPlaceholderUI(rootElement, screen);
      }
    });
    if (!componentMounted) {
      createPlaceholderUI(rootElement, screen);
    }
  } catch (error) {
    console.error("[Renderer] Error initializing component:", error);
    if (options.debug) {
      showErrorUI(rootElement, error);
    } else {
      createPlaceholderUI(rootElement, screen);
    }
  }
  const cleanup = () => {
    try {
      const reconciler2 = getReconciler();
      if (instance) {
        if (unmount) {
          if (options.debug) {
            console.log("[Renderer] Using Svelte 5 client unmount API");
          }
          unmount(instance);
        } else if (typeof instance.unmount === "function") {
          instance.unmount();
        } else if (typeof instance.$destroy === "function") {
          instance.$destroy();
        }
        rootElement.destroy();
        const index = mountedComponents.findIndex((c) => c.root === rootElement);
        if (index !== -1) {
          mountedComponents.splice(index, 1);
        }
        reconciler2.forceFlush();
        if (options.debug) {
          console.log("[Renderer] Component destroyed");
        }
      } else {
        rootElement.destroy();
        reconciler2.forceFlush();
        if (options.debug) {
          console.log("[Renderer] Component root element destroyed (no instance)");
        }
      }
    } catch (err) {
      console.error("Error during cleanup:", err);
      rootElement.destroy();
    }
  };
  const mounted = {
    component,
    root: rootElement,
    screen,
    rootBox,
    instance,
    destroy: cleanup
  };
  mountedComponents.push(mounted);
  screen.render();
  if (options.debug) {
    console.log("[Renderer] Component initialized (waiting for mount)");
  }
  return cleanup;
}
function showErrorUI(rootElement, error) {
  while (rootElement.children.length > 0) {
    const child = rootElement.children[0];
    rootElement.removeChild(child);
    child.destroy();
  }
  const errorBox = createElement("box", {
    top: "center",
    left: "center",
    right: "center",
    bottom: "center",
    width: "80%",
    height: "50%",
    label: " SvelTUI Error ",
    content: `Error rendering component: ${error.message}

${error.stack || ""}`,
    border: "line",
    style: {
      border: {
        fg: "red"
      },
      fg: "white",
      bg: "red",
      hover: {
        bg: "blue"
      },
      focus: {
        bg: "blue"
      },
      scrollbar: {
        bg: "blue"
      }
    }
  });
  rootElement.appendChild(errorBox);
  errorBox.create(rootElement.blessed);
}
function refreshComponents() {
  const reconciler = getReconciler();
  reconciler.forceFlush();
  for (const { screen } of mountedComponents) {
    screen.render();
  }
}
function destroyComponents() {
  while (mountedComponents.length > 0) {
    const mounted = mountedComponents.pop();
    mounted.destroy();
  }
}
function createPlaceholderUI(rootElement, screen) {
  const mainBox = createElement("box", {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    border: "line",
    style: {
      fg: "white",
      bg: "black",
      border: {
        fg: "blue"
      },
      scrollbar: {
        bg: "blue"
      },
      focus: {
        bg: "blue"
      },
      hover: {
        bg: "blue"
      }
    },
    content: "SvelTUI Demo",
    label: "SvelTUI Demo"
  });
  rootElement.appendChild(mainBox);
  mainBox.create(rootElement.blessed);
  const titleBox = createElement("box", {
    top: 1,
    left: 2,
    right: 2,
    bottom: 0,
    width: "50%",
    height: 3,
    content: "Welcome to SvelTUI!",
    style: {
      fg: "green",
      bg: "black",
      border: {
        fg: "blue"
      },
      scrollbar: {
        bg: "blue"
      },
      focus: {
        bg: "blue"
      },
      hover: {
        bg: "blue"
      }
    }
  });
  mainBox.appendChild(titleBox);
  titleBox.create(mainBox.blessed);
  const instructionsBox = createElement("box", {
    top: 5,
    left: "center",
    right: "center",
    bottom: 0,
    width: "80%",
    height: 6,
    content: `Loading Svelte component... Please wait.

If this screen persists, the component may have failed to load or compile.`,
    border: "line",
    style: {
      border: {
        fg: "blue"
      },
      fg: "white",
      bg: "black",
      hover: {
        bg: "blue"
      },
      focus: {
        bg: "blue"
      },
      scrollbar: {
        bg: "blue"
      }
    }
  });
  mainBox.appendChild(instructionsBox);
  instructionsBox.create(mainBox.blessed);
  let count = 0;
  const counterBox = createElement("box", {
    top: 12,
    left: "center",
    right: "center",
    bottom: 0,
    width: 20,
    height: 3,
    content: `Counter: ${count}`,
    border: "line",
    style: {
      border: {
        fg: "yellow"
      },
      fg: "white",
      bg: "blue",
      hover: {
        bg: "cyan"
      },
      focus: {
        bg: "cyan"
      },
      scrollbar: {
        bg: "cyan"
      }
    }
  });
  mainBox.appendChild(counterBox);
  counterBox.create(mainBox.blessed);
  screen.key(["up", "+"], () => {
    count++;
    counterBox.blessed?.setContent(`Counter: ${count}`);
    screen.render();
  });
  screen.key(["down", "-"], () => {
    count--;
    counterBox.blessed?.setContent(`Counter: ${count}`);
    screen.render();
  });
  screen.key(["q", "C-c"], () => {
    process.exit(0);
  });
  const footerBox = createElement("box", {
    bottom: 1,
    left: "center",
    right: "center",
    top: 0,
    width: "90%",
    height: 1,
    content: "Press +/- to change counter | Press q or Ctrl+C to exit",
    style: {
      fg: "gray",
      bg: "black",
      border: {
        fg: "blue"
      },
      scrollbar: {
        bg: "blue"
      },
      focus: {
        bg: "blue"
      },
      hover: {
        bg: "blue"
      }
    }
  });
  mainBox.appendChild(footerBox);
  footerBox.create(mainBox.blessed);
}
export {
  renderComponent,
  refreshComponents,
  destroyComponents
};
