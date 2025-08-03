<!-- Simple positioning test without imports -->

<script lang="ts">
  // No imports needed - use raw elements
</script>

<!-- Main container -->
<box width="100%" height="100%" style={{ bg: '#111' }}>
  <!-- Centered box -->
  <box
    left="center"
    top="center"
    width={30}
    height={5}
    border="line"
    style={{ border: { fg: 'cyan' }, fg: 'white' }}
  >
    <text left="center" top="center">Centered</text>
  </box>
  
  <!-- Percentage width -->
  <box
    left="25%"
    top={3}
    width="50%"
    height={3}
    border="line"
    style={{ border: { fg: 'green' }, fg: 'white' }}
  >
    <text left={1} top={1}>50% Width</text>
  </box>
</box>