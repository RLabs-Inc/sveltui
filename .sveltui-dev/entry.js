
    import { render } from '../src/renderer/index.js';
    import Component from '../examples/basic-svelte/BasicApp.svelte';

    // Render the component
    const cleanup = render(Component, {"title":"SvelTUI Development Demo","fullscreen":true,"debug":true,"autofocus":true,"blessed":{"fullUnicode":false,"smartCSR":true,"fastCSR":true}});

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
  