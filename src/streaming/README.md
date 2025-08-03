# SvelTUI Streaming System

The SvelTUI Streaming System provides efficient content streaming with backpressure support, leveraging Svelte 5's reactivity system for optimal terminal rendering performance.

## Features

- **Reactive Streaming**: Built on Svelte 5's `$state` and `$derived` runes for efficient reactivity
- **Backpressure Support**: Automatic flow control to prevent buffer overflow
- **Multiple Stream Sources**: Support for ReadableStreams, async generators, and text
- **Performance Optimized**: Chunk-based updates with configurable buffer management
- **Stream Metrics**: Real-time monitoring of stream performance
- **Markdown Support**: Stream markdown content with live rendering

## Usage

### Basic Streaming

```svelte
<script>
  import { StreamingTextAdvanced } from 'sveltui';
  import { textToStream } from 'sveltui';
  
  let stream = textToStream("Hello, streaming world!", {
    chunkSize: 5,
    delay: 50
  });
</script>

<StreamingTextAdvanced 
  {stream}
  showCursor={true}
  markdownMode="full"
/>
```

### Streaming with Backpressure

```javascript
import { createReactiveStream } from 'sveltui';

// Create a reactive stream with backpressure
const stream = createReactiveStream({
  bufferSize: 50,
  autoBackpressure: true,
  onComplete: () => console.log('Stream complete'),
  onError: (err) => console.error('Stream error:', err)
});

// Stream from various sources
await stream.streamFrom(readableStream);
await stream.streamFromGenerator(asyncGenerator);
await stream.streamFromText(text, delayMs);
```

### Stream Control

```svelte
<script>
  let streamRef;
  
  function pauseStream() {
    streamRef.pause();
  }
  
  function resumeStream() {
    streamRef.resume();
  }
  
  function getMetrics() {
    const metrics = streamRef.getMetrics();
    console.log('Chunks received:', metrics.chunksReceived);
    console.log('Bytes received:', metrics.bytesReceived);
    console.log('Buffer usage:', metrics.bufferUsage);
  }
</script>

<StreamingTextAdvanced bind:this={streamRef} />
```

### Mock Claude API Streaming

```javascript
import { createMockClaudeStream } from 'sveltui';

const stream = createMockClaudeStream(
  "Claude's response content...",
  {
    model: 'claude-3-opus',
    streamDelay: 30,
    chunkVariance: true
  }
);
```

## Components

### StreamingTextAdvanced

The main streaming text component with full features:

```svelte
<StreamingTextAdvanced
  stream={readableStream}
  text="Initial text"
  markdownMode="full"
  showCursor={true}
  cursorBlink={true}
  bufferSize={100}
  autoBackpressure={true}
  autoScroll={true}
  scrollSmooth={true}
  clearOldChunks={true}
  keepChunks={20}
  onStreamStart={() => {}}
  onStreamEnd={() => {}}
  onStreamError={(error) => {}}
/>
```

## Stream Utilities

### textToStream
Convert text to a simulated stream:
```javascript
const stream = textToStream(text, {
  chunkSize: 10,
  delay: 50
});
```

### createBackpressureStream
Apply backpressure to any stream:
```javascript
const throttled = createBackpressureStream(source, {
  highWaterMark: 100,
  lowWaterMark: 50,
  onPressure: (high) => console.log('Pressure:', high)
});
```

### throttleStream
Limit stream throughput:
```javascript
const limited = throttleStream(stream, 1000); // 1000 bytes/second
```

### parseSSEStream
Parse Server-Sent Events:
```javascript
for await (const event of parseSSEStream(response.body)) {
  console.log('Event:', event);
}
```

## Examples

Run the demos to see streaming in action:

```bash
# Simple streaming demo
bun --conditions browser examples/streaming-simple-launcher.ts

# Advanced backpressure demo
bun --conditions browser examples/streaming-backpressure-launcher.ts
```

## Performance Tips

1. **Buffer Management**: Adjust `bufferSize` based on your content volume
2. **Chunk Size**: Larger chunks reduce overhead but may feel less smooth
3. **Memory Optimization**: Enable `clearOldChunks` for long streams
4. **Animation Speed**: Balance between smoothness and performance

## Architecture

The streaming system follows Svelte 5's reactivity principles:

- **State Management**: Uses `$state` for mutable stream data
- **Derived Values**: Uses `$derived` for computed content
- **Side Effects**: Uses `$effect` only for cleanup and external operations
- **No State in Effects**: Never updates state inside `$effect` blocks

This ensures optimal performance and prevents reactivity loops.