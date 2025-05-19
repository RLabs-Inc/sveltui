<script lang="ts">
    let {
      items = [],
      width = '50%',
      height = '50%',
      selectedIndex = $bindable(0),
      border = true,
      style = {},
      onSelect = undefined
    } = $props();
  </script>
  
  <!-- No template needed - our renderer handles this -->