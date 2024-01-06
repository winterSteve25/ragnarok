<script lang="ts">
    import type {File} from "ragnarok-api";
    import FileTree from "./FileTree.svelte";

    let expanded = false;

    export let dir: File;
</script>

<div class="DirItem">
    <button on:click={() => expanded = !expanded}>
        <!--        <img alt="file-icon" src={Theming.getIconFromLoadedTheme(dir)}/>-->
        <span>{dir.filename}</span>
    </button>
    <div id="tree">
        <FileTree currentPath={dir.filepath} shown={expanded}/>
    </div>
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