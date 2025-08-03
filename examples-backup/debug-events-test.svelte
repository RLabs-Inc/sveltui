<script>
  let count = $state(0)
  
  function increment() {
    count++
  }
</script>

<box 
  top="center"
  left="center"
  width="50%"
  height="10"
  border={{ type: 'line' }}
  label=" Debug Test "
>
  <text top="1" left="center">Count: {count}</text>
  
  <button
    top="3"
    left="center"
    width="20"
    height="3"
    border={{ type: 'line' }}
    onpress={increment}
  >
    Increment
  </button>
</box>