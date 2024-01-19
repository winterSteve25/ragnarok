import type { Keymap } from "ragnarok-api";
import { Modals } from "../ts/modals";

export function registerActionKeys(keymap: Keymap) {
	keymap.create("open.cmd_palette", ":")
		.describe("Opens the command palette")
		.register((_setter, _data) => Modals.openCommandPalette());

	keymap.create("action.del", "d")
		.describe("Deletes range")
		.action()
		.register((_setter, range) => {
		});
}
