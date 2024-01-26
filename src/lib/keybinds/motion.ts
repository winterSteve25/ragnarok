import type {Keymap} from "ragnarok-api";
import { KeybindHelper } from "./helper";

export function registerMotionKeys(keymap: Keymap) {
	keymap.create("motion.right", "l")
		.describe("Moves right")
		.motion()
		.register((ctx, data) => KeybindHelper.moveCursorRight(ctx, data.motionMultiplier));

	keymap.create("motion.left", "h")
		.describe("Moves left")
		.motion()
		.register((ctx, data) => KeybindHelper.moveCursorLeft(ctx, data.motionMultiplier));

	keymap.create("motion.up", "k")
		.describe("Moves up")
		.motion()
		.register((ctx, data) => KeybindHelper.moveCursorUp(ctx, data.motionMultiplier));

	keymap.create("motion.down", "j")
		.describe("Moves down")
		.motion()
		.register((ctx, data) => KeybindHelper.moveCursorDown(ctx, data.motionMultiplier));
} 
