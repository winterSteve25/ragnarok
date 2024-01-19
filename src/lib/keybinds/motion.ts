import type { EditorContext, Keymap } from "ragnarok-api";

function lastOnLine(ctx: Readonly<EditorContext>, line: number): number {
	return Math.max(ctx.currentBuffer[line].length - 1, 0);
}

function isCursorOverChars(ctx: Readonly<EditorContext>, line: number): boolean {
	return ctx.currentBuffer[line].length - 1 <= ctx.cursorPosition;
}

export function registerMotionKeys(keymap: Keymap) {
	keymap.create("motion.right", "l")
		.describe("Moves right")
		.motion()
		.register((ctx, _capture) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (isCursorOverChars(ctx, line)) {
				if (line == ctx.currentBuffer.length - 1) {
					return [pos, line];
				}
				return [0, line + 1];
			}

			return [pos + 1, line];
		});

	keymap.create("motion.left", "h")
		.describe("Moves left")
		.motion()
		.register((ctx, _capture) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (pos == 0) {
				if (line == 0) {
					return [0, 0];
				}
				return [lastOnLine(ctx, line - 1), line - 1];
			}

			return [pos - 1, line];
		});

	keymap.create("motion.up", "k")
		.describe("Moves up")
		.motion()
		.register((ctx, _capture) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (line === 0) {
				return [pos, line];
			}

			const newLine = line - 1;
			const newPos = isCursorOverChars(ctx, newLine) ? lastOnLine(ctx, newLine) : pos;

			return [newPos, newLine];
		});

	keymap.create("motion.down", "j")
		.describe("Moves down")
		.motion()
		.register((ctx, _capture) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (line === ctx.currentBuffer.length - 1) {
				return [pos, line];
			}

			const newLine = line + 1;
			const newPos = isCursorOverChars(ctx, newLine) ? lastOnLine(ctx, newLine) : pos;

			return [newPos, newLine];
		});
} 
