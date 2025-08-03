<!--
  Minimal Binding Test
  
  Tests the most basic binding functionality
-->

<script>
  import { Box, Text } from '../src/components/ui/index.ts';
  
  // Simple state
  let message = $state('Hello from SvelTUI!');
</script>

<Box width="100%" height="100%" border="line">
  <Text left={1} top={1}>{message}</Text>
</Box>