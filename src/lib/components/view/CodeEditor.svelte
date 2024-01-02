<script lang="ts">
    import {onDestroy} from "svelte";
    import {FileHelper} from "../../ts/fileHelper";
    import {type File, type Key, type KeyDetailed, KeybindQuery, type Keybind} from "ragnarok-api";
    import {openedFile} from "../../ts/stores";
    import {get} from "svelte/store";
    import {Settings} from "../../ts/settings";
    import {LSP} from "../../ts/lsp";
    import {renderEditor} from "./codeEditor";

    let file: File | undefined = undefined;

    const unsub = openedFile.subscribe((newFile) => file = newFile);
    onDestroy(unsub);

    $: keymap = get(Settings.ACTIVE_KEYMAP);
    let currentQuery: KeybindQuery | undefined = undefined;
    let currentKeybind: Keybind | undefined = undefined;
    let capturing: string[] = [];

    function onKeyDown(event: KeyboardEvent) {
        
        const element = event.target as HTMLElement;
        
        if (element && element.tagName.toLowerCase() === "input") {
            return;
        }
        
        if (event.key === "Shift" 
            || event.key === "Control" 
            || event.key === "Alt"
            || event.key === "Super") {
            return;
        }
        
        event.preventDefault();
        const key = convertKeyboardEventToKey(event);
        
        if (currentKeybind) {
            capturing.push(event.key);
            if (currentKeybind.captureLength >= capturing.length) {
                currentKeybind.callback(capturing);
                currentKeybind = undefined;
                capturing = [];
            }
            return;
        }
        
        if (!currentQuery) {
            currentQuery = keymap.get(key);
        } else {
            currentQuery.update(key);
        }

        if (currentQuery) {
            const keybind = currentQuery.conclude();

            if (!keybind) {
                return;
            }

            currentQuery = undefined;

            if (keybind.captureLength === 0 ) {
                keybind.callback([""]);
            } else {
                currentKeybind = keybind;
            }
        }
    }

    function convertKeyboardEventToKey(event: KeyboardEvent): Key {
        const key: KeyDetailed = {
            key: event.key,
            modifier: new Set()
        };

        if (event.ctrlKey) {
            key.modifier!.add("Ctrl");
        }

        if (event.altKey) {
            key.modifier!.add("Alt");
        }

        if (event.shiftKey) {
            key.modifier!.add("Shift");
        }

        return key.modifier!.size === 0 ? event.key : key;
    }

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

<svelte:window on:keydown={onKeyDown}/>

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
