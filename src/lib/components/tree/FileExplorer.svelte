<script lang="ts">
    import FileTree from "./FileTree.svelte";

    export let currentPath: string = "";
</script>

<div class="FileTree">
    <FileTree currentPath={currentPath}></FileTree>
</div>

<style lang="scss">
  .FileTree {
    padding: 16px;
  }
</style>