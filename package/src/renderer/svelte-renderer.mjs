// @bun
var __require = import.meta.require;

// src/renderer/svelte-renderer.ts
import"../utils/browser-globals";
import blessed from "blessed";
import { getScreen, createRootBox, getRenderStats } from "./screen";
import { getReconciler } from "../reconciler";
import { setDOMConfig } from "../dom/config";
import { happyDomToTerminal, observeHappyDom, setupKeyboardEvents, setupGlobalKeyboardHandler } from "./bridge";
import { setupReactiveSync } from "./dom-sync";
async function renderComponent(Component, options = {}) {
  if (options.reactive) {
    setDOMConfig({ reactive: true, debug: options.debug || false });
  }
  const reconciler = getReconciler({
    debug: options.debug,
    batchUpdates: true
  });
  const screen = getScreen({
    title: options.title || options.screen?.title,
    fullscreen: options.fullscreen ?? options.screen?.fullscreen,
    useScheduler: true,
    scheduler: options.scheduler,
    maxFPS: 120,
    performanceMonitoring: options.performanceMonitoring,
    debug: options.debug,
    ...options.screen?.options
  });
  const rootBox = createRootBox(screen, {
    debug: options.debug
  });
  setupGlobalKeyboardHandler(screen);
  const happyDomTarget = document.createElement("div");
  document.body.appendChild(happyDomTarget);
  try {
    let instance;
    const props = options.props || {};
    try {
      let svelte;
      try {
        try {
          svelte = __require("svelte/src/index-client.js");
          if (options.debug) {
            console.log("[Renderer] Using Svelte client-side API");
          }
        } catch (clientErr) {
          svelte = __require("svelte");
          if (options.debug) {
            console.log("[Renderer] Using Svelte default import");
          }
        }
      } catch (e) {
        throw new Error("Could not load Svelte module. Make sure svelte is installed: " + e.message);
      }
      if (typeof svelte.mount === "function") {
        if (options.debug) {
          console.log("[Renderer] Using Svelte 5 mount API");
        }
        try {
          if (typeof Component === "string") {
            if (options.debug) {
              console.log("[Renderer] Loading component from path:", Component);
            }
            Component = __require(Component).default;
          }
          instance = svelte.mount(Component, {
            target: happyDomTarget,
            props
          });
        } catch (mountError) {
          console.error("[Renderer] Svelte mount error:", mountError);
          if (typeof Component === "function") {
            if (options.debug) {
              console.log("[Renderer] Trying direct function approach");
            }
            instance = Component(happyDomTarget, props);
          } else {
            throw mountError;
          }
        }
      } else {
        if (options.debug) {
          console.log("[Renderer] Using Svelte class component API");
        }
        const componentOptions = {
          target: happyDomTarget,
          props
        };
        instance = new Component(componentOptions);
      }
    } catch (error) {
      console.error("[Renderer] Error creating component:", error);
      throw error;
    }
    const bridgeHappyDomToTerminal = () => {
      if (options.debug) {
        console.log("[Renderer] Component mounted, bridging Happy DOM to Terminal");
        console.log("[Renderer] Happy DOM content:", happyDomTarget.innerHTML);
      }
      const { createElement } = __require("../dom/factories");
      const terminalRoot = createElement("box", {
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
      terminalRoot.create(rootBox);
      for (const child of happyDomTarget.childNodes) {
        const terminalChild = happyDomToTerminal(child, terminalRoot);
        if (terminalChild && child instanceof Element) {
          setupKeyboardForElement(child, terminalChild, screen);
        }
      }
      if (options.debug) {
        console.log("[Renderer] Setting up observer - element type:", happyDomTarget.constructor.name);
        console.log("[Renderer] Element has observeMutations:", typeof happyDomTarget[Symbol.for("happy-dom.observeMutations")]);
      }
      const observer = observeHappyDom(happyDomTarget, terminalRoot, screen);
      const cleanupSync = setupReactiveSync(happyDomTarget, terminalRoot, screen);
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
      return terminalRoot;
    };
    let rootElement = null;
    queueMicrotask(() => {
      rootElement = bridgeHappyDomToTerminal();
      screen.render();
    });
    if (options.debug) {
      console.log("[Renderer] Root box blessed:", !!rootBox);
      console.log("[Renderer] Root box children:", rootBox.children?.length || 0);
      console.log("[Renderer] Happy DOM target children:", happyDomTarget.childNodes.length);
    }
    screen.render();
    if (options.debug) {
      console.log("[Renderer] Screen rendered");
    }
    return {
      component: instance,
      element: rootElement,
      screen,
      destroy: () => {
        try {
          const svelte = __require("svelte");
          if (typeof svelte.unmount === "function" && instance) {
            if (options.debug) {
              console.log("[Renderer] Using Svelte 5 unmount API");
            }
            svelte.unmount(instance);
          } else if (instance && typeof instance.$destroy === "function") {
            instance.$destroy();
          } else if (instance && typeof instance.destroy === "function") {
            instance.destroy();
          }
        } catch (error) {
          console.error("[Renderer] Error during component cleanup:", error);
        }
        while (happyDomTarget.firstChild) {
          happyDomTarget.removeChild(happyDomTarget.firstChild);
        }
        if (happyDomTarget.parentNode) {
          happyDomTarget.parentNode.removeChild(happyDomTarget);
        }
        if (rootElement && rootElement.destroy) {
          rootElement.destroy();
        }
        screen.render();
      }
    };
  } catch (error) {
    console.error("Error rendering component:", error);
    const errorBox = blessed.box({
      parent: rootBox,
      top: "center",
      left: "center",
      width: "80%",
      height: "50%",
      content: `Error rendering component: ${error.message}`,
      border: "line",
      style: {
        border: {
          fg: "red"
        },
        fg: "red"
      }
    });
    screen.render();
    return {
      component: null,
      element: errorBox,
      screen,
      destroy: () => {
        errorBox.destroy();
        screen.render();
      }
    };
  }
}
function createRenderer(options = {}) {
  let currentResult = null;
  return {
    async mount(Component, props) {
      if (currentResult) {
        currentResult.destroy();
      }
      try {
        const result = await renderComponent(Component, {
          ...options,
          props: props || options.props
        });
        currentResult = result;
        return () => {
          if (currentResult) {
            currentResult.destroy();
            currentResult = null;
          }
        };
      } catch (error) {
        console.error("Failed to mount component:", error);
        throw error;
      }
    },
    unmount() {
      if (currentResult) {
        currentResult.destroy();
        currentResult = null;
      }
    },
    get screen() {
      return currentResult?.screen;
    },
    get component() {
      return currentResult?.component;
    },
    getRenderStats() {
      return getRenderStats();
    }
  };
}
var render = createRenderer();
export {
  renderComponent,
  render,
  createRenderer
};
