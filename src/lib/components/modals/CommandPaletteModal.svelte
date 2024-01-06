<script lang="ts">
    import {COMMAND_PALETTE_MODAL} from "../../ts/stores.js";

    // @ts-ignore
    import Modal from "svelte-simple-modal";
    import type {FadeParams} from "svelte/transition";

    const transition: FadeParams = {
        duration: 100,
    }

    const windowStyle: Record<string, string> = {
        "background-color": "var(--editor-background)",
        "color": "var(--editor-foreground)",
        "width": "40%",
        "min-height": "80%",
        "margin": "0",
    }
    
    const contentStyle: Record<string, string> = {
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
        show={$COMMAND_PALETTE_MODAL}
        transitionBgProps={transition}
        transitionWindowProps={transition}
        styleWindow={windowStyle}
        styleWindowWrap={wrapperStyle}
        styleContent={contentStyle}
        styleBg={bgStyle}
        closeButton={false}
/>
