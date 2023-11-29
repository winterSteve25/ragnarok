<script lang="ts">
    import type {File} from "../../ts/backend";
    import {Stores} from "../../ts/stores";

    export let file: File;
</script>

<button class="FileItem" on:click={() => Stores.openedFile.set(file)}>
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z" fill="currentColor"/></svg>
    <span>{file.filename}</span>
</button>

<style lang="scss">
  .FileItem {
    @include button;

    display: flex;
    flex-direction: row;
    justify-content: start;
    
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-left: solid var(--editor-foreground-secondary) 2px;
    
    height: 32px;
    width: 100%;

    padding: 8px 16px;
    box-sizing: border-box;
    
    svg {
      color: var(--editor-foreground);
    }
  }
</style>