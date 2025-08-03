<!--
  Positioning Demo - Tests blessed-compatible positioning in SvelTUI
  
  This demonstrates all positioning features:
  - Center positioning
  - Percentage-based positioning  
  - Relative offsets (50%-10, 100%+5)
  - Shrink sizing
  - Combined constraints (left+right defines width)
-->

<script lang="ts">
  import Box from '../src/components/ui/Box.svelte.mjs'
  import Text from '../src/components/ui/Text.svelte.mjs'
  
  // Style for all demo boxes
  const boxStyle = {
    border: { fg: 'cyan' },
    fg: 'white'
  };
</script>

<!-- Main container -->
<Box
  width="100%"
  height="100%"
  style={{ bg: '#111' }}
>
  <!-- Title -->
  <Text
    left="center"
    top={0}
    style={{ fg: 'yellow', bold: true }}
  >
    SvelTUI Positioning Demo
  </Text>
  
  <!-- Example 1: Center positioning -->
  <Box
    left="center"
    top="center"
    width={30}
    height={5}
    border="line"
    label=" Centered Box "
    style={boxStyle}
  >
    <Text left="center" top="center">
      left="center" top="center"
    </Text>
  </Box>
  
  <!-- Example 2: Percentage positioning -->
  <Box
    left="25%"
    top={3}
    width="50%"
    height={4}
    border="line"
    label=" 50% Width "
    style={boxStyle}
  >
    <Text left={1} top={1}>
      left="25%" width="50%"
    </Text>
  </Box>
  
  <!-- Example 3: Relative offsets -->
  <Box
    left="50%-15"
    top="50%+3"
    width={30}
    height={4}
    border="line"
    label=" Offset Position "
    style={boxStyle}
  >
    <Text left={1} top={1}>
      left="50%-15" top="50%+3"
    </Text>
  </Box>
  
  <!-- Example 4: Right/Bottom positioning -->
  <Box
    right={2}
    bottom={2}
    width={25}
    height={4}
    border="line"
    label=" Bottom Right "
    style={boxStyle}
  >
    <Text left={1} top={1}>
      right={2} bottom={2}
    </Text>
  </Box>
  
  <!-- Example 5: Width from constraints -->
  <Box
    left={2}
    right="50%+2"
    top="75%"
    height={4}
    border="line"
    label=" Constraint Width "
    style={boxStyle}
  >
    <Text left={1} top={1}>
      left={2} right="50%+2"
    </Text>
  </Box>
  
  <!-- Example 6: Shrink sizing -->
  <Box
    left={2}
    bottom={8}
    width="shrink"
    height="shrink"
    border="line"
    label=" Shrink "
    style={boxStyle}
  >
    <Text>This box shrinks to content</Text>
  </Box>
  
  <!-- Example 7: 100% minus offset -->
  <Box
    left={2}
    top={8}
    width="100%-4"
    height={3}
    border="line"
    label=" Full Width Minus "
    style={boxStyle}
  >
    <Text left={1} top={0}>
      width="100%-4" (full width minus 4 chars)
    </Text>
  </Box>
  
  <!-- Instructions -->
  <Box
    left="center"
    bottom={0}
    width="shrink"
    height={1}
    style={{ fg: 'gray' }}
  >
    <Text>Press q or Ctrl+C to quit</Text>
  </Box>
</Box>