<script lang="ts">
import FileTree from "./lib/components/tree/FileTree.svelte";
import {onMount} from "svelte";
import {Backend} from "./lib/ts/backend";

onMount(async () => {
    console.log(Backend.openTextFile("/home/cadenz/Documents/G12-HS/Biology/Unit 1/09-07 Water.md"));
})

</script>

<main class="App">
    <FileTree></FileTree>
</main>

<style lang="scss">
    
</style>