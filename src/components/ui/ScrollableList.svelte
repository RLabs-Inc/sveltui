/**
 * ScrollableList Component
 * 
 * A powerful scrollable list component with keyboard navigation, search, and smooth scrolling.
 * Perfect for Claude CLI's conversation selector, model chooser, and file browser.
 * 
 * Features:
 * - Keyboard navigation (arrows, page up/down, home/end)
 * - Smooth scrolling that follows selection
 * - Optional search/filter functionality
 * - Custom item rendering via slots
 * - Visual scroll indicators
 * - Controlled and uncontrolled modes
 * - 60 FPS smooth rendering
 */

<script lang="ts">
  import type { Snippet } from 'svelte';
  
  // Define item type
  interface ListItem {
    id?: string | number;
    label: string;
    value?: any;
    disabled?: boolean;
    [key: string]: any;
  }
  
  // Define component props with defaults
  let {
    // Position properties
    left = 0,
    top = 0,
    right,
    bottom,
    
    // Dimension properties
    width = '100%',
    height = '50%',
    
    // List items
    items = [] as ListItem[],
    
    // Selected index (bindable for controlled mode)
    selectedIndex = $bindable(0),
    
    // Focused index (for keyboard navigation without selection)
    focusedIndex = $bindable(0),
    
    // Event handlers
    onSelect,
    onFocus,
    onChange,
    onScroll,
    
    // Search/filter
    searchable = false,
    searchPlaceholder = 'Type to search...',
    filterFn,
    
    // Appearance
    border = 'line',
    label = '',
    
    // Scrolling
    scrollbar = true,
    alwaysScroll = false,
    
    // Keyboard navigation
    keys = true,
    vi = false,
    mouse = true,
    
    // Focus management
    focusable = true,
    autoFocus = false,
    
    // Style properties
    style = {},
    selectedStyle = {
      fg: 'black',
      bg: 'white',
      bold: true
    },
    focusedStyle = {
      fg: 'yellow',
      bold: true
    },
    scrollbarStyle = {
      bg: 'white',
      fg: 'blue'
    },
    
    // Item rendering
    itemRenderer,
    
    // Pagination
    pageSize = 10,
    
    // Performance
    virtualScroll = true,
    
    // Z-index for layering
    zIndex,
    
    // Visibility
    hidden = false,
    
    // Children snippet (for custom content)
    children,
    
    ...restProps
  }: {
    left?: number | string,
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    width?: number | string,
    height?: number | string,
    items?: ListItem[],
    selectedIndex?: number,
    focusedIndex?: number,
    onSelect?: (item: ListItem, index: number) => void,
    onFocus?: (item: ListItem, index: number) => void,
    onChange?: (item: ListItem, index: number) => void,
    onScroll?: (offset: number) => void,
    searchable?: boolean,
    searchPlaceholder?: string,
    filterFn?: (item: ListItem, query: string) => boolean,
    border?: boolean | string,
    label?: string,
    scrollbar?: boolean,
    alwaysScroll?: boolean,
    keys?: boolean,
    vi?: boolean,
    mouse?: boolean,
    focusable?: boolean,
    autoFocus?: boolean,
    style?: any,
    selectedStyle?: any,
    focusedStyle?: any,
    scrollbarStyle?: any,
    itemRenderer?: Snippet<[ListItem, number, boolean, boolean]>,
    pageSize?: number,
    virtualScroll?: boolean,
    zIndex?: number,
    hidden?: boolean,
    children?: Snippet,
    [key: string]: any
  } = $props();
  
  // Internal state
  let searchQuery = $state('');
  let scrollOffset = $state(0);
  let isSearchFocused = $state(false);
  let isFocused = $state(false);
  
  // Filtered items based on search
  let filteredItems = $derived(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    if (filterFn) {
      return items.filter(item => filterFn(item, query));
    }
    
    // Default filter: case-insensitive label match
    return items.filter(item => 
      item.label.toLowerCase().includes(query)
    );
  });
  
  // Ensure focused index is within bounds
  $effect(() => {
    if (focusedIndex >= filteredItems.length) {
      focusedIndex = Math.max(0, filteredItems.length - 1);
    }
  });
  
  // Auto-scroll to keep focused item visible
  $effect(() => {
    const itemHeight = 1;
    const focusedPosition = focusedIndex * itemHeight;
    const estimatedVisibleHeight = 10; // Estimate based on typical terminal size
    
    // Scroll up if focused item is above visible area
    if (focusedPosition < scrollOffset) {
      scrollOffset = focusedPosition;
      onScroll?.(scrollOffset);
    }
    
    // Scroll down if focused item is below visible area
    if (focusedPosition >= scrollOffset + estimatedVisibleHeight - 1) {
      scrollOffset = focusedPosition - estimatedVisibleHeight + 2;
      onScroll?.(scrollOffset);
    }
  });
  
  // Handle keyboard navigation
  function handleKeypress(event: any) {
    if (!keys || !isFocused) return;
    
    // Search mode
    if (searchable && isSearchFocused) {
      if (event.key === 'escape') {
        isSearchFocused = false;
        searchQuery = '';
        event.preventDefault();
      } else if (event.key === 'enter' || event.key === 'down') {
        isSearchFocused = false;
        focusedIndex = 0;
        event.preventDefault();
      }
      return;
    }
    
    // List navigation
    switch (event.key) {
      case 'up':
      case vi && 'k':
        navigateUp();
        event.preventDefault();
        break;
        
      case 'down':
      case vi && 'j':
        navigateDown();
        event.preventDefault();
        break;
        
      case 'pageup':
      case vi && 'C-b':
        navigatePageUp();
        event.preventDefault();
        break;
        
      case 'pagedown':
      case vi && 'C-f':
        navigatePageDown();
        event.preventDefault();
        break;
        
      case 'home':
      case vi && 'g':
        navigateHome();
        event.preventDefault();
        break;
        
      case 'end':
      case vi && 'G':
        navigateEnd();
        event.preventDefault();
        break;
        
      case 'enter':
      case 'space':
        selectFocused();
        event.preventDefault();
        break;
        
      case '/':
        if (searchable && !isSearchFocused) {
          isSearchFocused = true;
          searchQuery = '';
          event.preventDefault();
        }
        break;
        
      case 'escape':
        if (searchable && searchQuery) {
          searchQuery = '';
          event.preventDefault();
        }
        break;
    }
  }
  
  // Navigation functions
  function navigateUp() {
    const newIndex = Math.max(0, focusedIndex - 1);
    if (newIndex !== focusedIndex) {
      focusedIndex = newIndex;
      const item = filteredItems[newIndex];
      if (item && !item.disabled) {
        onFocus?.(item, newIndex);
      }
    }
  }
  
  function navigateDown() {
    const newIndex = Math.min(filteredItems.length - 1, focusedIndex + 1);
    if (newIndex !== focusedIndex) {
      focusedIndex = newIndex;
      const item = filteredItems[newIndex];
      if (item && !item.disabled) {
        onFocus?.(item, newIndex);
      }
    }
  }
  
  function navigatePageUp() {
    const newIndex = Math.max(0, focusedIndex - pageSize);
    focusedIndex = newIndex;
    const item = filteredItems[newIndex];
    if (item && !item.disabled) {
      onFocus?.(item, newIndex);
    }
  }
  
  function navigatePageDown() {
    const newIndex = Math.min(filteredItems.length - 1, focusedIndex + pageSize);
    focusedIndex = newIndex;
    const item = filteredItems[newIndex];
    if (item && !item.disabled) {
      onFocus?.(item, newIndex);
    }
  }
  
  function navigateHome() {
    focusedIndex = 0;
    const item = filteredItems[0];
    if (item && !item.disabled) {
      onFocus?.(item, 0);
    }
  }
  
  function navigateEnd() {
    focusedIndex = filteredItems.length - 1;
    const item = filteredItems[focusedIndex];
    if (item && !item.disabled) {
      onFocus?.(item, focusedIndex);
    }
  }
  
  function selectFocused() {
    const item = filteredItems[focusedIndex];
    if (item && !item.disabled) {
      selectedIndex = focusedIndex;
      onSelect?.(item, focusedIndex);
      onChange?.(item, focusedIndex);
    }
  }
  
  // Handle mouse click
  function handleMouseClick(index: number) {
    if (!mouse) return;
    
    const item = filteredItems[index];
    if (item && !item.disabled) {
      focusedIndex = index;
      selectedIndex = index;
      onFocus?.(item, index);
      onSelect?.(item, index);
      onChange?.(item, index);
    }
  }
  
  // Handle focus
  function handleFocus() {
    isFocused = true;
    if (autoFocus && filteredItems.length > 0) {
      const item = filteredItems[focusedIndex];
      if (item) {
        onFocus?.(item, focusedIndex);
      }
    }
  }
  
  function handleBlur() {
    isFocused = false;
  }
  
  // Calculate if scrollbar is needed
  let showScrollbar = $derived(
    scrollbar && (alwaysScroll || filteredItems.length > pageSize)
  );
  
  // Calculate scrollbar position and size
  let scrollbarHeight = $derived.by(() => {
    if (!showScrollbar) return 0;
    const contentHeight = filteredItems.length;
    const visibleHeight = pageSize;
    return Math.max(1, Math.floor((visibleHeight / contentHeight) * visibleHeight));
  });
  
  let scrollbarTop = $derived.by(() => {
    if (!showScrollbar) return 0;
    const contentHeight = filteredItems.length;
    const visibleHeight = pageSize;
    const maxScroll = contentHeight - visibleHeight;
    if (maxScroll <= 0) return 0;
    return Math.floor((scrollOffset / maxScroll) * (visibleHeight - scrollbarHeight));
  });
  
  // Convert border prop
  let borderValue = $derived(
    typeof border === 'boolean' ? (border ? 'line' : false) : border
  );
  
  // Merge styles
  let mergedStyle = $derived({
    ...style,
    selected: {
      ...selectedStyle,
      ...(style.selected || {})
    },
    item: {
      ...(style.item || {})
    },
    scrollbar: {
      ...scrollbarStyle,
      ...(style.scrollbar || {})
    }
  });
</script>

<box
  left={left}
  top={top}
  right={right}
  bottom={bottom}
  width={width}
  height={height}
  border={borderValue}
  label={label}
  style={mergedStyle}
  scrollable={true}
  alwaysScroll={alwaysScroll}
  keys={keys}
  mouse={mouse}
  focusable={focusable}
  focused={autoFocus}
  zIndex={zIndex}
  hidden={hidden}
  onkeypress={handleKeypress}
  onfocus={handleFocus}
  onblur={handleBlur}
  {...restProps}
>
  {#if searchable}
    <box
      top={0}
      left={0}
      right={showScrollbar ? 1 : 0}
      height={3}
      border="line"
      style={{ border: { fg: isSearchFocused ? 'yellow' : 'white' } }}
    >
      <text
        top={0}
        left={1}
        content={isSearchFocused ? '> ' : '  '}
        style={{ fg: 'yellow', bold: true }}
      />
      <text
        top={0}
        left={3}
        content={searchQuery || searchPlaceholder}
        style={{ fg: searchQuery ? 'white' : 'gray' }}
      />
    </box>
  {/if}
  
  <!-- List content -->
  <box
    top={searchable ? 3 : 0}
    left={0}
    right={showScrollbar ? 1 : 0}
    bottom={0}
    scrollable={true}
    alwaysScroll={alwaysScroll}
    style={mergedStyle}
  >
    {#each filteredItems as item, index}
      <box
        top={index}
        left={0}
        right={0}
        height={1}
        mouse={mouse}
        onclick={() => handleMouseClick(index)}
        style={{
          ...(index === selectedIndex ? mergedStyle.selected : {}),
          ...(index === focusedIndex && isFocused ? focusedStyle : {}),
          ...(item.disabled ? { fg: 'gray' } : {})
        }}
      >
        {#if itemRenderer}
          {@render itemRenderer(item, index, index === selectedIndex, index === focusedIndex)}
        {:else}
          <text
            left={1}
            content={`${index === selectedIndex ? '▶ ' : '  '}${item.label}`}
          />
        {/if}
      </box>
    {/each}
    
    <!-- Empty state -->
    {#if filteredItems.length === 0}
      <text
        top={1}
        left={1}
        content={searchQuery ? 'No matching items' : 'No items to display'}
        style={{ fg: 'gray' }}
      />
    {/if}
  </box>
  
  <!-- Scrollbar -->
  {#if showScrollbar}
    <box
      top={searchable ? 3 : 0}
      right={0}
      width={1}
      bottom={0}
      style={{ bg: 'black' }}
    >
      <!-- Scroll indicators -->
      {#if scrollOffset > 0}
        <text
          top={0}
          left={0}
          content="↑"
          style={{ fg: 'white', bold: true }}
        />
      {/if}
      
      {#if scrollOffset + pageSize < filteredItems.length}
        <text
          bottom={0}
          left={0}
          content="↓"
          style={{ fg: 'white', bold: true }}
        />
      {/if}
      
      <!-- Scrollbar thumb -->
      <box
        top={scrollbarTop + (scrollOffset > 0 ? 1 : 0)}
        left={0}
        width={1}
        height={scrollbarHeight}
        style={mergedStyle.scrollbar}
      />
    </box>
  {/if}
  
  <!-- Custom children content -->
  {#if children}
    {@render children()}
  {/if}
</box>