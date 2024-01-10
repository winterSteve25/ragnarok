import {type Key, type Keybind, KeybindQuery, type KeyDetailed, type EditorContext, MotionKeybind, keyToString} from "ragnarok-api";
import {Settings} from "./settings";
import { EDITOR_CONTEXT } from "./stores";

export namespace KeyboardControl {
    
    let currentQuery: KeybindQuery | undefined = undefined;
    let currentKeybind: Keybind | undefined = undefined;
    let capturing: string[] = [];
	
	function getCaptureLength(keybind: Keybind) {
		if (keybind instanceof MotionKeybind) {
			return (keybind as MotionKeybind).captureLength;
		}
		
		return 0;
	}

	function ctxSetter(setter: (ctx: EditorContext) => void) {
		EDITOR_CONTEXT.update((ctx) => {
			setter(ctx);
			return ctx;
		});
	}
    
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
            if (getCaptureLength(currentKeybind) >= capturing.length) {
                currentKeybind.onTrigger(ctxSetter, {
					capture: capturing
				});
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

            if (getCaptureLength(keybind) === 0 ) {
                keybind.onTrigger(ctxSetter, {});
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

        return key.modifier!.size === 0 ? event.key : key;
    }
}
