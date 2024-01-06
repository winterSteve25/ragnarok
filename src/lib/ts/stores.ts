import {type Writable, writable} from "svelte/store";
import type {File} from "ragnarok-api";

export const OPENED_FILE: Writable<File | undefined> = writable(undefined);
export const SETTINGS_MODAL = writable(null);
export const COMMAND_PALETTE_MODAL = writable(null);
export const LOADING_PLUGIN: Writable<string | undefined> = writable(undefined); 