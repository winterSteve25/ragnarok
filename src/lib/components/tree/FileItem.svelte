<script lang="ts">
    import type {File} from "ragnarok-api";
    import {OPENED_FILE} from "../../ts/stores";

    export let file: File;
</script>

<button class="FileItem" on:click={() => OPENED_FILE.set(file)}>
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