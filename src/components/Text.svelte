<script lang="ts">
    // Get all props at the top level
    let props = $props();
    
    // Destructure props with defaults
    let {
      content = '',
      color = 'white',
      bold = false,
      italic = false,
      align = 'left'
    } = props;
    
    // Create derived style object for the renderer
    let style = $derived({
      fg: color,
      bold,
      italic
    });
  </script>
  
  <!-- No template needed - our renderer will handle this -->