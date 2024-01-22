import type { EditorContext } from "ragnarok-api";

export namespace KeybindHelper {
	export function lastOnLine(ctx: Readonly<EditorContext>, line: number): number {
		if (!ctx.currentBuffer) {
			return 0;
		}
		return Math.max(ctx.currentBuffer[line].length - 1, 0);
	}

	export function isCursorOverChars(ctx: Readonly<EditorContext>, line: number): boolean {
		if (!ctx.currentBuffer) {
			return false;
		}
		return ctx.currentBuffer[line].length - 1 <= ctx.cursorPosition;
	}
}
