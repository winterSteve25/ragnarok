import type { Keymap } from "ragnarok-api";

export function registerMotionKeys(map: Keymap) {
	map.create("motion.word", "w")
		.describe("Moves to the next word")
		.motion()
		.register((ctx, _capture) => {
			const line = ctx.currentBuffer[ctx.cursorLine];
			const next = line.substring(ctx.cursorPosition).indexOf(" ");

			if (next === -1 && ctx.cursorLine < ctx.currentBuffer.length) {
				return [0, ctx.cursorLine + 1];
			}

			return [next === -1 ? ctx.cursorPosition : next + ctx.cursorPosition + 1, ctx.cursorLine];
		});
} 
