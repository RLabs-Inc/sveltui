<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'

  // Focus states for all scrollable containers
  let focusedOuter = $state(false)
  let focusedNested1 = $state(false)
  let focusedNested2 = $state(false)
  let focusedSidebar = $state(false)
  let focusedCodeView = $state(false)

  // Track which container is actively being scrolled
  let activeScroller = $state('')

  function setActiveScroller(name) {
    activeScroller = name
    // Clear after a moment to show status
    setTimeout(() => activeScroller = '', 2000)
  }
</script>

<Box
  width="100%"
  height="100%"
  flexDirection="row"
  gap={1}
  padding={1}
>
  <!-- Left side: Nested scrollable containers -->
  <Box
    width={'30%'}
    flexDirection="column"
    gap={1}
  >
    <Text text="🎯 Complex Nested Scrolling Demo" variant="primary" bold={true} />
    <Text text="Tab through containers, use arrows to scroll" variant="warning" />

    <!-- Outer scrollable container with mixed content -->
    <Box
      border="double"
      variant={focusedOuter ? "primary" : "secondary"}
      padding={1}
      height={20}
      focusable={true}
      tabIndex={1}
      bind:focused={focusedOuter}
      onfocus={() => setActiveScroller("Outer Container")}
    >
      <Text text={focusedOuter ? "📦 OUTER CONTAINER (Focused)" : "📦 Outer Container"}
            variant={focusedOuter ? "primary" : "info"} bold={true} />
      <Text text="This container has 40+ lines of content" muted />

      <!-- Some text content before nested box -->
      {#each Array(5) as _, i}
        <Text text={`Outer line ${i + 1}: Content before nested boxes`} />
      {/each}

      <!-- First nested scrollable box -->
      <Box
        border="single"
        variant={focusedNested1 ? "success" : "secondary"}
        padding={1}
        height={8}
        marginTop={1}
        marginBottom={1}
        focusable={true}
        tabIndex={2}
        bind:focused={focusedNested1}
        onfocus={() => setActiveScroller("Nested Box 1")}
      >
        <Text text={focusedNested1 ? "📂 NESTED BOX 1 (Focused)" : "📂 Nested Box 1"}
              variant={focusedNested1 ? "success" : "secondary"} bold={true} />
        <Text text="Independent scrolling - 15 items" variant="success" />
        {#each Array(15) as _, i}
          <Text text={`  Nested item ${i + 1}: This scrolls independently`} color="green" />
        {/each}
      </Box>

      <!-- Some content between nested boxes -->
      {#each Array(3) as _, i}
        <Text text={`Outer line ${i + 6}: Content between nested boxes`} />
      {/each}

      <!-- Second nested scrollable box with deeper nesting -->
      <Box
        border="single"
        variant={focusedNested2 ? "danger" : "secondary"}
        padding={1}
        height={10}
        marginTop={1}
        marginBottom={1}
        focusable={true}
        tabIndex={3}
        bind:focused={focusedNested2}
        onfocus={() => setActiveScroller("Nested Box 2")}
      >
        <Text text={focusedNested2 ? "📁 NESTED BOX 2 (Focused)" : "📁 Nested Box 2"}
              variant={focusedNested2 ? "danger" : "secondary"} bold={true} />
        <Text text="Contains a mix of text and boxes" variant="danger" />

        {#each Array(3) as _, i}
          <Box border="single" padding={1} marginBottom={1} variant="danger">
            <Text text={`Mini box ${i + 1}`} bold={true} color="red" />
            <Text text="With multiple lines" color="red" />
            <Text text="To test clipping" color="red" />
          </Box>
        {/each}

        {#each Array(5) as _, i}
          <Text text={`  Additional line ${i + 1} in nested box 2`} color="red" />
        {/each}
      </Box>

      <!-- More content after nested boxes -->
      {#each Array(20) as _, i}
        <Text text={`Outer line ${i + 9}: Content after nested boxes to make it scrollable`} />
      {/each}
    </Box>
  </Box>

  <!-- Right side: Additional test cases -->
  <Box
    flexDirection="column"
    width={'70%'}
    gap={1}
  >
    <!-- Wide content for horizontal scrolling (future feature) -->
    <Box
      border="single"
      variant={focusedCodeView ? "info" : "secondary"}
      padding={1}
      height={10}
      focusable={true}
      tabIndex={4}
      bind:focused={focusedCodeView}
      onfocus={() => setActiveScroller("Code View")}
    >
      <Text text={focusedCodeView ? "💻 CODE VIEW (Focused)" : "💻 Code View"}
            variant={focusedCodeView ? "info" : "secondary"} bold={true} />
      <Text text="Long lines to test horizontal scroll (when implemented)" muted />
      {#each Array(15) as _, i}
        <Text text={`${String(i + 1).padStart(3, '0')} | const veryLongVariableName = "This is a very long line that would benefit from horizontal scrolling when implemented";`}
              color="cyan" />
      {/each}
    </Box>

    <!-- Sidebar with scrollable content -->
    <Box
      border="single"
      variant={focusedSidebar ? "warning" : "secondary"}
      padding={1}
      flexGrow={1}
      flexDirection="column"
      focusable={true}
      tabIndex={5}
      bind:focused={focusedSidebar}
      onfocus={() => setActiveScroller("Sidebar")}
    >
      <Text text={focusedSidebar ? "📋 SIDEBAR (Focused)" : "📋 Sidebar"}
            variant={focusedSidebar ? "warning" : "secondary"} bold={true} />
      <Text text="File listing with many items" muted />
      {#each Array(30) as _, i}
        <Text text={`📄 file-${String(i + 1).padStart(3, '0')}.ts`}
              color={i % 3 === 0 ? "yellow" : i % 3 === 1 ? "magenta" : "white"} />
      {/each}
    </Box>

    <!-- Status bar -->
    <Box
      border="single"
      padding={1}
      height={3}
      variant="primary"
    >
      <Text text={activeScroller ? `🎮 Scrolling: ${activeScroller}` : "🎮 Ready"}
            variant="primary" bold={true} />
    </Box>
  </Box>

  <!-- Help text at bottom -->
  <Box position="absolute" bottom={0} left={0}>
    <Text text="Tab: Next | Shift+Tab: Previous | ↑↓: Scroll | PgUp/PgDn: Page | Ctrl+C: Exit"
          color="gray" dim={true} />
  </Box>
</Box>