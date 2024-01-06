<script lang="ts">
    import {onDestroy} from "svelte";
    import {FileHelper} from "../../ts/fileHelper";
    import {type File} from "ragnarok-api";
    import {OPENED_FILE} from "../../ts/stores";
    import {LSP} from "../../ts/lsp";

    let file: File | undefined = undefined;

    const unsub = OPENED_FILE.subscribe((newFile) => file = newFile);
    onDestroy(unsub);

    async function openTextFile(file: File) {
        const content = await FileHelper.openTextFile(file);
        const ft = FileHelper.getFileExtension(file);
        const serverCapability = await LSP.startServer(ft);

        if (serverCapability) {
            return {
                serverCapability: serverCapability,
                content: content,
            };
        }

        return {
            content: content
        };
    }
</script>

<div class="Editor">
    {#if file}
        {#await openTextFile(file)}
            <span>Loading Text</span>
        {:then {serverCapability, content}}
            {#if serverCapability && serverCapability.semanticTokensProvider}
                <div id="code">
                    <!--{@html renderEditor(content).outerHTML}-->
                </div>
            {:else}
                <pre id="code">{content}</pre>
            {/if}
        {:catch err}
            <span>Failed to load file {err}</span>
        {/await}
    {/if}
</div>

<style lang="scss">
  .Editor {
    width: 100%;
    min-height: 100%;
    height: auto;
    background-color: var(--code-background);

    padding: 32px;
    box-sizing: border-box;
    text-overflow: clip;

    #code {
      padding: 0;
      margin: 0;
      font-family: 'JetBrainsMonoNL NF', monospace;
      font-size: 18px;
      line-height: 100%;
    }

    #cursor {
      position: relative;
      width: 2px;
      height: 20px;
      background-color: var(--editor-foreground);
      top: 0;
      left: 0;
    }
  }
</style>
