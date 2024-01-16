import { 
	type Key, 
	type Keybind,
	KeybindQuery,
	type KeyDetailed,
	type EditorContext,
	MotionKeybind, 
    ActionKeybind,
    type KeybindData
} from "ragnarok-api";

import { Settings } from "./settings";
import { EDITOR_CONTEXT } from "./stores";
import { get } from "svelte/store";

export namespace KeyboardControl {
    
	let currentKeybindIdx = -1;
	let currentInputBuffer: (Keybind | string | number)[] = [];
    let currentQuery: KeybindQuery | undefined = undefined;
	let capture: boolean = false;
	
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

		if (capture) {
			currentInputBuffer.push(event.key);
			tryExecute();
			return;
		}

		if (!isNaN(+event.key)) {
			const lastElement = currentInputBuffer[currentInputBuffer.length - 1];

			if (currentInputBuffer.length > 0 && typeof lastElement === "number") {
				currentInputBuffer[currentInputBuffer.length - 1] = +(lastElement + event.key);
				return;
			}

			currentInputBuffer.push(+event.key);
			return;
		}

		if (!currentQuery) {
			currentQuery = Settings.activeKeymap.get(convertKeyboardEventToKey(event));
		}

		if (currentQuery) {
			const k = currentQuery.conclude();
			if (k) {
				if (currentKeybindIdx === -1) {
					currentKeybindIdx = currentInputBuffer.length;
					if (k instanceof MotionKeybind && k.finishCapture) {
						capture = true;
					}
				}
				currentInputBuffer.push(k);
				currentQuery = undefined;
				tryExecute();
			}
		}   
	}

	function tryExecute() {
		if (currentKeybindIdx === -1) return;
		const keybind = currentInputBuffer[currentKeybindIdx] as Keybind;
		const ctx = get(EDITOR_CONTEXT);
		
		if (keybind instanceof MotionKeybind) {
			returnMotion(currentKeybindIdx, true);
			return;
		} 

		if (keybind instanceof ActionKeybind) {
			const motion = isMotion(1) ?
				currentKeybindIdx + 1 :
				isMotion(2) ?
					currentKeybindIdx + 2 :
					undefined;

			if (motion) {
				const dest = returnMotion(motion, false);
				if (dest) {
					trigger(keybind, {
						range: {
							start: [ctx.cursorPosition, ctx.cursorLine],
							end: dest
						}
					});
				}
				return;
			}

			if (currentInputBuffer.length > currentKeybindIdx + 1) {
				const action = currentInputBuffer[currentKeybindIdx + 1];
				if (action instanceof ActionKeybind && action.identifier === keybind.identifier) {
					trigger(keybind, {
						range: {
							start: [0, ctx.cursorLine],
							end: [ctx.currentBuffer[ctx.cursorLine].length, ctx.cursorLine]
						}
					});
					return;
				}
			}

			return;
		}
		
		trigger(keybind, {});
	}

	function isMotion(offset: number): boolean {
		if (currentInputBuffer.length > currentKeybindIdx + offset) {
			if (currentInputBuffer[currentKeybindIdx + offset] instanceof MotionKeybind) {
				return true;
			}
		}

		return false;
	}

	function trigger(keybind: Keybind, data: Partial<KeybindData>) {
		console.log(keybind);
		console.log(data);
		currentKeybindIdx = -1;
		currentInputBuffer = [];
		keybind.onTrigger(ctxSetter, data);
	}

	function returnMotion(motionIdx: number, run: boolean): [number, number] | undefined {
		const motion = currentInputBuffer[motionIdx] as MotionKeybind;

		// if previous element is a number 
		// use it as the motion motionMultiplier
		// if doesn't exist use 1
		const motionMultiplier = motionIdx > 0 && typeof currentInputBuffer[motionIdx - 1] === "number" ?
			currentInputBuffer[motionIdx - 1] as number :
			1;

		if (!motion.finishCapture) {
			const data = {
				motionMultiplier: motionMultiplier
			};
			if (run) {
				trigger(motion, data);
			} else {
				return motion.destination(get(EDITOR_CONTEXT), data);
			}
		} else {
			const slice = currentInputBuffer.slice(motionIdx + 1);
			const last = slice.length > 0 ? slice[slice.length - 1] as string : "";

			if (motion.finishCapture(slice as string[], last)) {
				const data = {
					motionMultiplier: motionMultiplier,
					capture: slice as string[],
				};

				if (run) {
					trigger(motion, data);
				} else {
					return motion.destination(get(EDITOR_CONTEXT), data);
				}

			}
		}

		return undefined;
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
