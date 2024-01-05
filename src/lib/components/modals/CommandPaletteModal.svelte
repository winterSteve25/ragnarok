<script lang="ts">
    import {commandPaletteModal} from "../../ts/stores.js";

    // @ts-ignore
    import Modal from "svelte-simple-modal";
    import type {FadeParams} from "svelte/transition";

    const transition: FadeParams = {
        duration: 100,
    }

    const windowStyle: Record<string, string> = {
        "background-color": "rgba(0, 0, 0, 0)",
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
    
    const bgStyle: Record<string, string> = {
        "backgroundColor": "rgba(0, 0, 0, 0.5)"
    }
</script>

<Modal
        show={$commandPaletteModal}
        transitionBgProps={transition}
        transitionWindowProps={transition}
        styleWindow={windowStyle}
        styleWindowWrap={wrapperStyle}
        styleBg={bgStyle}
        closeButton={false}
/>
