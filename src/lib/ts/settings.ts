import {type Key, Keymap, Keybind, type PluginPath, Command} from "ragnarok-api";
import {Plugins} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {createDir, exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {type Writable, writable} from "svelte/store";
import {Modals} from "./modals";

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

        keymap.register("motion.word", Keybind.by("Word Motion", "w")
            .callBack((_) => console.log("Forward")));

        keymap.register("open.command-palette", Keybind.by("Open Command Palette", {
            key: ":",
            modifier: new Set(["Shift"])
        }).callBack((_) => Modals.openCommandPalette()));

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
                keybind.setTrigger(overrides[0]);
                keybind.setSequence(overrides.slice(1));
            }
        }
        
        const commands = createDefaultCommandMap();
        commands.concat(await Plugins.registerCommands());
        
        loadedCommands = commands;
        activeKeymap = keymap;
        ACTIVE_SETTINGS.set(settings);
    }
}