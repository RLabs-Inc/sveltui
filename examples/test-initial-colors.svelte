<script>
  // Test reactive colors that should show correctly from first render
  let color = $state('green');
  let borderColor = $state('yellow'); 
  
  function changeColors() {
    color = color === 'green' ? 'red' : 'green';
    borderColor = borderColor === 'yellow' ? 'blue' : 'yellow';
  }
</script>

<box label="Color Test" width="100%" height="100%" border={true}>
  <text top={1} style={{ fg: color, bold: true }}>Text color: {color}</text>
  <text top={2} style={{ fg: borderColor }}>Border color: {borderColor}</text>
  <box top={4} left={2} width={30} height={5} border={{ fg: borderColor, type: 'line' }}>
    <text top={1} left={1}>This box border should be {borderColor}</text>
    <text top={2} left={1}>Press 'c' to change colors</text>
  </box>
</box>

<style>
  /* Make sure no CSS interferes */
</style>