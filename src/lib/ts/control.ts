import {type Key, type Keybind, KeybindQuery, type KeyDetailed} from "ragnarok-api";
import {Settings} from "./settings";
import {type Writable, writable} from "svelte/store";

export namespace KeyboardControl {
    export const CURSOR_POS: Writable<number> = writable(0);
    export const CURSOR_LINE: Writable<number> = writable(0);
    
    let currentQuery: KeybindQuery | undefined = undefined;
    let currentKeybind: Keybind | undefined = undefined;
    let capturing: string[] = [];
    
    export function onKeyDown(event: KeyboardEvent) {
        const element = event.target as HTMLElement;

        if (element && element.tagName.toLowerCase() === "input") {
            return;
        }

        if (event.key === "Shift"
            || event.key === "Control"
            || event.key === "Alt"
            || event.key === "Super") {
            return;
        }

        event.preventDefault();
        const key = convertKeyboardEventToKey(event);

        if (currentKeybind) {
            capturing.push(event.key);
            if (currentKeybind.captureLength >= capturing.length) {
                currentKeybind.onTrigger(, capturing);
                currentKeybind = undefined;
                capturing = [];
            }
            return;
        }

        if (!currentQuery) {
            currentQuery = Settings.activeKeymap.get(key);
        } else {
            currentQuery.update(key);
        }

        if (currentQuery) {
            const keybind = currentQuery.conclude();

            if (!keybind) {
                return;
            }

            currentQuery = undefined;

            if (keybind.captureLength === 0 ) {
                keybind.onTrigger(, []);
            } else {
                currentKeybind = keybind;
            }
        }
    }

    function convertKeyboardEventToKey(event: KeyboardEvent): Key {
        const key: KeyDetailed = {
            key: event.key,
            modifier: new Set()
        };

        if (event.ctrlKey) {
            key.modifier!.add("Ctrl");
        }

        if (event.altKey) {
            key.modifier!.add("Alt");
        }

        if (event.shiftKey) {
            key.modifier!.add("Shift");
        }

        return key.modifier!.size === 0 ? event.key : key;
    }
}
