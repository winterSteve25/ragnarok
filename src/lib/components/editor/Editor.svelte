<script lang="ts">
    import {Stores} from "../../ts/stores";
    import {onDestroy, onMount} from "svelte";
    import type {File} from "../../ts/backend";
    import {EditorRenderer} from "./EditorRenderer";

    let openedFile: File | undefined = undefined;
    let element: HTMLDivElement;
    let editor: EditorRenderer;

    const unsub = Stores.openedFile.subscribe((newFile) => {
        openedFile = newFile;
    });
    
    onMount(() => {
        editor = new EditorRenderer(element!, openedFile);
        editor.render();
    });
    
    onDestroy(unsub);
</script>

<div class="Editor" bind:this={element}/>
<svelte:window on:keydown|preventDefault={editor.onKeyDown}/>

<style lang="scss">
  .Editor {
    width: 100%;
    height: 100%;
  }
</style>
