/**
 * SvelTUI Development Server
 * 
 * This module provides a development server for SvelTUI components.
 * It uses Vite's development server to compile and serve Svelte components.
 */

import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import sveltuiPlugin from './compiler';

/**
 * Starts a development server for a Svelte component
 * 
 * @param componentPath - Path to the Svelte component
 * @param options - Development server options
 */
export async function startDevServer(
  componentPath: string,
  options: any = {}
) {
  // Get the absolute path to the component
  const absolutePath = path.isAbsolute(componentPath)
    ? componentPath
    : path.resolve(process.cwd(), componentPath);

  // Check if the component exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Component not found: ${absolutePath}`);
  }

  // Create a temporary directory for the build
  const tempDir = path.join(process.cwd(), '.sveltui-dev');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Create a temporary entry file
  const entryFile = path.join(tempDir, 'entry.js');
  const entryContent = `
    import { render } from '${path.relative(tempDir, path.join(process.cwd(), 'src/renderer/index.js'))}';
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

  // Write the entry file
  fs.writeFileSync(entryFile, entryContent);

  // Create a Vite server
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [
      svelte({
        compilerOptions: {
          runes: true,
          compatibility: { componentApi: 5 }
        },
      }),
      // Add the SvelTUI compiler plugin
      {
        name: 'vite-plugin-sveltui',
        transform(code: string, id: string) {
          // Only process Svelte files
          if (id.endsWith('.svelte') || id.endsWith('.svelte.ts')) {
            return sveltuiPlugin({
              debug: true,
              sourcemap: true,
              customElements: {
                // Map HTML elements to terminal elements
                div: 'box',
                span: 'text',
                p: 'text',
                input: 'input',
                button: 'button',
                ul: 'list',
                // Add custom mappings for SvelTUI components
                box: 'box',
                text: 'text',
                list: 'list',
                checkbox: 'checkbox'
              }
            }).transform(code, id);
          }
        }
      }
    ],
    optimizeDeps: {
      exclude: ['svelte/internal'],
    },
    build: {
      target: 'node18',
    },
    server: {
      hmr: false,
    },
  });

  // Start the server
  await server.listen();
  const info = server.config.server.hmr === false
    ? null
    : server.config.server.hmr === true
    ? { protocol: 'ws', host: 'localhost', port: 24678 }
    : server.config.server.hmr;

  // Run the entry file with vite-node
  const viteNode = spawn('node', [
    path.join(process.cwd(), 'node_modules/.bin/vite-node'),
    entryFile
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_HMR_PORT: info ? String(info.port) : '',
      VITE_HMR_HOST: info ? info.host : '',
      VITE_HMR_PROTOCOL: info ? info.protocol : '',
    }
  });

  // Return a function to close the server
  return () => {
    viteNode.kill();
    server.close();
    if (fs.existsSync(entryFile)) {
      fs.unlinkSync(entryFile);
    }
  };
}