<script lang="ts">
    import {path} from "@tauri-apps/api";
    import type {File} from "../../ts/backend";
    import {Backend} from "../../ts/backend";
    import FileItem from "./FileItem.svelte";
    import DirItem from "./DirItem.svelte";
    import {get} from "svelte/store";
    import {Settings} from "../../ts/settings";
    
    export let currentPath: string;
    
    $: showHidden = get(Settings.SETTINGS).showHiddenFiles;
    
    async function getPath(): Promise<string> {
        if (currentPath) {
            return currentPath;
        }

        currentPath = await path.homeDir();
        return currentPath;
    }

    async function getFiles(): Promise<File[]> {
        let path = await getPath();
        return await Backend.getFilesInPath(path);
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