<script>
  // Advanced TextInput with full terminal capabilities
  let { 
    value = $bindable(''),
    placeholder = 'Type here...',
    label = '',
    width = 30,
    focused = $bindable(false),
    multiline = false,
    height = 3,
    onSubmit = () => {},
    onChange = () => {},
    onFocus = () => {},
    onBlur = () => {},
    history = [],  // Command history for up/down arrows
    style = {},
    cursorStyle = 'block', // 'block', 'line', 'underline'
    showCompletions = false,
    completions = []
  } = $props();
  
  // Internal state
  let cursorPosition = $state(value.length);
  let cursorVisible = $state(true);
  let historyIndex = $state(-1);
  let selectionStart = $state(-1);
  let selectionEnd = $state(-1);
  
  // Cursor blink effect
  $effect(() => {
    if (focused) {
      const interval = setInterval(() => {
        cursorVisible = !cursorVisible;
      }, 530);
      
      return () => clearInterval(interval);
    } else {
      cursorVisible = false;
    }
  });
  
  // Ensure cursor stays in bounds
  $effect(() => {
    if (cursorPosition > value.length) {
      cursorPosition = value.length;
    }
    if (cursorPosition < 0) {
      cursorPosition = 0;
    }
  });
  
  // Get cursor character based on style
  const getCursor = () => {
    if (!cursorVisible || !focused) return '';
    switch (cursorStyle) {
      case 'block': return '█';
      case 'line': return '│';
      case 'underline': return '_';
      default: return '█';
    }
  };
  
  // Display value with cursor and selection
  const displayLines = $derived.by(() => {
    if (!focused && !value) {
      return [{ text: placeholder, style: { fg: 'gray' } }];
    }
    
    const text = value || '';
    const lines = multiline ? text.split('\n') : [text];
    
    // For single line, handle cursor
    if (!multiline) {
      const line = lines[0];
      const cursor = getCursor();
      
      // Handle selection
      if (selectionStart >= 0 && selectionEnd > selectionStart) {
        const before = line.slice(0, selectionStart);
        const selected = line.slice(selectionStart, selectionEnd);
        const after = line.slice(selectionEnd);
        
        return [{
          parts: [
            { text: before, style: {} },
            { text: selected, style: { bg: 'blue', fg: 'white' } },
            { text: after, style: {} }
          ]
        }];
      }
      
      // Normal cursor
      if (cursor) {
        const before = line.slice(0, cursorPosition);
        const after = line.slice(cursorPosition);
        return [{
          text: before + cursor + after,
          style: {}
        }];
      }
      
      return [{ text: line, style: {} }];
    }
    
    // TODO: Handle multiline cursor
    return lines.map(line => ({ text: line, style: {} }));
  });
  
  // Calculate display height
  const displayHeight = $derived(
    multiline ? Math.max(height, displayLines().length + 2) : 3
  );
  
  // Border color based on state
  const borderColor = $derived.by(() => {
    if (focused) return 'cyan';
    if (value) return 'green';
    return 'white';
  });
  
  // Status line
  const statusText = $derived.by(() => {
    if (showCompletions && completions.length > 0) {
      return `Tab: ${completions[0]}`;
    }
    if (multiline) {
      const lines = value.split('\n').length;
      return `${lines} lines, ${value.length} chars`;
    }
    return `${value.length} chars`;
  });
</script>

<box 
  width={width} 
  height={displayHeight} 
  border="line"
  label={label ? ` ${label} ` : ''}
  style={{ 
    border: { fg: borderColor },
    ...style 
  }}
>
  <!-- Main content area -->
  {#each displayLines as line, i}
    {#if line.parts}
      <!-- Line with multiple styled parts -->
      <text top={i} left={1}>
        {#each line.parts as part}
          <text style={part.style}>{part.text}</text>
        {/each}
      </text>
    {:else}
      <!-- Simple line -->
      <text 
        top={i} 
        left={1}
        content={line.text}
        style={line.style}
      />
    {/if}
  {/each}
  
  <!-- Status line for multiline or when focused -->
  {#if focused && (multiline || showCompletions)}
    <text 
      bottom={0} 
      right={1}
      content={statusText}
      style={{ fg: 'gray' }}
    />
  {/if}
  
  <!-- Completion hint -->
  {#if focused && showCompletions && completions.length > 0}
    <box
      top={displayHeight}
      left={0}
      width={width}
      height={Math.min(completions.length + 2, 5)}
      border="line"
      style={{ border: { fg: 'yellow' } }}
    >
      {#each completions.slice(0, 3) as completion, i}
        <text 
          top={i} 
          left={1}
          content={completion}
          style={{ fg: i === 0 ? 'yellow' : 'white' }}
        />
      {/each}
    </box>
  {/if}
</box>