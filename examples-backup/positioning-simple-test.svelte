<script lang="ts">
  import { Box, Text } from '../src/components/ui/index';
</script>

<!-- Test basic positioning -->
<Box 
  left="0" 
  top="0" 
  width="20" 
  height="3" 
  border="line"
>
  <Text>Top Left Box</Text>
</Box>

<!-- Test center positioning -->
<Box 
  left="center" 
  top="center" 
  width="30" 
  height="5" 
  border="line"
>
  <Text>Centered Box!</Text>
  <Text>This should be centered</Text>
</Box>

<!-- Test percentage positioning -->
<Box 
  left="50%" 
  top="0" 
  width="50%" 
  height="3" 
  border="line"
>
  <Text>50% from left</Text>
</Box>