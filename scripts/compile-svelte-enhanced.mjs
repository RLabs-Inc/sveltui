/**
 * Enhanced SvelTUI Svelte Component Compiler
 * 
 * This script compiles Svelte components to JavaScript and fixes import paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as svelte from 'svelte/compiler';

/**
 * Transform imports in the compiled code to use .mjs extensions
 * 
 * @param {string} code - The compiled JavaScript code
 * @returns {string} - The transformed code
 */
function transformImports(code) {
  // Replace .svelte imports with .svelte.mjs
  return code.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+\.svelte)['"]/g,
    "import $1 from '$2.mjs'"
  );
}

/**
 * Compile a Svelte component to JavaScript
 * 
 * @param {string} componentPath - Path to the Svelte component file
 * @param {object} options - Compiler options
 * @returns {string} - Path to the compiled JavaScript file
 */
export function compileComponent(componentPath, options = {}) {
  console.log(`Compiling Svelte component: ${componentPath}`);
  
  // Read the component file
  const componentCode = fs.readFileSync(componentPath, 'utf-8');
  
  // Compile the component
  const { js, css } = svelte.compile(componentCode, {
    filename: componentPath,
    dev: options.dev !== false,
    generate: 'client', // Explicitly generate client-side code
    css: options.css === false ? 'external' : 'injected',
    // Enable Svelte 5 runes
    runes: true,
    // Ensure we're using Svelte 5 component API
    compatibility: {
      componentApi: 5
    }
  });
  
  // Transform the compiled code to fix imports
  const transformedCode = transformImports(js.code);
  
  // Output path
  const outputPath = options.outputPath || `${componentPath}.mjs`;
  
  // Write the compiled JS
  fs.writeFileSync(outputPath, transformedCode);
  
  // Write CSS if available and requested
  if (css && css.code && options.css !== false) {
    const cssPath = outputPath.replace(/\.mjs$/, '.css');
    fs.writeFileSync(cssPath, css.code);
  }
  
  console.log(`Component compiled to: ${outputPath}`);
  return outputPath;
}

// If called directly from the command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: No component path provided');
    console.log('Usage: node compile-svelte-enhanced.mjs <component-path> [output-path]');
    process.exit(1);
  }
  
  const componentPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : undefined;
  
  try {
    compileComponent(componentPath, { outputPath });
  } catch (error) {
    console.error('Error compiling component:', error);
    process.exit(1);
  }
}

export default compileComponent;