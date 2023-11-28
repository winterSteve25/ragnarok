<script lang="ts">
    import {File} from "../../ts/backend";
    import FileTree from "./FileTree.svelte";
    import {Theming} from "../../ts/theme";

    let expanded = false;

    export let dir: File;
</script>

<div class="DirItem">
    <button on:click={() => expanded = !expanded}>
        <div id="name">
            {@html Theming.getIconFromLoadedTheme(dir)}
            <span>{dir.filename}</span>
        </div>
    </button>
    {#if expanded}
        <FileTree currentPath={dir.filepath}/>
    {/if}
</div>

<style lang="scss">
  .DirItem {
    
    button {
      @include button;

      align-items: start;

      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-left: solid var(--editor-foreground-secondary) 2px;

      min-height: 32px;
      width: 100%;

      padding: 8px 16px;
      box-sizing: border-box;
      
      #name {
        display: flex;
        flex-direction: row;
      }
    }
  }
</style>