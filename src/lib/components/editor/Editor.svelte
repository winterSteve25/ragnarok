<script lang="ts">
    import {Stores} from "../../ts/stores";
    import {onDestroy} from "svelte";
    import {Backend, type File} from "../../ts/backend";

    let mediaView: boolean = false;
    let openedFile: File | undefined = undefined;

    const unsub = Stores.openedFile.subscribe((newFile) => {
        openedFile = newFile;
        mediaView = isMediaFile(openedFile?.filename);
    });

    function isMediaFile(fileName: string | undefined): boolean {
        if (!fileName) {
            return false;
        }

        const mediaExtensions = ['mp3', 'mp4', 'avi', 'mov', 'wmv', 'wav', 'flac', 'mkv', 'ogg', 'webm', 'aac'];
        const fileExtension = fileName.split('.').pop()!.toLowerCase();
        return mediaExtensions.includes(fileExtension);
    }

    onDestroy(unsub);

    let codeElement: HTMLElement;
    let cursor: HTMLElement;
    let fileContent: string;

    function moveCursor(line: number, column: number) {
    }

    function onKeyDown(event: KeyboardEvent) {
        moveCursor(0, 0);
    }

    async function openTextFile(file: File) {
        let result = await Backend.openTextFile(file);
        fileContent = result;
        return result;
    }
</script>

<div class="Editor">
    {#if openedFile}
        {#if mediaView}
            <span>Not yet implemented</span>
        {:else}
            {#await openTextFile(openedFile)}
                <span>Loading Text</span>
            {:then content}
                <div>
                    <pre id="text-area" bind:this={codeElement}>{content}</pre>
                    <div id="cursor" bind:this={cursor}/>
                </div>
            {:catch err}
                <span>Failed to load file {err}</span>
            {/await}
        {/if}
    {/if}
</div>

<svelte:window on:keydown|preventDefault={onKeyDown}/>

<style lang="scss">
  .Editor {
    width: 100%;
    min-height: 100%;
    height: auto;
    background-color: var(--code-background);

    padding: 32px;
    box-sizing: border-box;
    text-overflow: clip;

    #text-area {
      padding: 0;
      margin: 0;
      font-family: 'JetBrainsMonoNL NF', monospace;
      font-size: 18px;
      line-height: 100%;
    }

    #cursor {
      position: absolute;
      width: 2px;
      height: 20px;
      background-color: var(--editor-foreground);
    }
  }
</style>
