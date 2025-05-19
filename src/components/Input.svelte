<script lang="ts">
    let {
      value = $bindable(''),
      placeholder = '',
      width = '50%',
      height = 3,
      border = true,
      style = {},
      onChange = undefined,
      onSubmit = undefined
    } = $props();
  </script>
  
  <!-- No template needed - our renderer handles this -->