<script lang="ts">
    import type {File} from "../../ts/backend";
    import {Theming} from "../../ts/theme";

    export let file: File;
</script>

<div class="FileItem">
    {@html Theming.getIconFromLoadedTheme(file)}
    <span>{file.filename}</span>
</div>

<style lang="scss">
  .FileItem {
    @include button;
    
    align-items: start;

    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-left: solid var(--editor-foreground-secondary) 2px;
    
    height: 32px;
    width: 100%;

    padding: 8px 16px;
    box-sizing: border-box;
  }
</style>