<script lang="ts">
    import type {File} from "../../ts/backend";

    export let file: File;
</script>

<div class="FileItem">
    <span>{file.filename}</span>
</div>

<style lang="scss">
    .FileItem {
      display: flex;
      align-items: center;
      gap: 4px;
      
      height: 32px;
      width: 100%;
      
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      
      border-left: solid var(--editor-foreground-secondary) 2px;
      padding: 8px 16px;
      box-sizing: border-box;
      
      transition: ease-in-out 50ms;
      
      &:hover {
        background-color: var(--code-background);
        cursor: pointer;
      }
    }
</style>