<script>
  import { onDestroy } from 'svelte';
  import { getRenderStats, pauseRendering, resumeRendering, renderScreen } from '../src/renderer/screen';
  
  // State for demo
  let counters = $state([
    { id: 'counter1', value: 0, interval: 16, priority: 'high' },
    { id: 'counter2', value: 0, interval: 50, priority: 'normal' },
    { id: 'counter3', value: 0, interval: 100, priority: 'normal' },
    { id: 'counter4', value: 0, interval: 200, priority: 'low' }
  ]);
  
  let showStats = $state(true);
  let isPaused = $state(false);
  let schedulerEnabled = $state(true);
  let renderStats = $state(null);
  
  // Derived values
  let totalUpdates = $derived(counters.reduce((sum, c) => sum + c.value, 0));
  
  // Timer intervals
  let intervals = [];
  
  // Start counter updates
  function startCounters() {
    counters.forEach((counter, index) => {
      const interval = setInterval(() => {
        counters[index].value++;
        // Schedule render with priority
        if (schedulerEnabled) {
          renderScreen(counter.priority, counter.id);
        } else {
          renderScreen();
        }
      }, counter.interval);
      intervals.push(interval);
    });
  }
  
  // Update stats
  let statsInterval = setInterval(() => {
    renderStats = getRenderStats();
  }, 100);
  
  // Key handlers
  function handleKey(key) {
    switch(key) {
      case 'space':
        isPaused = !isPaused;
        if (isPaused) {
          pauseRendering();
          intervals.forEach(clearInterval);
          intervals = [];
        } else {
          resumeRendering();
          startCounters();
        }
        break;
      case 's':
        showStats = !showStats;
        break;
      case 'r':
        // Reset counters
        counters.forEach((_, index) => {
          counters[index].value = 0;
        });
        break;
      case 'e':
        // Toggle scheduler
        schedulerEnabled = !schedulerEnabled;
        break;
    }
  }
  
  // Start counters on mount
  startCounters();
  
  // Cleanup
  onDestroy(() => {
    intervals.forEach(clearInterval);
    clearInterval(statsInterval);
  });
</script>

<box top="0" left="0" width="100%" height="100%" border={{ type: 'line' }} label=" Render Scheduler Demo ">
  <!-- Header -->
  <box top="0" left="0" width="100%" height="3">
    <text top="0" left="center" bold>SvelTUI Render Scheduler Demo</text>
    <text top="1" left="center">Press: [Space] Pause/Resume | [S] Toggle Stats | [R] Reset | [E] Toggle Scheduler | [Q] Quit</text>
  </box>
  
  <!-- Counters Section -->
  <box top="3" left="0" width="50%" height="60%" border={{ type: 'line' }} label=" Counters ">
    {#each counters as counter, i}
      <box top={i * 3} left="0" width="100%" height="3">
        <text top="0" left="1" bold fg={counter.priority === 'high' ? 'red' : counter.priority === 'low' ? 'blue' : 'green'}>
          {counter.id} ({counter.priority}):
        </text>
        <text top="0" left="20">{counter.value}</text>
        <text top="1" left="1" fg="gray">Update: {counter.interval}ms</text>
      </box>
    {/each}
    
    <box top="12" left="0" width="100%" height="3">
      <text top="0" left="1" bold>Total Updates:</text>
      <text top="0" left="20" bold fg="yellow">{totalUpdates}</text>
    </box>
  </box>
  
  <!-- Stats Section -->
  {#if showStats && renderStats}
    <box top="3" left="50%" width="50%" height="60%" border={{ type: 'line' }} label=" Performance Stats ">
      <text top="0" left="1" bold>Scheduler: {schedulerEnabled ? 'ENABLED' : 'DISABLED'}</text>
      <text top="1" left="1">Status: {isPaused ? 'PAUSED' : 'RUNNING'}</text>
      
      {#if renderStats.scheduler}
        <text top="3" left="1" bold underline>Scheduler Stats:</text>
        <text top="4" left="1">Frame Count: {renderStats.scheduler.frameCount}</text>
        <text top="5" left="1">Average FPS: {renderStats.scheduler.averageFPS}</text>
        <text top="6" left="1">Avg Render Time: {renderStats.scheduler.averageRenderTime.toFixed(2)}ms</text>
        <text top="7" left="1">Queued Elements: {renderStats.scheduler.queuedElements}</text>
        <text top="8" left="1">Render Count: {renderStats.scheduler.renderCount}</text>
        
        <text top="10" left="1" bold underline>Queue Stats:</text>
        <text top="11" left="1" fg="red">Immediate: {renderStats.scheduler.queueStats.immediate}</text>
        <text top="12" left="1" fg="yellow">High: {renderStats.scheduler.queueStats.high}</text>
        <text top="13" left="1" fg="green">Normal: {renderStats.scheduler.queueStats.normal}</text>
        <text top="14" left="1" fg="blue">Low: {renderStats.scheduler.queueStats.low}</text>
        <text top="15" left="1">Total Queued: {renderStats.scheduler.queueStats.total}</text>
      {/if}
      
      <text top="17" left="1" bold underline>Screen Stats:</text>
      <text top="18" left="1">Render Count: {renderStats.screen.renderCount}</text>
      <text top="19" left="1">Avg Render Time: {renderStats.screen.averageRenderTime.toFixed(2)}ms</text>
      <text top="20" left="1">Last Render: {renderStats.screen.lastRenderTime.toFixed(2)}ms</text>
    </box>
  {/if}
  
  <!-- Visual Comparison -->
  <box top="65%" left="0" width="100%" height="35%" border={{ type: 'line' }} label=" Visual Comparison ">
    <text top="0" left="1" bold>Benefits of Render Scheduler:</text>
    <text top="1" left="1">✓ Batches multiple updates into single render</text>
    <text top="2" left="1">✓ Reduces terminal flicker and CPU usage</text>
    <text top="3" left="1">✓ Priority-based rendering for responsive UI</text>
    <text top="4" left="1">✓ FPS limiting prevents excessive updates</text>
    
    <text top="6" left="1" bold>Current Mode: {schedulerEnabled ? 'OPTIMIZED' : 'DIRECT'}</text>
    <text top="7" left="1" fg={schedulerEnabled ? 'green' : 'red'}>
      {schedulerEnabled ? '→ Efficient batched rendering active' : '→ Each update triggers immediate render'}
    </text>
  </box>
</box>

<!-- Hidden input for key handling -->
<box top="-1" left="-1" width="1" height="1" keys on:keypress={(e) => handleKey(e.key)} />