<script lang="ts">
    import type {File} from "ragnarok-api";
    import FileTree from "./FileTree.svelte";
    import {slide} from "svelte/transition";

    let expanded = false;

    export let dir: File;
</script>

<div class="DirItem">
    <button on:click={() => expanded = !expanded}>
        <!--        <img alt="file-icon" src={Theming.getIconFromLoadedTheme(dir)}/>-->
        <span>{dir.filename}</span>
    </button>
    {#if expanded}
        <div id="tree" transition:slide={{ duration: 5000 }}>
            <FileTree currentPath={dir.filepath}/>
        </div>
    {/if}
</div>

<style lang="scss">
  .DirItem {
    button {
      @include button;

      display: flex;
      flex-direction: row;
      justify-content: start;

      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-left: solid var(--editor-foreground-secondary) 2px;

      height: 32px;
      width: 100%;

      padding: 8px 16px;
      box-sizing: border-box;

      span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      img {
        min-width: 16px;
        max-width: 16px;
        max-height: 16px;
      }
    }

    #tree {
      padding-left: 12px;
    }
  }
</style>