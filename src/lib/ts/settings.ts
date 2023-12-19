import {type Key, Keymap, Keybind, type PluginPath} from "ragnarok-api";
import {Plugins} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {createDir, exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {type Writable, writable} from "svelte/store";

export interface Setting {
    plugins: Array<PluginPath>;
    keyOverrides: Record<string, Array<Key>>;
    showHiddenFiles: boolean;
}

export namespace Settings {

    let settingsPath: string | undefined = undefined;
    let configDir: string | undefined = undefined;
    
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
            .callBack((_) => console.log("Forward")));
        
        return keymap;
    }
    
    export async function loadSettings() {
        
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

        const settings: Setting = JSON.parse(await readTextFile(settingsPath));

        for (const plugin of settings.plugins) {
            if (!plugin.enabled) continue;
            await Plugins.loadPlugin(plugin);
        }
        
        const keymap = createDefaultKeymap();
        await Plugins.registerKeymap(keymap);
        
        for (const [id, overrides] of Object.entries(settings.keyOverrides)) {
            if (overrides.length === 0) continue;
            if (!id) continue;
            
            const keybind = keymap.getById(id);
            
            if (keybind) {
                keybind.setTrigger(overrides[0]);
                keybind.setSequence(overrides.slice(1));
            }
        }
        
        ACTIVE_KEYMAP.set(keymap);
        ACTIVE_SETTINGS.set(settings);
    }
}