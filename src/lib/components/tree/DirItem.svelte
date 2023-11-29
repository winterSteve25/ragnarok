<script lang="ts">
    import type {File} from "../../ts/backend";
    import FileTree from "./FileTree.svelte";

    let expanded = false;

    export let dir: File;
</script>

<div class="DirItem">
    <button on:click={() => expanded = !expanded}>
        <div>
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" fill="currentColor"/></svg>
            <span>{dir.filename}</span>
        </div>
    </button>
    <div id="tree">
        {#if expanded}
            <FileTree currentPath={dir.filepath}/>
        {/if}
    </div>
</div>

<style lang="scss">
  .DirItem {
    button {
      @include button;
      
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-left: solid var(--editor-foreground-secondary) 2px;

      height: 32px;
      width: 100%;

      padding: 8px 16px;
      box-sizing: border-box;
      
      div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        
        gap: 4px;
        height: 100%;
      }
    }
    
    #tree {
      padding-left: 12px;
    }
  }
</style>