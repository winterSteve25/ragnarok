<script lang="ts">
    import {FileHelper} from "../../ts/fileHelper";
    import {type File} from "ragnarok-api";
    import {EDITOR_CONTEXT, OPENED_FILE} from "../../ts/stores";
    import {LSP} from "../../ts/lsp";
    import {renderPlainText, renderSemanticTokens} from "./codeEditor";
    import {PieceTreeTextBufferBuilder} from "vscode-piece-tree";
    import VirtualList, {type AfterScrollEvent} from "svelte-tiny-virtual-list";

    $: file = $OPENED_FILE;
    let lineHeight: number = 0;
    let viewPortHeight: number = 0;
    let cursorOffset: number = 0;
    let forceScrollIndex: number = 0;
    
    let cursor: HTMLDivElement;
    let lineHolder: HTMLDivElement;

    $: {
        const context = $EDITOR_CONTEXT;

        if (cursor) {
            const top = (context.cursorLine - 1) * lineHeight - cursorOffset;
            cursor.style.left = `calc(${context.cursorPosition} * 1ch)`;
            cursor.style.top = `${top}px`;
            cursor.style.height = `${lineHeight}px`;
            if (context.insertMode) {
                cursor.style.width = "0.2ch";
            } else {
                cursor.style.width = "1ch";
            }

            // console.log(`Cursor: [${context.cursorPosition}, ${context.cursorLine}]`)
            // console.log(`Line Length: ${context.currentBuffer?.getLineLength(context.cursorLine)}`);
            // console.log(`Content: ${context.currentBuffer?.getLineContent(context.cursorLine)}`);
            
            if (context.cursorLine >= Math.ceil(viewPortHeight / lineHeight)) {
                forceScrollIndex = context.cursorLine + 2;
            } else if (context.cursorLine <= Math.ceil(cursorOffset / lineHeight)) {
                forceScrollIndex = context.cursorLine - 2;
            }
        }
    }

    async function openTextFile(file: File) {
        const content = await FileHelper.openTextFile(file);
        const pieceTree = new PieceTreeTextBufferBuilder();
        pieceTree.acceptChunk(content);
        const buffer = pieceTree.finish(true).create(1);

        EDITOR_CONTEXT.update((ctx) => {
            ctx.cursorPosition = 0;
            ctx.cursorLine = 1;
            ctx.currentBuffer = buffer;
            ctx.currentFile = file;
            ctx.insertMode = false;
            
            forceScrollIndex = 0;
            cursorOffset = 0;

            return ctx;
        });

        const ft = FileHelper.getFileExtension(file);
        const serverCapability = await LSP.startServer(ft);

        if (serverCapability) {
            return {
                serverCapability: serverCapability,
            };
        }

        return {};
    }

    function setLineHeight(ele: HTMLDivElement) {
        viewPortHeight = getElementHeight(document.querySelector(".Editor"));
        ele.style.display = "block";
        lineHeight = getElementHeight(ele);
        ele.style.display = "none";
    }
    
    function getElementHeight(ele: Element | null) {
        if (ele) {
            const heightInPixels = getComputedStyle(ele).height;
            return +heightInPixels.slice(0, heightInPixels.length - 2);
        }
        
        return -1;
    }
    
    function setCursorOffset(detail: AfterScrollEvent) {
        cursorOffset = detail.detail.offset;
    }
</script>

<div class="Editor">
    <div style="display: none" class="code-line" bind:this={lineHolder} use:setLineHeight>0</div>
    
    {#if file}
        {#await openTextFile(file)}
            <div/>
        {:then {serverCapability}}
            {#if serverCapability && serverCapability.semanticTokensProvider}
                <!--{@html renderSemanticTokens(content, []).outerHTML}-->
            {:else}
                <VirtualList
                        width="100%"
                        height={viewPortHeight}
                        itemCount={$EDITOR_CONTEXT.currentBuffer.getLineCount()}
                        itemSize={lineHeight}
                        scrollToIndex={forceScrollIndex}
                        on:afterScroll={setCursorOffset}
                        bind:scrollOffset={cursorOffset}
                >
                    <div slot="item" let:index let:style {style}>
                        {@html renderPlainText($EDITOR_CONTEXT.currentBuffer.getLineContent(index + 1)).outerHTML}
                    </div>
                </VirtualList>
                <div id="cursor" bind:this={cursor}/>
            {/if}
        {:catch err}
            <span>Failed to load file {err}</span>
        {/await}
    {/if}
</div>

<svelte:window on:resize={() => setLineHeight(lineHolder)}/>

<style lang="scss">
  .Editor {
    min-width: 100%;
    min-height: 100%;
    
    width: auto;
    height: auto;

    box-sizing: border-box;
    text-overflow: clip;

    position: relative;
    background-color: var(--code-background);

    padding: 0;
    margin: 0;

    font-family: 'JetBrainsMonoNL NF', monospace;
    font-size: 16px;
    line-height: 100%;

    :global(.code-line) {
      padding-top: 2px;
      padding-bottom: 2px;
      box-sizing: border-box;
    }

    #cursor {
      position: absolute;
      width: 1ch;
      background-color: white;
      //animation: blink 1.2s infinite step-end;
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
