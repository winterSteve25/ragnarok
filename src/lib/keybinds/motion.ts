import type { Keymap } from "ragnarok-api";
import { KeybindHelper } from "./helper";

export function registerMotionKeys(keymap: Keymap) {
	keymap.create("motion.right", "l")
		.describe("Moves right")
		.motion()
		.register((ctx, data) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (KeybindHelper.isCursorOverChars(ctx, line)) {
				if (line == ctx.currentBuffer!.length - 1) {
					return [pos, line];
				}
				return [0, line + 1];
			}

			return [pos + 1, line];
		});

	keymap.create("motion.left", "h")
		.describe("Moves left")
		.motion()
		.register((ctx, data) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (pos == 0) {
				if (line == 0) {
					return [0, 0];
				}
				return [KeybindHelper.lastOnLine(ctx, line - 1), line - 1];
			}

			return [pos - 1, line];
		});

	keymap.create("motion.up", "k")
		.describe("Moves up")
		.motion()
		.register((ctx, data) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (line === 0) {
				return [pos, line];
			}

			const newLine = line - 1;
			const newPos = KeybindHelper.isCursorOverChars(ctx, newLine) ? KeybindHelper.lastOnLine(ctx, newLine) : pos;

			return [newPos, newLine];
		});

	keymap.create("motion.down", "j")
		.describe("Moves down")
		.motion()
		.register((ctx, data) => {
			const line = ctx.cursorLine;
			const pos = ctx.cursorPosition;

			if (line === ctx.currentBuffer!.length - 1) {
				return [pos, line];
			}

			const newLine = line + 1;
			const newPos = KeybindHelper.isCursorOverChars(ctx, newLine) ? KeybindHelper.lastOnLine(ctx, newLine) : pos;

			return [newPos, newLine];
		});
} 
