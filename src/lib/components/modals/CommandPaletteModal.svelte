<script lang="ts">
    import {commandPaletteModal} from "../../ts/stores.js";

    // @ts-ignore
    import Modal from "svelte-simple-modal";
    import type {FadeParams} from "svelte/transition";

    const transition: FadeParams = {
        duration: 100,
    }

    const windowStyle: Record<string, string> = {
        "background-color": "var(--editor-background)",
        "color": "var(--editor-foreground)",
        "width": "60%",
        "min-height": "10%",
        "margin": "0",
    }

    const wrapperStyle: Record<string, string> = {
        "width": "100%",
        "min-height": "100%",
        "margin-bottom": "10%",
        "display": "flex",
        "align-items": "end",
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
