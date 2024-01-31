<script lang="ts">
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import FileExplorer from "./lib/components/tree/FileExplorer.svelte";

    // @ts-ignore
    import {LOADING_PLUGIN} from "./lib/ts/stores";
    import {Settings} from "./lib/ts/settings";
    import View from "./lib/components/view/View.svelte";
    import SettingsModal from "./lib/components/modals/SettingsModal.svelte";
    import CommandPaletteModal from "./lib/components/modals/CommandPaletteModal.svelte";
    import {onDestroy, onMount} from "svelte";
    import { KeyboardControl } from "./lib/ts/control";
    
    async function load() {
        await Settings.loadSettings();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

	onMount(() => {
		document.addEventListener("keydown", KeyboardControl.onKeyDown);
		document.addEventListener("focusin", KeyboardControl.onFocusIn);
        document.addEventListener("focusout", KeyboardControl.onFocusOut);
	});
    
    onDestroy(() => {
        document.removeEventListener("keydown", KeyboardControl.onKeyDown);
        document.removeEventListener("focusin", KeyboardControl.onFocusIn);
        document.removeEventListener("focusout", KeyboardControl.onFocusOut);
    })
</script>

<main>
    {#await load()}
        <div class="center">
            {#if $LOADING_PLUGIN}
                <h1>
                    Loading {$LOADING_PLUGIN}
                </h1>
            {:else}
                <h1>
                    Loading
                </h1>
            {/if}
        </div>
    {:then}
        <Splitpanes theme="custom">
            <Pane minSize={15} snapSize={2} size={20}>
                <FileExplorer/>
            </Pane>
            <Pane minSize={20}>
                <View/>
            </Pane>
        </Splitpanes>
        <SettingsModal/>
        <CommandPaletteModal/>
    {:catch err}
        <div class="center">
            {err.message}<br/><br/>
            {err.stack}<br/>
            {#if err.cause}
                {err.cause.stack}
            {/if}
        </div>
    {/await}
</main>

<style lang="scss">
  main {
    height: 100%;
    width: 100%;
  }

  .center {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: start;
  }
</style>
