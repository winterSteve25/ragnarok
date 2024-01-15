import {type Key, Keymap, type PluginPath, Command, keyToString} from "ragnarok-api";
import {Plugins} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {createDir, exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {type Writable, writable} from "svelte/store";
import { Modals } from "./modals";

export interface Setting {
    plugins: Array<PluginPath>;
    keyOverrides: Record<string, Array<Key>>;
    showHiddenFiles: boolean;
}

export namespace Settings {

    export const ACTIVE_SETTINGS: Writable<Setting> = writable();
    export let activeKeymap: Keymap;
    export let loadedCommands: Command[];

    let settingsPath: string | undefined = undefined;
    let configDir: string | undefined = undefined;

    const DEFAULT_SETTINGS: Setting = {
        plugins: [],
        keyOverrides: {},
        showHiddenFiles: false,
    } satisfies Setting;

    function createDefaultKeymap() {
        const keymap = new Keymap();

        keymap.create("motion.word", "w")
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

		keymap.create("open.cmd_palette", ":")
			.describe("Opens the command palette")
			.register((_setter, _data) => Modals.openCommandPalette());

        return keymap;
    }
    
    function createDefaultCommandMap() {
        return [
            Command.create("q", () => {}).describe("Quits the current buffer"),
        ];
    }

    export async function loadSettings() {

        {
            if (!configDir) {
                configDir = await appConfigDir();
            }

            if (!(await exists(configDir))) {
                await createDir(configDir);
            }

            if (!settingsPath) {
                settingsPath = (configDir) + "settings.json";
            }

            if (!(await exists(settingsPath))) {
                await writeTextFile(settingsPath, JSON.stringify(DEFAULT_SETTINGS));
            }
        }

        const settings: Setting = JSON.parse(await readTextFile(settingsPath));

        for (const plugin of settings.plugins) {
            if (!plugin.enabled) continue;
            await Plugins.loadPlugin(plugin);
        }

        const keymap = createDefaultKeymap();
        await Plugins.registerKeybinds(keymap);

        for (const [id, overrides] of Object.entries(settings.keyOverrides)) {
            if (overrides.length === 0) continue;
            if (!id) continue;

            const keybind = keymap.getById(id);

            if (keybind) {
                keybind.trigger = keyToString(overrides[0]);
                keybind.sequence = overrides.slice(1).map((e) => keyToString(e));
            }
        }
        
        const commands = createDefaultCommandMap();
        commands.concat(await Plugins.registerCommands());
        
        loadedCommands = commands;
        activeKeymap = keymap;
        ACTIVE_SETTINGS.set(settings);
    }
}
