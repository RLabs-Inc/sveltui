<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import { getDefaultTheme, type Theme } from './theme';
  
  let {
    theme = getDefaultTheme(),
    children
  } = $props<{
    theme?: Theme,
    children?: any
  }>();
  
  // Provide theme to all child components
  setContext('theme', theme);
</script>

{#if children}
  {@render children()}
{/if}