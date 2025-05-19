<script lang="ts">
    let props = $props();
    
    // Destructure props with defaults
    let {
      width = '100%',
      height = '100%',
      top = 0,
      left = 0,
      content = '',
      border = false,
      style = {},
      onClick = undefined,
      children = undefined
    } = props;
  </script>
  
  <!-- No template needed - our renderer handles this -->