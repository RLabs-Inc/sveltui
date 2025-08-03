<!--
  Static Test - No binding, just static content
-->

<script>
  import { Box, Text } from '../src/components/ui/index.ts';
</script>

<Box width="100%" height="100%" border="line">
  <Text left={1} top={1}>Hello from SvelTUI!</Text>
  <Text left={1} top={3}>This is a static test.</Text>
  <Text left={1} bottom={1} fg="cyan">Press q to quit</Text>
</Box>