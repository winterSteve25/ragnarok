<script lang="ts">
    import type {File} from "../../ts/backend";
    import {Stores} from "../../ts/stores";
    import {Theming} from "../../ts/theme";

    export let file: File;
</script>

<button class="FileItem" on:click={() => Stores.openedFile.set(file)}>
    <img alt="file-icon" src={Theming.getIconFromLoadedTheme(file)}/>
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
    
    img {
      min-width: 16px;
      max-width: 16px;
      max-height: 16px;
      fill: var(--editor-foreground);
    }
    
    span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>