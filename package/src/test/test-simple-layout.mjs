// @bun
// src/test/test-simple-layout.ts
import { mount } from '../mount.svelte.js';
import { SimpleBaseComponent } from '../components/base-component-simple.svelte.js';
import { ComponentType } from '../core/state/engine.svelte.js';
function TestApp() {
  const root = new SimpleBaseComponent(ComponentType.BOX, {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: 1,
    gap: 1
  }, true);
  const header = new SimpleBaseComponent(ComponentType.BOX, {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 1,
    borderWidth: 1
  }, true);
  const title = new SimpleBaseComponent(ComponentType.TEXT, {}, false);
  const status = new SimpleBaseComponent(ComponentType.TEXT, {
    alignSelf: "flex-end"
  }, false);
  const content = new SimpleBaseComponent(ComponentType.BOX, {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: 2,
    borderWidth: 1,
    overflow: "scroll"
  }, true);
  const items = [];
  for (let i = 0;i < 5; i++) {
    const item = new SimpleBaseComponent(ComponentType.BOX, {
      display: "flex",
      flexDirection: "row",
      gap: 2,
      marginY: 1
    }, true);
    const label = new SimpleBaseComponent(ComponentType.TEXT, {
      minWidth: 10
    }, false);
    const value = new SimpleBaseComponent(ComponentType.TEXT, {
      flexGrow: 1
    }, false);
    items.push(item);
  }
  const footer = new SimpleBaseComponent(ComponentType.BOX, {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
    padding: 1,
    borderWidth: 1
  }, true);
  const button1 = new SimpleBaseComponent(ComponentType.BOX, {
    padding: 1,
    paddingX: 2,
    borderWidth: 1,
    focusable: true,
    onClick: () => console.log("Button 1 clicked!"),
    onEnter: () => console.log("Enter pressed on button 1")
  }, true);
  const button1Text = new SimpleBaseComponent(ComponentType.TEXT, {}, false);
  const button2 = new SimpleBaseComponent(ComponentType.BOX, {
    padding: 1,
    paddingX: 2,
    borderWidth: 1,
    focusable: true,
    onClick: () => console.log("Button 2 clicked!"),
    onEnter: () => console.log("Enter pressed on button 2")
  }, true);
  const button2Text = new SimpleBaseComponent(ComponentType.TEXT, {}, false);
  let counter = 0;
  setInterval(() => {
    counter++;
    status.updateProps({});
    if (counter % 5 === 0) {
      content.updateProps({
        padding: counter % 10 < 5 ? 2 : 3
      });
    }
  }, 1000);
  return () => {};
}
console.log("Starting simplified layout test...");
console.log("Testing features:");
console.log("- Essential flexbox properties");
console.log("- Simple spacing (margin, padding, gap)");
console.log("- Text measurement");
console.log("- Scrollable containers");
console.log("- Interactive components");
console.log("- Dynamic prop updates");
console.log("");
var cleanup = mount(TestApp);
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
