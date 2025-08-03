/**
 * SvelTUI Svelte TypeScript Module Compiler
 * 
 * This script compiles .svelte.ts files containing Svelte 5 runes
 */

import fs from 'fs';
import path from 'path';
import * as svelte from 'svelte/compiler';

/**
 * Compile a Svelte TypeScript module to JavaScript
 * 
 * @param {string} modulePath - Path to the .svelte.ts file
 * @param {object} options - Compiler options
 * @returns {string} - Path to the compiled JavaScript file
 */
export function compileSvelteTS(modulePath, options = {}) {
  console.log(`Compiling Svelte TS module: ${modulePath}`);
  
  // Read the module file
  const moduleCode = fs.readFileSync(modulePath, 'utf-8');
  
  // Compile the module (it's a module, not a component)
  const { js } = svelte.compileModule(moduleCode, {
    filename: modulePath,
    dev: options.dev !== false,
    generate: 'client',
  });
  
  // Output path - change .svelte.ts to .svelte.js
  const outputPath = options.outputPath || modulePath.replace(/\.svelte\.ts$/, '.svelte.js');
  
  // Write the compiled JS
  fs.writeFileSync(outputPath, js.code);
  
  console.log(`Module compiled to: ${outputPath}`);
  return outputPath;
}

// If called directly from the command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: No module path provided');
    console.log('Usage: node compile-svelte-ts.mjs <module-path> [output-path]');
    process.exit(1);
  }
  
  const modulePath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : undefined;
  
  try {
    compileSvelteTS(modulePath, { outputPath });
  } catch (error) {
    console.error('Error compiling module:', error);
    process.exit(1);
  }
}

export default compileSvelteTS;