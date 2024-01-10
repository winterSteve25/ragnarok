<script lang="ts">
    import {onDestroy} from "svelte";
    import {FileHelper} from "../../ts/fileHelper";
    import {type File} from "ragnarok-api";
    import {OPENED_FILE, EDITOR_CONTEXT} from "../../ts/stores";
    import {LSP} from "../../ts/lsp";
    import {renderPlainText, renderSemanticTokens} from "./codeEditor";
    import {get} from "svelte/store";

    let file: File | undefined = undefined;
    
    let lineHeight: number | undefined;
    let cursor: HTMLDivElement;
    
    $: {
        if (cursor) {
			const context = get(EDITOR_CONTEXT);
            const top = context.cursorLine * (lineHeight ? lineHeight : 0);
            cursor.style.left = `calc(${context.cursorPosition} * 1ch)`;
            cursor.style.top = `${top}px`;
            cursor.style.height = `${lineHeight}px`;
        }
    }

    const unsub = OPENED_FILE.subscribe((newFile) => file = newFile);
    onDestroy(unsub);

    async function openTextFile(file: File) {
        const content = await FileHelper.openTextFile(file);

		EDITOR_CONTEXT.update((ctx) => {
			ctx.currentBuffer = content.split("\n");
			return ctx;
		});

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
    
    function setLineHeight(_node: HTMLDivElement) {
        const codeLine = document.querySelector(".code-line");
        if (codeLine) {
            const heightInPixels = getComputedStyle(codeLine).height;
            lineHeight = +heightInPixels.slice(0, heightInPixels.length - 2);
        }
    }
</script>

<div class="Editor">
    {#if file}
        {#await openTextFile(file)}
            <span>Loading Text</span>
        {:then {serverCapability, content}}
            <div id="code-document" use:setLineHeight>
                {#if serverCapability && serverCapability.semanticTokensProvider}
                    {@html renderSemanticTokens(content, []).outerHTML}
                {:else}
                    {@html renderPlainText(content).outerHTML}
                {/if}
            </div>
            <div id="cursor" bind:this={cursor}/>
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

    box-sizing: border-box;
    text-overflow: clip;
    
    position: relative;
    background-color: var(--code-background);

    #code-document {
      padding: 0;
      margin: 0;
      font-family: 'JetBrainsMonoNL NF', monospace;
      font-size: 18px;
      line-height: 100%;
      
      :global(.code-line) {
        padding-top: 2px;
        padding-bottom: 2px;
        box-sizing: border-box;
      }
    }

    #cursor {
      position: absolute;
      width: 2px;
      background-color: white;
      animation: blink 1.2s infinite step-end;
    }

    @keyframes blink {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }
</style>
