<script lang="ts">
    import type {File} from "ragnarok-api";
    import {FOCUS_ON_EDITOR, OPENED_FILE} from "../../ts/stores";

    export let file: File;
    
    function open() {
        OPENED_FILE.set(file);
        FOCUS_ON_EDITOR.set(true);
    }
</script>

<button class="FileItem" on:click={open}>
<!--    <img alt="file-icon" src={Theming.getIconFromLoadedTheme(file)}/>-->
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

    img {
      min-width: 16px;
      max-width: 16px;
      max-height: 16px;
      fill: var(--editor-foreground);
    }
  }
</style>