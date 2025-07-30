import { render } from '../src/renderer';

// Launch the basic test example
const cleanup = render('examples/basic-test.svelte.mjs', { 
  title: 'Basic Test',
  fullscreen: false,
  debug: true
});

// Exit on Ctrl+C
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});