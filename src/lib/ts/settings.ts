import {type Key, Keymap, Keybind} from "ragnarok-api";
import {Plugins, type PluginState} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {type Writable, writable} from "svelte/store";

export interface Setting {
    plugins: Array<PluginState>;
    keyOverrides: Record<string, Array<Key>>;
    showHiddenFiles: boolean;
}

export namespace Settings {

    let settingsPath: string | undefined = undefined;
    const DEFAULT_SETTINGS: Setting = {
        plugins: [],
        keyOverrides: {},
        showHiddenFiles: false,
    };
    
    export const ACTIVE_KEYMAP: Writable<Keymap> = writable();
    export const ACTIVE_SETTINGS: Writable<Setting> = writable();
    
    function createDefaultKeymap() {
        const keymap = new Keymap();
        
        keymap.register("motion.word", Keybind.by("Word Motion", "w")
            .callBack((captures) => console.log("Forward")));
        
        return keymap;
    }

    export async function loadSettings(): Promise<Error | undefined> {
        if (!settingsPath) {
            settingsPath = (await appConfigDir()) + "settings.json";
        }

        if (!(await exists(settingsPath))) {
            await writeTextFile(settingsPath, JSON.stringify(DEFAULT_SETTINGS));
            return;
        }

        const settings: Setting = JSON.parse(await readTextFile(settingsPath));

        for (const plugin of settings.plugins) {
            if (!plugin.enabled) continue;
            
            const err = await Plugins.loadPlugin(plugin.path);
            if (err) {
                return err;
            }
        }
        
        const keymap = createDefaultKeymap();
        const err = await Plugins.registerKeymap(keymap);
        
        if (err) {
            return err;
        }
        
        for (const [id, overrides] of Object.entries(settings.keyOverrides)) {
            if (overrides.length === 0) continue;
            if (!id) continue;
            
            const keybind = keymap.map.get(id);
            
            if (keybind) {
                keybind.trigger = overrides[0];
                keybind.sequence = overrides.slice(1);
            }
        }
        
        ACTIVE_KEYMAP.set(keymap);
        ACTIVE_SETTINGS.set(settings);
    }
}