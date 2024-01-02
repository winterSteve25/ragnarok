// @ts-ignore
import {bind} from "svelte-simple-modal";
import {commandPaletteModal, settingsModal} from "./stores";
import SettingsMenu from "../components/SettingsMenu.svelte";
import CommandPalette from "../components/CommandPalette.svelte";

export namespace Modals {
    export function openSettings() {
        settingsModal.set(bind(SettingsMenu))
    }
    
    export function openCommandPalette() {
        commandPaletteModal.set(bind(CommandPalette));
    }
}