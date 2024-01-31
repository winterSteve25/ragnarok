import type {Keymap} from "ragnarok-api";
import {Modals} from "../ts/modals";
import {KeybindHelper} from "./helper";

export function registerGlobalKeys(keymap: Keymap) {
    keymap.create("open.cmd_palette", ":")
        .describe("Opens the command palette")
        .register([false, (_setter, _data) => Modals.openCommandPalette()]);

    keymap.create("edit.insert_mode.before", "i")
        .describe("Enter insert mode by putting the cursor on the last character")
        .register([true, (setter, _data) => {
            setter((ctx) => {
                ctx.insertMode = true;
            });
        }]);

    keymap.create("edit.insert_mode.after", "a")
        .describe("Enter insert mode by putting cursor on the next character")
        .register([true, (setter, _data) => {
            setter((ctx) => {
                ctx.insertMode = true;
                ctx.cursorPosition += 1;
            });
        }]);

    keymap.create("edit.insert_mode.end", "A")
        .register([true, (setter, _data) => {
            setter((ctx) => {
                ctx.insertMode = true;
                ctx.cursorPosition = KeybindHelper.lastOnLine(ctx, ctx.cursorLine);
            })
        }])

    keymap.create("edit.insert_mode.start", "I")
        .register([true, (setter, _data) => setter((ctx) => {
            ctx.insertMode = true;
            ctx.cursorPosition = KeybindHelper.firstOnLine(ctx, ctx.cursorLine);
        })])

    keymap.create("edit.insert_mode.down", "o")
        .register([true, (setter, _data) => setter((ctx) => {
            ctx.insertMode = true;
        })])

    keymap.create("edit.cancel", "Escape")
        .register([true, (setter, _data) => {
            setter((ctx) => {
                if (ctx.insertMode) {
                    ctx.insertMode = false;
                }

                if (KeybindHelper.isCursorBeyondLineEnd(ctx, ctx.cursorLine)) {
                    ctx.cursorPosition = KeybindHelper.lastOnLine(ctx, ctx.cursorLine);
                }
            });
        }]);
    
    keymap.create("test", "g")
        .then("d")
        .register([true, (_, _a) => console.log("HALLO")])
}
