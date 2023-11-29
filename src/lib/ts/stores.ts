import {type Writable, writable} from "svelte/store";
import type {File} from "./backend";

export namespace Stores {
    export const openedFile: Writable<File | undefined> = writable(undefined);
}