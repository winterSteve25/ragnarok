<script lang="ts">
    import type {File} from "../../ts/backend";

    export let file: File;
</script>

<div class="FileItem">
    <span>{file.filename}</span>
</div>

<style lang="scss">
  @import "src/lib.scss";

  .FileItem {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-left: solid var(--editor-foreground-secondary) 2px;

    height: 32px;
    max-width: 100%;
    min-width: auto;

    padding: 8px 16px;
    box-sizing: border-box;

    @include button;
  }
</style>