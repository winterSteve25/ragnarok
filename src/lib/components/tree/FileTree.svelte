<script lang="ts">
    import type {File} from "ragnarok-api";
    import {FileHelper} from "../../ts/fileHelper";
    import FileItem from "./FileItem.svelte";
    import DirItem from "./DirItem.svelte";
    import {slide} from "svelte/transition";
    import {get} from "svelte/store";
    import {Settings} from "../../ts/settings";

    export let currentPath: string;
    export let shown: boolean = true;

    $: showHidden = get(Settings.ACTIVE_SETTINGS).showHiddenFiles;

    async function getFiles(): Promise<File[]> {
        return await FileHelper.getFilesInPath(currentPath);
    }
</script>

{#if shown}
    <div out:slide={{ duration: 200 }}>
        {#await getFiles()}
            <p>Loading directory</p>
        {:then files}
            <div in:slide={{ duration: 200 }}>
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
            </div>
        {:catch e}
            <p>Failed to load directory, {e}</p>
        {/await}
    </div>
{/if}
<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>