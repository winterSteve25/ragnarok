// @ts-ignore
import {bind} from "svelte-simple-modal";
import {COMMAND_PALETTE_MODAL, SETTINGS_MODAL} from "./stores";
import SettingsMenu from "../components/SettingsMenu.svelte";
import CommandPalette from "../components/CommandPalette.svelte";

export namespace Modals {
    export function openSettings() {
        SETTINGS_MODAL.set(bind(SettingsMenu))
    }
    
    export function openCommandPalette() {
        COMMAND_PALETTE_MODAL.set(bind(CommandPalette));
    }
}