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
import {KeybindHelper} from "../keybinds/helper";

export namespace KeyboardControl {
    
	let currentKeybindIdx = -1;
	let currentInputBuffer: (Keybind | string | number)[] = [];
    let currentQuery: KeybindQuery | null = null;
	let capture: boolean = false;
	let isNewQuery: boolean = false;
	
	const ctx = get(EDITOR_CONTEXT);
	const dirToOffset = {
		"Left": KeybindHelper.moveCursorLeft,
		"Right": KeybindHelper.moveCursorRight,
		"Up": KeybindHelper.moveCursorUp,
		"Down": KeybindHelper.moveCursorDown,
	};
	
	export function onFocusIn(event: FocusEvent) {
	}

    export async function onKeyDown(event: KeyboardEvent) {
		if (ctx.insertMode) {
			if (!ctx.currentBuffer) {
				return;
			}
			
			if (insertMode(event)) {
				event.preventDefault();
				return;
			}
		}

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
			let k = currentQuery.conclude();
			
			if (k) {
				if (currentKeybindIdx === -1) {
					currentKeybindIdx = currentInputBuffer.length;
					if (k instanceof MotionKeybind && k.finishCapture) {
						capture = true;
					}
				}
				currentInputBuffer.push(k);
				currentQuery = null;
				tryExecute();
			} else {
				if (!isNewQuery) {
					currentQuery.update(convertKeyboardEventToKey(event));
				} else {
					isNewQuery = false;
				}
			}
		}   
	}

	function tryExecute() {
		if (currentKeybindIdx === -1) return;
		const keybind = currentInputBuffer[currentKeybindIdx] as Keybind;
		
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
					trigger(keybind, () => {return{
						range: {
							start: [ctx.cursorPosition, ctx.cursorLine],
							end: dest
						}
					}});
				}
				return;
			}

			if (currentInputBuffer.length > currentKeybindIdx + 1) {
				const action = currentInputBuffer[currentKeybindIdx + 1];
				if (action instanceof ActionKeybind && action.identifier === keybind.identifier) {
					trigger(keybind, () => {return {
						range: {
							start: [0, ctx.cursorLine],
							end: [ctx.currentBuffer!.getLineLength(ctx.cursorLine), ctx.cursorLine]
						}
					}});
					return;
				}
			}

			return;
		}
		
		trigger(keybind, () => { return {} });
	}

	function isMotion(offset: number): boolean {
		if (currentInputBuffer.length > currentKeybindIdx + offset) {
			if (currentInputBuffer[currentKeybindIdx + offset] instanceof MotionKeybind) {
				return true;
			}
		}

		return false;
	}
	
	function trigger(keybind: Keybind, data: () => Partial<KeybindData>) {
		currentKeybindIdx = -1;
		currentInputBuffer = [];
		
		if (keybind.requiresBuffer && (!ctx.currentBuffer || !ctx.currentFile)) {
			return;
		}
		
		keybind.onTrigger(ctxSetter, data());
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
				trigger(motion, () => data);
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
					trigger(motion, () => data);
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
	
	function insertMode(event: KeyboardEvent): boolean {
		
		if (event.key === "Escape") {
			return false;
		}
		
		if (event.code.startsWith("Key") || 
			event.code === "Space" ||
			event.code.startsWith("Digit")
		) {
			insertStrAtCursor(event.key);
			return true;
		}
		
		if (event.key === "Tab") {
			insertStrAtCursor("    ");
			return true;
		}
		
		if (event.key === "Enter") {
			const buffer = ctx.currentBuffer!;
			const offset = buffer.getOffsetAt(ctx.cursorLine, ctx.cursorPosition + 1);

			if (offset < 0) {
				return true;
			}

			EDITOR_CONTEXT.update((ctx) => {
				buffer.insert(offset, "\n");
				ctx.cursorLine += 1;
				ctx.cursorPosition = 0;
				return ctx;
			});
			
			return true;
		}
		
		if (event.key.startsWith("Arrow")) {
			// @ts-ignore
			const dir = dirToOffset[event.key.slice(5)];
			const [destPos, destLine] = dir(ctx, 1);
			
			if (destPos === ctx.cursorPosition && destLine === ctx.cursorLine) {
				return true;
			}

			EDITOR_CONTEXT.update((ctx) => {
				ctx.cursorPosition = destPos;
				ctx.cursorLine = destLine;
				return ctx;
			});
			
			return true;
		}
		
		if (event.key === "Delete") {
			const buffer = ctx.currentBuffer!;
			const offset = buffer.getOffsetAt(ctx.cursorLine, ctx.cursorPosition) + 1;
			if (offset < 0) return true;

			EDITOR_CONTEXT.update((ctx) => {
				buffer.delete(offset, 1);
				return ctx;
			});
			return true;
		}
		
		if (event.key === "Backspace") {
			const buffer = ctx.currentBuffer!;
			const offset = buffer.getOffsetAt(ctx.cursorLine, ctx.cursorPosition);
			if (offset < 0) return true;
			
			EDITOR_CONTEXT.update((ctx) => {
				buffer.delete(offset, 1);
				ctx.cursorPosition -= 1;
				return ctx;
			});
			return true;
		}
		
		return false;
	}
	
	function insertStrAtCursor(char: string) {
		const buffer = ctx.currentBuffer!;
		const offset = buffer.getOffsetAt(ctx.cursorLine, ctx.cursorPosition + 1);
		
		if (offset < 0) {
			return;
		}
		
		EDITOR_CONTEXT.update((ctx) => {
			buffer.insert(offset, char);
			ctx.cursorPosition += char.length;
			return ctx;
		});
	}
}
