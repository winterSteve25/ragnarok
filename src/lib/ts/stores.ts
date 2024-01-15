import {type Writable, writable} from "svelte/store";
import type {EditorContext, File} from "ragnarok-api";

export const OPENED_FILE: Writable<File | undefined> = writable(undefined);
export const SETTINGS_MODAL = writable(null);
export const COMMAND_PALETTE_MODAL = writable(null);
export const LOADING_PLUGIN: Writable<string | undefined> = writable(undefined); 
export const EDITOR_CONTEXT: Writable<EditorContext> = writable({
	cursorPosition: 0,
	cursorLine: 0,
	insertMode: false,
	currentBuffer: [],
});
