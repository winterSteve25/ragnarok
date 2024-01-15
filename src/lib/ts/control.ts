import { 
	type Key, 
	type Keybind,
	KeybindQuery,
	type KeyDetailed,
	type EditorContext,
	MotionKeybind, 
    ActionKeybind
} from "ragnarok-api";
import { Settings } from "./settings";
import { EDITOR_CONTEXT } from "./stores";
import { get } from "svelte/store";

export namespace KeyboardControl {
    
	let currentInputBuffer: (Keybind | string | number)[] = [];
    let currentQuery: KeybindQuery | undefined = undefined;
	
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

		if (!currentQuery) {
			currentQuery = Settings.activeKeymap.get(convertKeyboardEventToKey(event));
		}

		if (currentQuery) {
			const k = currentQuery.conclude();
			if (k) {
				currentInputBuffer.push(k);
				currentQuery = undefined;
				tryExecute();
			}
		}   
	}

	function tryExecute() {
		let focus: Keybind | undefined = undefined;

		for (let i = 0; i < currentInputBuffer.length; i++) {
			const key = currentInputBuffer[i];

			if (isKeybind(key)) {
				if (!focus) {
					focus = key;
				}
			} 

			if (typeof key === "string") {
				if (!isNaN(+key)) {
					let j = i;
					let num = "";
					let next = currentInputBuffer[j];

					while (!isKeybind(next) && !isNaN(+next)) {
						num += next;
						j++;
						next = currentInputBuffer[j];
					}

					const offset = j - i;
					currentInputBuffer.splice(i, offset, +num);
				}
			}
		}

		console.log(currentInputBuffer);
	}

	function isKeybind(input: any): input is Keybind {
		return "identifier" in input;
	} 

	function ctxSetter(setter: (ctx: EditorContext) => void) {
		EDITOR_CONTEXT.update((ctx) => {
			setter(ctx);
			return ctx;
		});
	}

	
    function convertKeyboardEventToKey(event: KeyboardEvent): Key {
        const key: KeyDetailed = {
            key: event.key,
        };

        if (event.ctrlKey) {
			key.modifier = new Set();
            key.modifier.add("Ctrl");
        }

        if (event.altKey) {
			if (!key.modifier) {
				key.modifier = new Set();
			}
			
            key.modifier.add("Alt");
        }

        return key.modifier ? event.key : key;
    }
}
