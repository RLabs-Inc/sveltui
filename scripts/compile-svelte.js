/**
 * SvelTUI Svelte Component Compiler
 * 
 * This script compiles Svelte components to JavaScript
 */

const fs = require('fs');
const path = require('path');
const svelte = require('svelte/compiler');

/**
 * Compile a Svelte component to JavaScript
 * 
 * @param {string} componentPath - Path to the Svelte component file
 * @param {object} options - Compiler options
 * @returns {string} - Path to the compiled JavaScript file
 */
function compileComponent(componentPath, options = {}) {
  console.log(`Compiling Svelte component: ${componentPath}`);
  
  // Read the component file
  const componentCode = fs.readFileSync(componentPath, 'utf-8');
  
  // Compile the component
  const { js, css } = svelte.compile(componentCode, {
    filename: componentPath,
    format: 'cjs',
    sveltePath: 'svelte',
    dev: options.dev !== false,
    css: options.css !== false,
    hydratable: false,
    immutable: false,
    legacy: false,
    accessors: false,
    preserveComments: false,
    preserveWhitespace: false,
    // Enable Svelte 5 runes
    runes: true,
    // Ensure we're using Svelte 5 component API
    compatibility: {
      componentApi: 5
    }
  });
  
  // Output path
  const outputPath = options.outputPath || componentPath + '.js';
  
  // Write the compiled JS
  fs.writeFileSync(outputPath, js.code);
  
  // Write CSS if available and requested
  if (css && css.code && options.css !== false) {
    const cssPath = outputPath.replace(/\.js$/, '.css');
    fs.writeFileSync(cssPath, css.code);
  }
  
  console.log(`Component compiled to: ${outputPath}`);
  return outputPath;
}

// If called directly from the command line
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: No component path provided');
    console.log('Usage: node compile-svelte.js <component-path> [output-path]');
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

module.exports = compileComponent;