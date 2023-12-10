<script lang="ts">
    import type {File} from "ragnarok-api";
    import {Backend} from "../../ts/backend";
    import FileItem from "./FileItem.svelte";
    import DirItem from "./DirItem.svelte";
    
    export let currentPath: string;
    
    $: showHidden = false;

    async function getFiles(): Promise<File[]> {
        // return await Backend.getFilesInPath(currentPath);
        return [
            {
                filename: "Test",
                filetype: "Directory",
                hidden: false, 
                filepath: ""
            },
            {
                filename: "Test",
                filetype: "Directory",
                hidden: false,
                filepath: ""
            },
            {
                filename: "Test",
                filetype: "Directory",
                hidden: false,
                filepath: ""
            },
            {
                filename: "Test",
                filetype: "Directory",
                hidden: false,
                filepath: ""
            },
            {
                filename: "Test",
                filetype: "Directory",
                hidden: false,
                filepath: ""
            },
        ]
    }
</script>

<div>
    {#await getFiles()}
        <p>Loading directory</p>
    {:then files}
        {#each files as file}
            {#if file.hidden && showHidden}
                {#if file.filetype === "File"}
                    <FileItem file={file}/>
                {/if}
                {#if file.filetype === "Directory"}
                    <DirItem dir={file}/>
                {/if}
            {:else if !file.hidden}
                {#if file.filetype === "File"}
                    <FileItem file={file}/>
                {/if}
                {#if file.filetype === "Directory"}
                    <DirItem dir={file}/>
                {/if}
            {/if}
        {/each}
    {:catch e}
        <p>Failed to load directory, {e}</p>
    {/await}
</div>

<style lang="scss">
    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
</style>