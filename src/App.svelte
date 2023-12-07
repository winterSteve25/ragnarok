<script lang="ts">
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import FileExplorer from "./lib/components/tree/FileExplorer.svelte";
    import Editor from "./lib/components/editor/Editor.svelte";

    import {Settings} from "./lib/ts/settings";
    import {Theming} from "./lib/ts/theme";
    import {Plugins} from "./lib/ts/plugins";
    import {invoke} from "@tauri-apps/api";

    async function load() {
        await Theming.loadThemes();
        await Settings.load();
        await Plugins.load();
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
    {/await}
</main>

<style lang="scss">
    main {
        height: 100%;
        width: 100%;
    }
</style>