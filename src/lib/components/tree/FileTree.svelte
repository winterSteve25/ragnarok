<script lang="ts">
import { Backend } from "../../ts/backend";
import type { File } from "../../ts/backend";
import { path } from "@tauri-apps/api";

export let currentPath: string = "";

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

<div class="FileTree">
    {#await getFiles()}
        <p>Loading directory</p>
    {:then files}
        <p>{JSON.stringify(files)}</p>
    {:catch e}
        <p>Failed to load directory, {e}</p>
    {/await}
</div>

<style lang="scss">
</style>