/**
 * SvelTUI Runtime API Example
 * 
 * This example uses the runtime API directly
 */

// Import the runtime API
const { 
  createElement,
  createText,
  appendChild,
  setText,
  setAttribute,
  addEventListener
} = require('../src/api/runtime');

// Import the renderer
const { render } = require('../src/renderer');

// Import document
const { document } = require('../src/dom');

try {
  console.log('Starting SvelTUI Runtime API Example...');
  
  // Create a simple component function
  function SimpleCounter() {
    // Return a function that accepts a target element
    return function(target) {
      // Initial count
      let count = 0;
      
      // Create our UI elements
      
      // Main container
      const container = createElement('box');
      setAttribute(container, 'border', 'line');
      setAttribute(container, 'label', 'SvelTUI Runtime API Demo');
      setAttribute(container, 'width', '100%');
      setAttribute(container, 'height', '100%');
      
      // Counter display
      const counterDisplay = createElement('text');
      setAttribute(counterDisplay, 'top', 2);
      setAttribute(counterDisplay, 'left', 'center');
      const counterText = createText(`Count: ${count}`);
      appendChild(counterDisplay, counterText);
      appendChild(container, counterDisplay);
      
      // Increment button
      const incrementButton = createElement('box');
      setAttribute(incrementButton, 'top', 5);
      setAttribute(incrementButton, 'left', '30%');
      setAttribute(incrementButton, 'width', 15);
      setAttribute(incrementButton, 'height', 3);
      setAttribute(incrementButton, 'border', 'line');
      setAttribute(incrementButton, 'style', {
        border: {
          fg: 'blue'
        }
      });
      
      const incrementText = createElement('text');
      setAttribute(incrementText, 'content', ' + ');
      setAttribute(incrementText, 'style', {
        fg: 'white',
        bg: 'blue'
      });
      appendChild(incrementButton, incrementText);
      appendChild(container, incrementButton);
      
      // Add event listener for increment
      addEventListener(incrementButton, 'click', () => {
        count++;
        setText(counterText, `Count: ${count}`);
      });
      
      // Decrement button
      const decrementButton = createElement('box');
      setAttribute(decrementButton, 'top', 5);
      setAttribute(decrementButton, 'left', '60%');
      setAttribute(decrementButton, 'width', 15);
      setAttribute(decrementButton, 'height', 3);
      setAttribute(decrementButton, 'border', 'line');
      setAttribute(decrementButton, 'style', {
        border: {
          fg: 'red'
        }
      });
      
      const decrementText = createElement('text');
      setAttribute(decrementText, 'content', ' - ');
      setAttribute(decrementText, 'style', {
        fg: 'white',
        bg: 'red'
      });
      appendChild(decrementButton, decrementText);
      appendChild(container, decrementButton);
      
      // Add event listener for decrement
      addEventListener(decrementButton, 'click', () => {
        if (count > 0) {
          count--;
          setText(counterText, `Count: ${count}`);
        }
      });
      
      // Footer
      const footerText = createElement('text');
      setAttribute(footerText, 'bottom', 1);
      setAttribute(footerText, 'left', 'center');
      setAttribute(footerText, 'content', 'Press +/- to change counter | Press q or Ctrl+C to exit');
      setAttribute(footerText, 'style', {
        fg: 'gray'
      });
      appendChild(container, footerText);
      
      // Add all elements to the target
      appendChild(target, container);
      
      // Return a cleanup function
      return {
        destroy() {
          // No need to manually clean up, the renderer will handle it
        }
      };
    };
  }
  
  // Render the component
  const cleanup = render(SimpleCounter(), {
    title: 'SvelTUI Runtime API Demo',
    fullscreen: true,
    debug: true,
    blessed: {
      smartCSR: true,
      // Quit on Escape, q, or Control-C
      input: process.stdin,
      keys: true,
      fullUnicode: false
    }
  });
  
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
  
  console.log('SvelTUI Runtime API Demo started. Press q or Ctrl+C to exit.');
} catch (error) {
  console.error('Error starting SvelTUI Runtime API Demo:', error);
  process.exit(1);
}