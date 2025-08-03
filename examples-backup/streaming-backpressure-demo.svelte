<script>
  import { createReactiveStream } from '../src/streaming/reactive-stream.svelte.ts';
  import { createMockClaudeStream, textToStream, throttleStream } from '../src/streaming/stream-utils';
  import StreamingTextAdvanced from '../src/components/ui/StreamingTextAdvanced.svelte.mjs';
  
  // Demo content
  const claudeResponse = `# Understanding Backpressure in Streaming Systems

Backpressure is a crucial concept in streaming systems that helps manage the flow of data between producers and consumers. Let me explain this concept with some examples.

## What is Backpressure?

**Backpressure** occurs when a data consumer cannot process incoming data as fast as the producer is generating it. Think of it like a water pipe system:

- The **producer** is like a water tap
- The **consumer** is like a drain
- The **buffer** is like a sink basin

When the drain can't empty water as fast as the tap fills it, the sink starts to overflow - that's when we need backpressure!

## Why is Backpressure Important?

1. **Memory Management**: Without backpressure, buffers can grow unbounded, leading to memory exhaustion
2. **System Stability**: Prevents system crashes due to resource overload
3. **Flow Control**: Ensures smooth data flow throughout the pipeline
4. **Performance**: Maintains optimal throughput without overwhelming any component

## Common Backpressure Strategies

### 1. Pause/Resume Pattern
The simplest strategy - pause the producer when the buffer is full:

\`\`\`javascript
if (buffer.length >= maxSize) {
  producer.pause();
}
\`\`\`

### 2. Token Bucket Algorithm
Limit the rate of data production using tokens:

\`\`\`javascript
const tokens = refillTokens(elapsed);
if (tokens >= required) {
  produceData();
}
\`\`\`

### 3. Sliding Window
Control flow using acknowledgments and window sizes.

## Real-world Applications

- **Video Streaming**: Netflix adjusts quality based on network speed
- **Message Queues**: RabbitMQ implements flow control
- **Database Replication**: MongoDB uses backpressure for replica synchronization
- **API Rate Limiting**: Web services limit request rates

## Best Practices

1. **Monitor Buffer Sizes**: Keep track of queue depths
2. **Set Reasonable Limits**: Don't make buffers too small or too large
3. **Graceful Degradation**: Have fallback strategies when overwhelmed
4. **Metrics & Alerting**: Monitor system health proactively

Remember: *Good backpressure design is invisible to users but critical for system reliability!*`;
  
  // State
  let activeStream = $state(null);
  let streamingMode = $state('claude');
  let isPaused = $state(false);
  let metrics = $state(null);
  let bufferVisualization = $state([]);
  let customText = $state('');
  let streamSpeed = $state(30);
  let bufferSize = $state(50);
  
  // Stream control
  let streamingTextRef = null;
  
  // Start streaming based on mode
  async function startStreaming() {
    if (activeStream) {
      await stopStreaming();
    }
    
    switch (streamingMode) {
      case 'claude':
        activeStream = createMockClaudeStream(claudeResponse, {
          streamDelay: streamSpeed,
          chunkVariance: true
        });
        break;
        
      case 'fast':
        activeStream = textToStream(claudeResponse, {
          chunkSize: 50,
          delay: 10
        });
        break;
        
      case 'throttled':
        const baseStream = textToStream(claudeResponse, {
          chunkSize: 20,
          delay: 0
        });
        activeStream = throttleStream(baseStream, 100, chunk => chunk.length);
        break;
        
      case 'custom':
        if (!customText) {
          customText = 'Enter some text to stream in the input above...';
        }
        activeStream = textToStream(customText, {
          chunkSize: 5,
          delay: streamSpeed
        });
        break;
    }
    
    // Reset the streaming component
    if (streamingTextRef) {
      streamingTextRef.reset();
    }
  }
  
  async function stopStreaming() {
    if (streamingTextRef) {
      await streamingTextRef.cancel();
    }
    activeStream = null;
    isPaused = false;
  }
  
  function pauseStream() {
    if (streamingTextRef) {
      streamingTextRef.pause();
      isPaused = true;
    }
  }
  
  function resumeStream() {
    if (streamingTextRef) {
      streamingTextRef.resume();
      isPaused = false;
    }
  }
  
  // Update metrics periodically
  $effect(() => {
    const interval = setInterval(() => {
      if (streamingTextRef) {
        metrics = streamingTextRef.getMetrics();
        
        // Update buffer visualization
        if (metrics) {
          const usage = Math.floor(metrics.bufferUsage * 10);
          bufferVisualization = Array(10).fill(false).map((_, i) => i < usage);
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  });
  
  // Format metrics for display
  let metricsDisplay = $derived(() => {
    if (!metrics) return 'No metrics available';
    
    const rate = Math.round((metrics.bytesReceived / ((Date.now() - metrics.startTime) / 1000)) || 0);
    const duration = Math.round((Date.now() - metrics.startTime) / 1000);
    
    return `Chunks: ${metrics.chunksReceived} | Bytes: ${metrics.bytesReceived} | Rate: ${rate} B/s | Duration: ${duration}s`;
  });
  
  // Stream mode descriptions
  const modeDescriptions = {
    claude: 'Simulates Claude API streaming with variable chunk sizes',
    fast: 'Fast streaming with large chunks',
    throttled: 'Throttled stream limited to 100 bytes/second',
    custom: 'Stream your own custom text'
  };
</script>

<box width="100%" height="100%" border={{ type: 'line' }}>
  <box label=" 🌊 Streaming with Backpressure Demo " width="100%" height={3} border={{ type: 'line' }}>
    <text left={1} top={0}>Control streaming behavior and observe backpressure in action</text>
  </box>
  
  <!-- Control Panel -->
  <box top={3} width="100%" height={12} border={{ type: 'line' }} label=" Controls ">
    <!-- Stream Mode Selection -->
    <text left={1} top={0} bold>Stream Mode:</text>
    <list
      top={1}
      left={1}
      width={30}
      height={4}
      border={{ type: 'line' }}
      items={['claude', 'fast', 'throttled', 'custom']}
      selected={['claude', 'fast', 'throttled', 'custom'].indexOf(streamingMode)}
      onSelect={(item) => { streamingMode = item.content; }}
      style={{ selected: { bg: 'blue' } }}
    />
    
    <text left={35} top={0}>{modeDescriptions[streamingMode]}</text>
    
    <!-- Speed Control -->
    <text left={35} top={2} bold>Stream Speed: {streamSpeed}ms</text>
    <button
      left={35}
      top={3}
      content=" Slower "
      onPress={() => { streamSpeed = Math.min(200, streamSpeed + 10); }}
      style={{ bg: 'gray', fg: 'white', focus: { bg: 'white', fg: 'black' } }}
    />
    <button
      left={45}
      top={3}
      content=" Faster "
      onPress={() => { streamSpeed = Math.max(10, streamSpeed - 10); }}
      style={{ bg: 'gray', fg: 'white', focus: { bg: 'white', fg: 'black' } }}
    />
    
    <!-- Buffer Size Control -->
    <text left={35} top={5} bold>Buffer Size: {bufferSize}</text>
    <button
      left={35}
      top={6}
      content=" Increase "
      onPress={() => { bufferSize = Math.min(200, bufferSize + 10); }}
      style={{ bg: 'gray', fg: 'white', focus: { bg: 'white', fg: 'black' } }}
    />
    <button
      left={46}
      top={6}
      content=" Decrease "
      onPress={() => { bufferSize = Math.max(10, bufferSize - 10); }}
      style={{ bg: 'gray', fg: 'white', focus: { bg: 'white', fg: 'black' } }}
    />
    
    <!-- Custom Text Input -->
    {#if streamingMode === 'custom'}
      <textinput
        left={1}
        top={6}
        width={30}
        height={3}
        label=" Custom Text "
        border={{ type: 'line' }}
        value={customText}
        onSubmit={(value) => { customText = value; }}
      />
    {/if}
    
    <!-- Control Buttons -->
    <button
      left={1}
      top={9}
      content=" ▶ Start Stream "
      onPress={startStreaming}
      style={{ bg: 'green', fg: 'white', focus: { bg: 'white', fg: 'green' } }}
    />
    <button
      left={18}
      top={9}
      content=" ⏸ Pause "
      onPress={pauseStream}
      disabled={!activeStream || isPaused}
      style={{ bg: isPaused ? 'gray' : 'yellow', fg: 'black', focus: { bg: 'white', fg: 'black' } }}
    />
    <button
      left={29}
      top={9}
      content=" ▶ Resume "
      onPress={resumeStream}
      disabled={!activeStream || !isPaused}
      style={{ bg: !isPaused ? 'gray' : 'blue', fg: 'white', focus: { bg: 'white', fg: 'blue' } }}
    />
    <button
      left={40}
      top={9}
      content=" ⏹ Stop "
      onPress={stopStreaming}
      disabled={!activeStream}
      style={{ bg: 'red', fg: 'white', focus: { bg: 'white', fg: 'red' } }}
    />
  </box>
  
  <!-- Metrics Display -->
  <box top={15} width="100%" height={4} border={{ type: 'line' }} label=" Metrics ">
    <text left={1} top={0}>{metricsDisplay()}</text>
    <text left={1} top={1}>Buffer Usage: [{bufferVisualization.map(filled => filled ? '█' : '░').join('')}] {Math.round((metrics?.bufferUsage || 0) * 100)}%</text>
    <text left={1} top={2} fg={isPaused ? 'yellow' : 'green'}>Status: {isPaused ? 'PAUSED' : (activeStream ? 'STREAMING' : 'IDLE')}</text>
  </box>
  
  <!-- Streaming Content Display -->
  <box top={19} width="100%" height="-1" border={{ type: 'line' }} label=" Streamed Content ">
    <StreamingTextAdvanced
      bind:this={streamingTextRef}
      stream={activeStream}
      bufferSize={bufferSize}
      markdownMode="full"
      showCursor={true}
      cursorBlink={true}
      autoScroll={true}
      scrollable={true}
      alwaysScroll={true}
      animationSpeed="word"
      animationDelay={5}
      onStreamStart={() => { metrics = null; }}
      onStreamEnd={() => { activeStream = null; }}
      onStreamError={(err) => { console.error('Stream error:', err); }}
      style={{ bg: 'black' }}
    />
  </box>
</box>