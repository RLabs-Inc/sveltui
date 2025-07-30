<script lang="ts">
  import { getContext } from 'svelte';
  import type { Theme } from './theme';
  import { markdownToTaggedString } from './markdown';
  
  // Component props
  let {
    // Text content to display
    text = '',
    
    // Markdown rendering mode
    markdownMode = 'full' as 'subtle' | 'full' | 'none',
    
    // Animation settings
    animated = true,
    animationSpeed = 'word' as 'char' | 'word' | 'instant',
    animationDelay = 16, // 60fps
    
    // Show typing cursor
    showCursor = false,
    cursorChar = '▊',
    
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
    
    // Style overrides
    style = {},
    
    // Z-index for layering
    zIndex,
    
    // Whether the element is visible
    hidden = false,
    
    // Additional props
    ...restProps
  } = $props<{
    text?: string,
    markdownMode?: 'subtle' | 'full' | 'none',
    animated?: boolean,
    animationSpeed?: 'char' | 'word' | 'instant',
    animationDelay?: number,
    showCursor?: boolean,
    cursorChar?: string,
    left?: number | string,
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    width?: number | string,
    height?: number | string,
    align?: string,
    wrap?: boolean,
    border?: boolean | string,
    style?: any,
    zIndex?: number,
    hidden?: boolean,
    [key: string]: any
  }>();
  
  // Get theme from context or use default
  const theme = getContext<Theme>('theme') || {
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
  
  // State for animation
  let displayedText = $state('');
  let animationIndex = $state(0);
  let animationTimer: any = null;
  
  // Process text based on markdown mode
  let processedText = $derived(() => {
    if (markdownMode === 'none') {
      return text;
    }
    return markdownToTaggedString(text, theme, markdownMode);
  });
  
  // Get the raw text without tags for animation
  function stripTags(taggedText: string): string {
    return taggedText.replace(/{[^}]+}/g, '');
  }
  
  // Split text for animation
  let textSegments = $derived(() => {
    if (!animated || animationSpeed === 'instant') {
      return [processedText()];
    }
    
    const rawText = stripTags(processedText());
    
    if (animationSpeed === 'char') {
      return rawText.split('');
    } else {
      // Split by word, preserving spaces
      return rawText.match(/\S+\s*/g) || [];
    }
  });
  
  // Animate text display
  function animateText() {
    if (animationTimer) {
      clearInterval(animationTimer);
    }
    
    if (!animated || animationSpeed === 'instant') {
      displayedText = processedText();
      animationIndex = textSegments.length;
      return;
    }
    
    animationIndex = 0;
    displayedText = '';
    
    animationTimer = setInterval(() => {
      if (animationIndex < textSegments.length) {
        // Build up the displayed text progressively
        const segments = textSegments.slice(0, animationIndex + 1);
        
        if (markdownMode === 'none') {
          displayedText = segments.join('');
        } else {
          // For markdown, we need to rebuild the tagged string up to the current point
          const rawDisplayed = segments.join('');
          const fullRaw = stripTags(processedText());
          
          // Find where we are in the full text and extract that portion
          const endIndex = rawDisplayed.length;
          let charCount = 0;
          let taggedResult = '';
          let inTag = false;
          
          for (let i = 0; i < processedText().length; i++) {
            const char = processedText()[i];
            
            if (char === '{') {
              inTag = true;
              taggedResult += char;
            } else if (char === '}') {
              inTag = false;
              taggedResult += char;
            } else if (!inTag) {
              if (charCount < endIndex) {
                taggedResult += char;
                charCount++;
              } else {
                break;
              }
            } else {
              taggedResult += char;
            }
          }
          
          // Close any open tags
          const openTags = taggedResult.match(/{[^/}]+}/g) || [];
          const closeTags = taggedResult.match(/{\/[^}]+}/g) || [];
          const openTagCounts: Record<string, number> = {};
          const closeTagCounts: Record<string, number> = {};
          
          openTags.forEach(tag => {
            const tagName = tag.replace(/[{}]/g, '');
            openTagCounts[tagName] = (openTagCounts[tagName] || 0) + 1;
          });
          
          closeTags.forEach(tag => {
            const tagName = tag.replace(/[{}/]/g, '');
            closeTagCounts[tagName] = (closeTagCounts[tagName] || 0) + 1;
          });
          
          // Add closing tags for any unclosed tags
          for (const [tagName, openCount] of Object.entries(openTagCounts)) {
            const closeCount = closeTagCounts[tagName] || 0;
            if (openCount > closeCount) {
              taggedResult += `{/${tagName}}`;
            }
          }
          
          displayedText = taggedResult;
        }
        
        animationIndex++;
      } else {
        clearInterval(animationTimer);
        animationTimer = null;
      }
    }, animationDelay);
  }
  
  // React to text changes
  $effect(() => {
    if (text) {
      animateText();
    }
  });
  
  // Final display content with cursor
  let finalContent = $derived(() => {
    let content = displayedText;
    
    if (showCursor && animated && animationIndex < textSegments.length) {
      content += `{${theme.colors.text}-fg}${cursorChar}{/${theme.colors.text}-fg}`;
    }
    
    return content;
  });
  
  // Cleanup
  $effect(() => {
    return () => {
      if (animationTimer) {
        clearInterval(animationTimer);
      }
    };
  });
  
  // Convert border prop to blessed-compatible value
  let borderValue = $derived(typeof border === 'boolean' ? (border ? 'line' : false) : border);
</script>

<ttext
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
  style={style}
  zIndex={zIndex}
  hidden={hidden}
  {...restProps}
/>