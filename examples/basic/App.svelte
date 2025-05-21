<script>
  let count = $state(0);
  let items = $state([
    "Item 1 - Welcome to SvelTUI",
    "Item 2 - A Svelte-powered terminal UI framework",
    "Item 3 - Press + to increment counter",
    "Item 4 - Press - to decrement counter",
    "Item 5 - Press q to quit"
  ]);
  let selected = $state(0);

  function increment() {
    count++;
  }

  function decrement() {
    if (count > 0) {
      count--;
    }
  }

  function handleSelect(index) {
    selected = index;
  }
</script>

<box border title="SvelTUI Demo">
  <box top={1} left={2} width="50%" height={3} border>
    <text>Count: {count}</text>
  </box>

  <button
    top={5}
    left="20%"
    width={10}
    height={3}
    content="+"
    onclick={increment}
    mouse={true}
    aria-label="Increment"
  ></button>

  <button
    top={5}
    left="60%"
    width={10}
    height={3}
    content="-"
    onclick={decrement}
    mouse={true}
    aria-label="Decrement"
  ></button>
  
  <list 
    top={9}
    left={2}
    width="95%"
    height={10}
    border
    items={items}
    selected={selected}
    onselect={handleSelect}
    mouse={true}
  ></list>
  
  <text
    top={20}
    left="center"
    content={`Selected: ${items[selected]}`}
  />
  
  <text
    bottom={1}
    left="center"
    content="Press Tab to switch focus, Enter to select, q to quit"
    style={{
      fg: "gray"
    }}
  />
</box>