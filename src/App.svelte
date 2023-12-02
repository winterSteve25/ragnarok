<script lang="ts">
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import FileExplorer from "./lib/components/tree/FileExplorer.svelte";
    import Editor from "./lib/components/editor/Editor.svelte";
</script>

<main>
    <Splitpanes theme="custom">
        <Pane minSize={15} snapSize={2} size={20}>
            <FileExplorer/>
        </Pane>
        <Pane minSize={20}>
            <Editor/>
        </Pane>
    </Splitpanes>
</main>

<style lang="scss">
  main {
    height: 100%;
    width: 100%;
  }
</style>