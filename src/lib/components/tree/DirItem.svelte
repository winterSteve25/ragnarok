<script lang="ts">
    import {File} from "../../ts/backend";
    import FileTree from "./FileTree.svelte";

    let expanded = false;

    export let dir: File;
</script>

<button class="DirItem" on:click={() => expanded = !expanded}>
    <span>{dir.filename}</span>
    {#if expanded}
        <FileTree currentPath={dir.filepath}/>
    {/if}
</button>

<style lang="scss">
  .DirItem {
  }
</style>