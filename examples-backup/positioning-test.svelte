<script lang="ts">
  import { Box, Text } from '../src/components/ui/index';
  
  // State for dynamic positioning test
  let dynamicPosition = $state('center');
  let count = $state(0);
  
  // Cycle through different positions
  $effect(() => {
    const interval = setInterval(() => {
      count++;
      const positions = ['center', '25%', '50%', '75%', '10', '50%-10'];
      dynamicPosition = positions[count % positions.length];
    }, 2000);
    
    return () => clearInterval(interval);
  });
</script>

<!-- Test centered box -->
<Box 
  left="center" 
  top="center" 
  width="30" 
  height="5" 
  border="line" 
  label="Centered Box"
>
  <Text>This box is centered!</Text>
</Box>

<!-- Test percentage positioning -->
<Box 
  left="75%" 
  top="0" 
  width="25%" 
  height="5" 
  border="line" 
  label="75% Left, 25% Width"
>
  <Text>Percentage positioning</Text>
</Box>

<!-- Test relative positioning with offset -->
<Box 
  left="0" 
  top="50%-3" 
  width="100%-40" 
  height="6" 
  border="line" 
  label="Full Width - 40"
>
  <Text>This box is full width minus 40 chars</Text>
  <Text>Positioned at 50% - 3 lines from top</Text>
</Box>

<!-- Test right/bottom positioning -->
<Box 
  right="0" 
  bottom="0" 
  width="30" 
  height="5" 
  border="line" 
  label="Bottom Right"
>
  <Text>Anchored to bottom-right</Text>
</Box>

<!-- Test dynamic positioning -->
<Box 
  left={dynamicPosition} 
  top="80%" 
  width="20" 
  height="3" 
  border="line" 
  label="Dynamic Position"
>
  <Text>Position: {dynamicPosition}</Text>
</Box>

<!-- Test shrink sizing -->
<Box 
  left="5" 
  top="5" 
  width="shrink" 
  height="shrink" 
  border="line" 
  label="Shrink Box"
>
  <Text>This box shrinks to content!</Text>
  <Text>Second line of text</Text>
</Box>

<!-- Test combined left/right for auto width -->
<Box 
  left="5" 
  right="5" 
  top="25%" 
  height="4" 
  border="line" 
  label="Stretched Box"
>
  <Text>This box stretches between left:5 and right:5</Text>
</Box>