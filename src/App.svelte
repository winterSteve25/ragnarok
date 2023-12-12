<script lang="ts">
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import FileExplorer from "./lib/components/tree/FileExplorer.svelte";
    import Editor from "./lib/components/editor/Editor.svelte";

    import {invoke} from "@tauri-apps/api";
    import Modal from 'svelte-simple-modal';
    import {settingsModal} from "./lib/ts/stores";
    import type {FadeParams} from "svelte/transition";
    import {Settings} from "./lib/ts/settings";

    const transitionProps: FadeParams = {
        duration: 200,
    }

    const windowStyle: Record<string, string> = {
        "background-color": "var(--editor-background)",
        "color": "var(--editor-foreground)",
        "width": "60%",
        "min-height": "80%",
        "margin": "0",
    }
    
    const wrapperStyle: Record<string, string> = {
        "width": "100%",
        "min-height": "100%",
        "margin": "0",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
    }

    async function load() {
        await Settings.loadSettings();
        await invoke("close_splashscreen");
    }
</script>

<main>
    {#await load()}
        Loading
    {:then _}
        <Splitpanes theme="custom">
            <Pane minSize={15} snapSize={2} size={20}>
                <FileExplorer/>
            </Pane>
            <Pane minSize={20}>
                <Editor/>
            </Pane>
        </Splitpanes>
        <Modal
            show={$settingsModal}
            transitionBgProps={transitionProps}
            transitionWindowProps={transitionProps}
            styleWindow={windowStyle}
            styleWindowWrap={wrapperStyle}
            closeButton={false}
        />
    {/await}
</main>

<style lang="scss">
  main {
    height: 100%;
    width: 100%;
  }
</style>