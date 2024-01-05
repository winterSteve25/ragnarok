<script lang="ts">
    import {onMount} from "svelte";

    let input: HTMLInputElement;
    
    onMount(() => {
        input.focus();
    })
</script>

<div class="CommandPalette">
    <input type="text" bind:this={input}>
</div>

<style lang="scss">
  .CommandPalette {
    height: 100%;
    width: 100%;
    background-color: var(--editor-background);
    
    input {
      height: 100%;
      width: 100%;
      
      background-color: var(--editor-background);
      outline: none;
      border: none;
      color: var(--editor-foreground);
    }
  }
</style>