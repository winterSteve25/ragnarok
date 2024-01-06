<script lang="ts">
    import {autoUpdate, computePosition, type ComputePositionConfig} from "@floating-ui/dom";
    import {onDestroy, onMount} from "svelte";

    let child: any;
    let tooltip: HTMLDivElement;
    let cleanup: () => void;
    let initialized: boolean = false;

    export let shown: boolean = false;
    export let tooltipPosition: Partial<ComputePositionConfig> = {};

    function getChild(node: HTMLDivElement) {
        child = node.firstChild;
    }

    function updateTooltipPosition() {
        computePosition(child, tooltip, tooltipPosition).then(({x, y}) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`
            })
        });
    }

    function hideTooltip() {
        shown = false;
        if (cleanup) {
            cleanup();
            // @ts-ignore
            // cleanup = undefined;
        }
    }

    function showTooltip() {
        updateTooltipPosition();
        cleanup = autoUpdate(child, tooltip, updateTooltipPosition);
    }
    
    $: {
        if (initialized) {
            if (shown) {
                showTooltip();
            } else {
                hideTooltip();
            }
        }
    }
    
    onMount(() => initialized = true);
    onDestroy(hideTooltip);
</script>

<div class="tooltip-wrapper" use:getChild>
    <slot/>
    {#if shown}
        <div class="tooltip" bind:this={tooltip}>
            <slot name="tooltip"/>
        </div>
    {/if}
</div>

<style lang="scss">
  .tooltip-wrapper {
    .tooltip {
      width: max-content;
      position: absolute;
      top: 0;
      left: 0;

      background-color: var(--editor-background);
      color: var(--editor-foreground);
      padding: 8px;
      border-radius: var(--border-radius);
    }
  }
</style>