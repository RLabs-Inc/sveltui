<script>
  import { createReactiveStream } from '../src/streaming/reactive-stream.svelte.ts';
  import { textToStream } from '../src/streaming/stream-utils';
  import StreamingTextAdvanced from '../src/components/ui/StreamingTextAdvanced.svelte.mjs';
  
  // Demo content
  const sampleText = `Hello! I'm demonstrating the streaming text component.

This text is being streamed word by word with backpressure support.

Watch as the content flows smoothly onto your screen, with:
- Automatic flow control
- Markdown rendering
- Smooth animations
- Cursor indicator

Pretty cool, right? 🚀`;
  
  // State
  let isStreaming = $state(false);
  let streamRef = null;
  let activeStream = $state(null);
  
  // Start streaming
  function startStream() {
    if (activeStream) {
      stopStream();
    }
    
    activeStream = textToStream(sampleText, {
      chunkSize: 5,
      delay: 80
    });
    
    isStreaming = true;
  }
  
  // Stop streaming
  function stopStream() {
    if (streamRef) {
      streamRef.cancel();
    }
    activeStream = null;
    isStreaming = false;
  }
</script>

<box width="100%" height="100%" border={{ type: 'line' }}>
  <box label=" 🌊 Simple Streaming Demo " width="100%" height={3} border={{ type: 'line' }}>
    <text left={1} top={0}>Watch text stream with reactive updates!</text>
  </box>
  
  <box top={3} width="100%" height={5} border={{ type: 'line' }}>
    <button
      left={1}
      top={1}
      content=" Start Streaming "
      onPress={startStream}
      disabled={isStreaming}
      style={{ bg: isStreaming ? 'gray' : 'green', fg: 'white' }}
    />
    <button
      left={19}
      top={1}
      content=" Stop Streaming "
      onPress={stopStream}
      disabled={!isStreaming}
      style={{ bg: !isStreaming ? 'gray' : 'red', fg: 'white' }}
    />
    
    <text left={1} top={3} fg={isStreaming ? 'green' : 'gray'}>
      Status: {isStreaming ? 'STREAMING...' : 'IDLE'}
    </text>
  </box>
  
  <box top={8} width="100%" height="-1" border={{ type: 'line' }} label=" Content ">
    <StreamingTextAdvanced
      bind:this={streamRef}
      stream={activeStream}
      showCursor={true}
      cursorBlink={true}
      autoScroll={true}
      scrollable={true}
      markdownMode="subtle"
      animationSpeed="word"
      animationDelay={10}
      onStreamEnd={() => { isStreaming = false; }}
    />
  </box>
</box>