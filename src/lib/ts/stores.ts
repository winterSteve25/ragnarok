import {type Writable, writable} from "svelte/store";
import type {File} from "ragnarok-api";

export const openedFile: Writable<File | undefined> = writable(undefined);
export const settingsModal = writable(null);