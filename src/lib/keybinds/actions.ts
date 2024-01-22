import type { Keymap } from "ragnarok-api";

export function registerActionKeys(keymap: Keymap) {
	keymap.create("action.del", "d")
		.describe("Deletes range")
		.action()
		.register((_setter, range) => {});
}
