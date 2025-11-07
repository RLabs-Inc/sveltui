<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'
  
  let counter = $state(0)
  setInterval(() => counter++, 1000)
</script>

<!-- Main container using percentage width/height -->
<Box 
  width="100%"
  height="100%"
  variant="primary"
  border="double"
  padding={1}
  flexDirection="column"
  gap={1}
>
  <!-- Header -->
  <Box variant="success" padding={1}>
    <Text text="🎨 SvelTUI Simplified Layout System" variant="success" bold={true} />
  </Box>
  
  <Text text={`Live Updates: ${counter}s`} variant="warning" />
  
  <!-- Test 1: Row layout with flexGrow -->
  <Box
    flexDirection="row"
    gap={1}
    height={3}
    variant="primary"
    border="single"
  >
    <Box flexGrow={1} variant="secondary" backgroundColor="#1a1a2e" padding={1}>
      <Text text="Flex: 1" variant="secondary" />
    </Box>
    <Box flexGrow={2} variant="info" backgroundColor="#16213e" padding={1}>
      <Text text="Flex: 2" variant="info" />
    </Box>
    <Box flexGrow={1} variant="warning" backgroundColor="#0f3460" padding={1}>
      <Text text="Flex: 1" variant="warning" />
    </Box>
  </Box>
  
  <!-- Test 2: Percentage widths -->
  <Box
    flexDirection="row"
    height={3}
    gap={1}
  >
    <Box width="25%" border="rounded" variant="success" padding={1}>
      <Text text="25%" variant="success" />
    </Box>
    <Box width="50%" border="rounded" variant="warning" padding={1}>
      <Text text="50%" variant="warning" />
    </Box>
    <Box width="25%" border="rounded" variant="danger" padding={1}>
      <Text text="25%" variant="danger" />
    </Box>
  </Box>
  
  <!-- Test 3: Main content area with nested layouts -->
  <Box
    flexGrow={1}
    flexDirection="row"
    gap={1}
    minHeight={8}
  >
    <!-- Left column -->
    <Box
      width="30%"
      flexDirection="column"
      border="single"
      variant="secondary"
      padding={1}
      gap={1}
    >
      <Text text="Left Column" variant="secondary" bold={true} />
      <Box flexGrow={1} backgroundColor="#2d1b69" padding={1}>
        <Text text="Item 1" color="white" />
      </Box>
      <Box flexGrow={1} backgroundColor="#3d2b79" padding={1}>
        <Text text="Item 2" color="white" />
      </Box>
    </Box>
    
    <!-- Center with absolute positioning demo -->
    <Box
      flexGrow={1}
      position="relative"
      border="dashed"
      variant="primary"
      padding={1}
    >
      <Text text="Relative Container" muted={true} />
      
      <!-- Absolute positioned elements -->
      <Box
        position="absolute"
        top={2}
        left={2}
        width={15}
        height={2}
        backgroundColor="#ff6b6b"
        padding={1}
      >
        <Text text="Abs @2,2" color="white" />
      </Box>
      
      <Box
        position="absolute"
        top={4}
        left={10}
        width={20}
        height={2}
        backgroundColor="#4ecdc4"
        padding={1}
      >
        <Text text="Abs @10,4" color="black" />
      </Box>
    </Box>
    
    <!-- Right column with alignment -->
    <Box
      width="25%"
      flexDirection="column"
      border="single"
      variant="info"
      padding={1}
      alignItems="center"
      justifyContent="space-between"
    >
      <Text text="Top" variant="danger" />
      <Text text="Center" variant="warning" />
      <Text text="Bottom" variant="success" />
    </Box>
  </Box>
  
  <!-- Test 4: Scrollable area with proper content -->
  <Box
    height={5}
    border="single"
    variant="secondary"
    overflow="scroll"
    padding={1}
    focusable={true}
    tabIndex={1}
  >
    <Text text="📜 Scrollable Area (use arrows when focused)" variant="secondary" bold={true} />
    <Text text="Line 1: The quick brown fox jumps over the lazy dog" />
    <Text text="Line 2: Pack my box with five dozen liquor jugs" />
    <Text text="Line 3: How vexingly quick daft zebras jump" />
    <Text text="Line 4: The five boxing wizards jump quickly" />
    <Text text="Line 5: Sphinx of black quartz, judge my vow" />
    <Text text="Line 6: Two driven jocks help fax my big quiz" />
    <Text text="Line 7: Five quacking zephyrs jolt my wax bed" />
    <Text text="Line 8: The jay, pig, fox, zebra and my wolves quack" />
    <Text text="Line 9: Jinxed wizards pluck ivy from the big quilt" />
    <Text text="Line 10: ⬇️ More content below..." />
  </Box>
  
  <!-- Test 5: Margins and Padding -->
  <Box
    flexDirection="row"
    height={3}
    gap={2}
  >
    <Box
      marginX={1}
      paddingX={2}
      border="single"
      variant="warning"
    >
      <Text text="MX=1 PX=2" variant="warning" />
    </Box>
    
    <Box
      marginY={1}
      padding={1}
      border="single"
      variant="danger"
    >
      <Text text="MY=1 P=1" variant="danger" />
    </Box>
    
    <Box
      padding={2}
      border="double"
      variant="success"
    >
      <Text text="P=2" variant="success" />
    </Box>
  </Box>
  
  <!-- Footer with space-between alignment -->
  <Box
    flexDirection="row"
    justifyContent="space-between"
    variant="primary"
    border="single"
    padding={1}
  >
    <Text text="◀ Left" variant="danger" />
    <Text text="⬛ Center" variant="info" />
    <Text text="Right ▶" variant="success" />
  </Box>
</Box>