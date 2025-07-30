<script>
  let { 
    value = $bindable(''),
    placeholder = '',
    label = '',
    width = 30,
    focused = false,
    onSubmit = () => {},
    style = {}
  } = $props();
  
  let cursorVisible = $state(true);
  let cursorPosition = $state(value.length);
  
  // Cursor blink effect
  $effect(() => {
    if (focused) {
      const interval = setInterval(() => {
        cursorVisible = !cursorVisible;
      }, 500);
      
      return () => clearInterval(interval);
    } else {
      cursorVisible = false;
    }
  });
  
  // Handle keyboard input
  function handleKeydown(e) {
    if (!focused) return;
    
    // Debug logging to see what keys are coming through
    if (e.key !== e.key.toLowerCase() || ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Home', 'End'].includes(e.key)) {
      // Only log special keys to avoid cluttering with regular typing
      // console.log('[TextInput] Key event:', { key: e.key, code: e.code, keyCode: e.keyCode });
    }
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        cursorPosition = Math.max(0, cursorPosition - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        cursorPosition = Math.min(value.length, cursorPosition + 1);
        break;
      case 'Home':
        e.preventDefault();
        cursorPosition = 0;
        break;
      case 'End':
        e.preventDefault();
        cursorPosition = value.length;
        break;
      case 'Backspace':
        e.preventDefault();
        if (cursorPosition > 0) {
          value = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
          cursorPosition--;
        }
        break;
      case 'Delete':
        e.preventDefault();
        if (cursorPosition < value.length) {
          value = value.slice(0, cursorPosition) + value.slice(cursorPosition + 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        onSubmit(value);
        break;
      default:
        // Insert character if it's a printable character
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          value = value.slice(0, cursorPosition) + e.key + value.slice(cursorPosition);
          cursorPosition++;
        }
    }
  }
  
  // Display value with cursor
  const displayValue = $derived.by(() => {
    if (!focused) return value || placeholder;
    
    const text = value || '';
    const cursor = cursorVisible ? '█' : ' ';
    
    if (cursorPosition >= text.length) {
      return text + cursor;
    }
    
    return text.slice(0, cursorPosition) + cursor + text.slice(cursorPosition + 1);
  });
  
  // Style for placeholder
  const textStyle = $derived(
    !value && !focused ? { fg: 'gray', ...style } : style
  );
</script>

<box 
  width={width} 
  height={3} 
  border="line"
  label={label ? ` ${label} ` : ''}
  style={{ 
    border: { fg: focused ? 'cyan' : 'white' },
    ...style 
  }}
  focused={focused}
  onkeydown={handleKeydown}
>
  <text 
    top={0} 
    left={1}
    content={displayValue}
    style={textStyle}
  />
</box>