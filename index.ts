/**
 * SvelTUI - A Svelte Terminal UI Framework
 * 
 * This is the main entry point for the SvelTUI framework.
 * It exports all public APIs for application development.
 */

// Export all public APIs
export * from './src/api';

// Export compiler plugin
export { default as sveltuiPlugin } from './src/compiler';

/**
 * Framework info
 */
export const VERSION = '0.1.0';
export const FRAMEWORK_NAME = 'SvelTUI';

/**
 * Output a welcome message to the console when imported directly
 */
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log(`${FRAMEWORK_NAME} ${VERSION} initialized`);
  console.log('A Svelte-powered terminal UI framework');
}