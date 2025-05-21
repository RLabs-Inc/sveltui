/**
 * SvelTUI Demo Application
 * 
 * This demo showcases the core UI components of SvelTUI
 */

<script lang="ts">
  import Box from '../src/components/ui/Box.svelte';
  import Text from '../src/components/ui/Text.svelte';
  import List from '../src/components/ui/List.svelte';
  import Input from '../src/components/ui/Input.svelte';
  import Checkbox from '../src/components/ui/Checkbox.svelte';
  
  // State - using both Runes and direct state for compatibility
  let count = $state(0);
  let message = $state('Hello SvelTUI!');
  let items = $state([
    'Item 1: Welcome to SvelTUI',
    'Item 2: A true Svelte 5 terminal UI renderer',
    'Item 3: Based on blessed terminal library',
    'Item 4: With full Svelte 5 reactivity',
    'Item 5: And component composition',
  ]);
  let selectedItem = $state(0);
  let showDetails = $state(false);

  // Update message based on count
  $effect(() => {
    message = `Count: ${count} - Hello SvelTUI!`;
  });
  
  // Event handlers
  function incrementCount() {
    count = count + 1;
  }
  
  function handleItemSelect(event: CustomEvent) {
    selectedItem = event.detail.index;
  }
  
  function handleMessageChange(event: CustomEvent) {
    message = event.detail.value;
  }

  function handleToggleDetails(event: CustomEvent) {
    showDetails = event.detail.checked;
  }

  function addItem() {
    items = [...items, `Item ${items.length + 1}: Added at ${new Date().toLocaleTimeString()}`];
  }
  
  function removeItem() {
    if (items.length > 0) {
      items = items.slice(0, -1);
    }
  }
</script>

<Box border label="SvelTUI Demo" width="100%" height="100%">
  <Box top={1} left={1} width="98%" height={3}>
    <Text content={message} style={{ fg: 'green', bold: true }} />
  </Box>
  
  <Box top={4} left={1} width="98%" height={10} border label="Interactive List">
    <List 
      items={items} 
      selected={selectedItem} 
      onselect={handleItemSelect}
      style={{ 
        selected: { 
          bg: 'blue', 
          fg: 'white',
          bold: true
        }
      }}
    />
  </Box>
  
  <Box top={15} left={1} width="98%" height={3} border label="Input">
    <Input
      value={message}
      onchange={handleMessageChange}
      style={{ fg: 'cyan' }}
    />
  </Box>
  
  <Box top={19} left={1} width="98%" height={6} border label="Actions">
    <Checkbox 
      left={2} 
      top={1} 
      checked={showDetails} 
      label="Show Details" 
      onchange={handleToggleDetails}
    />
    
    <Box left={28} top={1} width={20} height={1} border>
      <Text 
        content=" Count + " 
        style={{ fg: 'white', bg: 'blue' }} 
        onclick={incrementCount}
      />
    </Box>
    
    <Box left={50} top={1} width={20} height={1} border>
      <Text 
        content=" Add Item " 
        style={{ fg: 'white', bg: 'green' }} 
        onclick={addItem}
      />
    </Box>
    
    <Box left={72} top={1} width={20} height={1} border>
      <Text 
        content=" Remove Item " 
        style={{ fg: 'white', bg: 'red' }} 
        onclick={removeItem}
      />
    </Box>
  </Box>
  
  {#if showDetails}
    <Box top={26} left={1} width="98%" height={10} border label="Details">
      <Text left={2} top={1} content={`Selected Item: ${selectedItem}`} />
      <Text left={2} top={2} content={`Selected Text: ${items[selectedItem]}`} />
      <Text left={2} top={3} content={`Count: ${count}`} />
      <Text left={2} top={4} content={`Message: ${message}`} />
      <Text left={2} top={5} content={`Items Count: ${items.length}`} />
      <Text left={2} top={6} content="Press Q to exit, Arrow keys to navigate list" />
    </Box>
  {/if}
</Box>