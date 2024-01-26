import type { EditorContext } from "ragnarok-api";

export namespace KeybindHelper {
	export function lastOnLine(ctx: Readonly<EditorContext>, line: number): number {
		if (!ctx.currentBuffer) {
			return 0;
		}
		
		if (ctx.insertMode) {
			return Math.max(ctx.currentBuffer.getLineLength(line), 0);
		}
		
		return Math.max(ctx.currentBuffer.getLineLength(line) - 1, 0);
	}

	export function firstOnLine(ctx: Readonly<EditorContext>, line: number): number {
		return 0;
	}
	
	export function isCursorBeyondLineEnd(ctx: Readonly<EditorContext>, line: number): boolean {
		if (!ctx.currentBuffer) {
			return false;
		}
		
		if (ctx.insertMode) {
			return ctx.currentBuffer.getLineLength(line) <= ctx.cursorPosition;
		}
		
		return ctx.currentBuffer.getLineLength(line) - 1 <= ctx.cursorPosition;
	}

	export function moveCursorRight(ctx: Readonly<EditorContext>, multiplier: number | undefined): [number, number] {
		const line = ctx.cursorLine;
		const pos = ctx.cursorPosition;

		if (KeybindHelper.isCursorBeyondLineEnd(ctx, line)) {
			if (line === ctx.currentBuffer!.getLineCount()) {
				return [pos, line];
			}
			return [0, line + 1];
		}

		return [pos + 1, line];
	}

	export function moveCursorLeft(ctx: Readonly<EditorContext>, multiplier: number | undefined): [number, number] {
		const line = ctx.cursorLine;
		const pos = ctx.cursorPosition;

		if (pos === 0) {
			if (line === 1) {
				return [pos, line];
			}
			return [KeybindHelper.lastOnLine(ctx, line - 1), line - 1];
		}

		return [pos - 1, line];
	}

	export function moveCursorDown(ctx: Readonly<EditorContext>, multiplier: number | undefined): [number, number]  {
		const line = ctx.cursorLine;
		const pos = ctx.cursorPosition;

		if (line === ctx.currentBuffer!.getLineCount()) {
			return [pos, line];
		}

		const newLine = line + 1;
		const newPos = KeybindHelper.isCursorBeyondLineEnd(ctx, newLine) ? KeybindHelper.lastOnLine(ctx, newLine) : pos;

		return [newPos, newLine];
	}

	export function moveCursorUp(ctx: Readonly<EditorContext>, multiplier: number | undefined): [number, number]  {
		const line = ctx.cursorLine;
		const pos = ctx.cursorPosition;

		if (line === 1) {
			return [pos, line];
		}

		const newLine = line - 1;
		const newPos = KeybindHelper.isCursorBeyondLineEnd(ctx, newLine) ? KeybindHelper.lastOnLine(ctx, newLine) : pos;

		return [newPos, newLine];
	}
}
