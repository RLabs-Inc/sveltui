// @bun
// src/dev.ts
import { createServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import sveltuiPlugin from "./compiler";
async function startDevServer(componentPath, options = {}) {
  const absolutePath = path.isAbsolute(componentPath) ? componentPath : path.resolve(process.cwd(), componentPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Component not found: ${absolutePath}`);
  }
  const tempDir = path.join(process.cwd(), ".sveltui-dev");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const entryFile = path.join(tempDir, "entry.js");
  const entryContent = `
    import { render } from '${path.relative(tempDir, path.join(process.cwd(), "src/renderer/index.js"))}';
    import Component from '${path.relative(tempDir, absolutePath)}';

    // Render the component
    const cleanup = render(Component, ${JSON.stringify(options)});

    // Handle clean exit
    process.on('SIGINT', () => {
      console.log('Received SIGINT, cleaning up...');
      try {
        cleanup();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
      process.exit(0);
    });

    // Add a global key handler for quitting
    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        try {
          cleanup();
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
        process.exit(0);
      }
    });

    console.log('SvelTUI development server started. Press q or Ctrl+C to exit.');
  `;
  fs.writeFileSync(entryFile, entryContent);
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [
      svelte({
        compilerOptions: {
          runes: true,
          compatibility: { componentApi: 5 }
        }
      }),
      {
        name: "vite-plugin-sveltui",
        transform(code, id) {
          if (id.endsWith(".svelte") || id.endsWith(".svelte.ts")) {
            return sveltuiPlugin({
              debug: true,
              sourcemap: true,
              customElements: {
                div: "box",
                span: "text",
                p: "text",
                input: "input",
                button: "button",
                ul: "list",
                box: "box",
                text: "text",
                list: "list",
                checkbox: "checkbox"
              }
            }).transform(code, id);
          }
        }
      }
    ],
    optimizeDeps: {
      exclude: ["svelte/internal"]
    },
    build: {
      target: "node18"
    },
    server: {
      hmr: false
    }
  });
  await server.listen();
  const info = server.config.server.hmr === false ? null : server.config.server.hmr === true ? { protocol: "ws", host: "localhost", port: 24678 } : server.config.server.hmr;
  const viteNode = spawn("node", [
    path.join(process.cwd(), "node_modules/.bin/vite-node"),
    entryFile
  ], {
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_HMR_PORT: info ? String(info.port) : "",
      VITE_HMR_HOST: info ? info.host : "",
      VITE_HMR_PROTOCOL: info ? info.protocol : ""
    }
  });
  return () => {
    viteNode.kill();
    server.close();
    if (fs.existsSync(entryFile)) {
      fs.unlinkSync(entryFile);
    }
  };
}
export {
  startDevServer
};
