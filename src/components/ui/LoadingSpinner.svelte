<script>
  let { 
    style = 'dots',
    speed = 80,
    text = '',
    color = 'cyan',
    bold = false,
    dim = false
  } = $props();

  // Animation frames for different spinner styles
  const spinners = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['-', '\\', '|', '/'],
    circle: ['◐', '◓', '◑', '◒'],
    pulse: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'],
    dots2: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
    dots3: ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳', '⠓'],
    arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
    bouncing: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
    bar: ['▉', '▊', '▋', '▌', '▍', '▎', '▏', '▎', '▍', '▌', '▋', '▊', '▉'],
    star: ['✶', '✸', '✹', '✺', '✹', '✸']
  };

  let frameIndex = $state(0);
  let intervalId = $state(null);
  
  // Get the current spinner frames based on style
  let frames = $derived(spinners[style] || spinners.dots);
  let currentFrame = $derived(frames[frameIndex % frames.length]);

  // Manage animation lifecycle
  $effect(() => {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Start new animation
    intervalId = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
    }, speed);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });
</script>

<box width="100%" height={1}>
  <text 
    fg={color} 
    bold={bold}
    dim={dim}
  >
    {currentFrame}{text ? ` ${text}` : ''}
  </text>
</box>