<script lang="ts">
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import FileExplorer from "./lib/components/tree/FileExplorer.svelte";

    // @ts-ignore
    import {loadingPlugin} from "./lib/ts/stores";
    import {Settings} from "./lib/ts/settings";
    import View from "./lib/components/view/View.svelte";
    import SettingsModal from "./lib/components/modals/SettingsModal.svelte";
    import CommandPaletteModal from "./lib/components/modals/CommandPaletteModal.svelte";
    
    async function load() {
        await Settings.loadSettings();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
</script>

<main>
    {#await load()}
        <div class="center">
            {#if $loadingPlugin}
                <h1>
                    Loading {$loadingPlugin}
                </h1>
            {:else}
                <h1>
                    Loading
                </h1>
            {/if}
        </div>
    {:then _}
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