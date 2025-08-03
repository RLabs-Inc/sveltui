<script>
  import { renderScreen } from '../src/renderer/screen';
  
  // Simple counter state
  let count = $state(0);
  let updateRate = $state(10); // Updates per second
  
  // Update counter continuously
  let interval = setInterval(() => {
    count++;
    // This will be batched by the scheduler
    renderScreen('normal');
  }, 1000 / updateRate);
  
  // Cleanup
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<box width="100%" height="100%" border>
  <text top="1" left="center" bold>Render Scheduler Test</text>
  <text top="3" left="2">Count: {count}</text>
  <text top="4" left="2">Update Rate: {updateRate}/sec</text>
  <text top="6" left="2" fg="gray">The scheduler should batch these rapid updates</text>
  <text top="7" left="2" fg="gray">to prevent excessive terminal redraws.</text>
</box>