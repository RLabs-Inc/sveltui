<script>
  import { createReactiveStream } from '../../streaming/reactive-stream.svelte.ts';
  import { getContext } from 'svelte';
  import { markdownToTaggedString, parseMarkdown, tokensToTaggedString } from './markdown';
  
  // Component props
  let {
    // Stream source - can be various types
    stream = null,
    text = '', // Initial or static text
    
    // Markdown rendering
    markdownMode = 'full',
    
    // Animation settings
    animationSpeed = 'word',
    animationDelay = 16,
    
    // Show typing cursor during streaming
    showCursor = true,
    cursorChar = '▊',
    cursorBlink = true,
    
    // Backpressure settings
    bufferSize = 100,
    autoBackpressure = true,
    
    // Auto-scroll behavior
    autoScroll = true,
    scrollSmooth = true,
    
    // Performance optimization
    clearOldChunks = true,
    keepChunks = 20,
    
    // Callbacks
    onStreamStart = () => {},
    onStreamEnd = () => {},
    onStreamError = (error) => {},
    
    // Position properties
    left = 0,
    top = 0,
    right,
    bottom,
    
    // Dimension properties
    width = '100%',
    height = 'shrink',
    
    // Text alignment
    align = 'left',
    
    // Text wrapping
    wrap = true,
    
    // Border
    border = false,
    
    // Scrollable
    scrollable = false,
    alwaysScroll = false,
    
    // Style overrides
    style = {},
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props
    ...restProps
  } = $props();
  
  // Get theme from context
  const theme = getContext('theme') || {
    name: 'default',
    colors: {
      text: 'white',
      emphasis: 'italic',
      strong: 'bold',
      code: 'yellow',
      codeBlock: 'yellow',
      link: 'blue',
      heading1: 'bright-white',
      heading2: 'bright-white',
      heading3: 'white',
      heading4: 'white',
      heading5: 'gray',
      heading6: 'gray',
      quote: 'gray',
      list: 'white',
      border: 'gray'
    }
  };
  
  // Create reactive stream instance
  const reactiveStream = createReactiveStream({
    bufferSize,
    autoBackpressure,
    onComplete: () => {
      isStreaming = false;
      onStreamEnd();
    },
    onError: (error) => {
      isStreaming = false;
      onStreamError(error);
    }
  });
  
  // State
  let isStreaming = $state(false);
  let displayedContent = $state(text);
  let cursorVisible = $state(true);
  let cursorTimer = null;
  let scrollElement = null;
  
  // Derived values
  let streamContent = $derived(reactiveStream.content);
  let streamMetrics = $derived(reactiveStream.streamMetrics);
  let isPaused = $derived(reactiveStream.paused);
  let hasError = $derived(reactiveStream.hasError);
  let error = $derived(reactiveStream.streamError);
  
  // Combined content (initial text + streamed content)
  let fullContent = $derived(() => {
    if (streamContent) {
      return text ? text + streamContent : streamContent;
    }
    return text;
  });
  
  // Process content for markdown
  let processedContent = $derived(() => {
    const content = fullContent();
    if (!content || markdownMode === 'none') {
      return content || '';
    }
    
    try {
      return markdownToTaggedString(content, theme, markdownMode);
    } catch (e) {
      // If markdown parsing fails during streaming, return raw content
      return content;
    }
  });
  
  // Animated content display
  let animatedContent = $state('');
  let animationIndex = $state(0);
  let animationTimer = null;
  
  // Get raw text without tags
  function stripTags(taggedText) {
    return taggedText.replace(/{[^}]+}/g, '');
  }
  
  // Split text for animation
  let textSegments = $derived(() => {
    if (animationSpeed === 'instant') {
      return [processedContent()];
    }
    
    const rawText = stripTags(processedContent());
    
    if (animationSpeed === 'char') {
      return rawText.split('');
    } else {
      // Split by word, preserving spaces
      return rawText.match(/\S+\s*/g) || [];
    }
  });
  
  // Animate content display
  function animateContent() {
    if (animationTimer) {
      clearInterval(animationTimer);
    }
    
    if (animationSpeed === 'instant') {
      animatedContent = processedContent();
      animationIndex = textSegments().length;
      return;
    }
    
    // Continue from current position if streaming
    if (isStreaming && animationIndex > 0) {
      // Just continue animation
    } else {
      animationIndex = 0;
      animatedContent = '';
    }
    
    animationTimer = setInterval(() => {
      const segments = textSegments();
      if (animationIndex < segments.length) {
        // Build up the displayed text progressively
        const displaySegments = segments.slice(0, animationIndex + 1);
        
        if (markdownMode === 'none') {
          animatedContent = displaySegments.join('');
        } else {
          // For markdown, rebuild tagged string up to current point
          const rawDisplayed = displaySegments.join('');
          const fullProcessed = processedContent();
          
          // Extract portion of tagged string
          let charCount = 0;
          let result = '';
          let inTag = false;
          let openTags = [];
          
          for (let i = 0; i < fullProcessed.length; i++) {
            const char = fullProcessed[i];
            
            if (char === '{') {
              inTag = true;
              result += char;
            } else if (char === '}') {
              inTag = false;
              result += char;
              
              // Track open/close tags
              const tag = result.match(/{([^}]+)}$/)?.[1];
              if (tag) {
                if (tag.startsWith('/')) {
                  openTags = openTags.filter(t => t !== tag.substring(1));
                } else {
                  openTags.push(tag.split('-')[0]);
                }
              }
            } else if (!inTag) {
              if (charCount < rawDisplayed.length) {
                result += char;
                charCount++;
              } else {
                break;
              }
            } else {
              result += char;
            }
          }
          
          // Close any open tags
          for (let i = openTags.length - 1; i >= 0; i--) {
            result += `{/${openTags[i]}}`;
          }
          
          animatedContent = result;
        }
        
        animationIndex++;
        
        // Auto-scroll if needed
        if (autoScroll && scrollElement) {
          scrollToBottom();
        }
      } else {
        clearInterval(animationTimer);
        animationTimer = null;
      }
    }, animationDelay);
  }
  
  // Start/restart animation when content changes
  $effect(() => {
    const content = processedContent();
    if (content) {
      animateContent();
    }
  });
  
  // Handle cursor blinking
  $effect(() => {
    if (showCursor && cursorBlink && isStreaming) {
      cursorTimer = setInterval(() => {
        cursorVisible = !cursorVisible;
      }, 500);
      
      return () => {
        if (cursorTimer) {
          clearInterval(cursorTimer);
          cursorTimer = null;
        }
      };
    } else {
      cursorVisible = true;
    }
  });
  
  // Stream handling
  async function startStream(source) {
    if (!source) return;
    
    isStreaming = true;
    onStreamStart();
    
    try {
      if (source instanceof ReadableStream) {
        await reactiveStream.streamFrom(source);
      } else if (source.next && typeof source.next === 'function') {
        // Async generator
        await reactiveStream.streamFromGenerator(source);
      } else if (typeof source === 'string') {
        // Demo mode - stream text slowly
        await reactiveStream.streamFromText(source, 50);
      }
    } catch (err) {
      onStreamError(err);
    }
  }
  
  // Watch for stream prop changes
  $effect(() => {
    if (stream) {
      startStream(stream);
    }
  });
  
  // Clean up old chunks periodically for memory efficiency
  $effect(() => {
    if (clearOldChunks && isStreaming) {
      const interval = setInterval(() => {
        reactiveStream.clearConsumedChunks(keepChunks);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  });
  
  // Scroll to bottom helper
  function scrollToBottom() {
    if (scrollElement && scrollElement.scrollTo) {
      if (scrollSmooth) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }
  
  // Final display content with cursor
  let finalContent = $derived(() => {
    let content = animatedContent;
    
    if (showCursor && isStreaming && cursorVisible) {
      content += `{${theme.colors.text}-fg}${cursorChar}{/${theme.colors.text}-fg}`;
    }
    
    return content;
  });
  
  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (animationTimer) {
        clearInterval(animationTimer);
      }
      if (cursorTimer) {
        clearInterval(cursorTimer);
      }
      reactiveStream.cancel();
    };
  });
  
  // Convert border prop
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
  
  // Expose methods for external control
  export function pause() {
    reactiveStream.pause();
  }
  
  export function resume() {
    reactiveStream.resume();
  }
  
  export function cancel() {
    reactiveStream.cancel();
  }
  
  export function reset() {
    reactiveStream.reset();
    animatedContent = '';
    animationIndex = 0;
  }
  
  export function getMetrics() {
    return reactiveStream.streamMetrics;
  }
</script>

<ttext
  bind:this={scrollElement}
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  content={finalContent()}
  align={align}
  wrap={wrap}
  tags={true}
  border={borderValue}
  scrollable={scrollable}
  alwaysScroll={alwaysScroll}
  style={style}
  zIndex={zIndex}
  hidden={hidden}
  {...restProps}
/>