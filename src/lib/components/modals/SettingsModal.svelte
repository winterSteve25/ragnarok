<script lang="ts">
    import {settingsModal} from "../../ts/stores.js";
    
    // @ts-ignore
    import Modal from "svelte-simple-modal";
    import type {FadeParams} from "svelte/transition";

    const transition: FadeParams = {
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
</script>

<Modal
        show={$settingsModal}
        transitionBgProps={transition}
        transitionWindowProps={transition}
        styleWindow={windowStyle}
        styleWindowWrap={wrapperStyle}
        closeButton={false}
/>
