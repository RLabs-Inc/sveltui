import { render } from '../src/renderer';

// Launch the text input test example
const cleanup = render('examples/text-input-test.svelte.mjs', { 
  title: 'TextInput Test',
  fullscreen: false,
  debug: true
});

// Exit on Ctrl+C
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});