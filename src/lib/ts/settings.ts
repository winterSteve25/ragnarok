import type {Key} from "ragnarok-api";
import {Plugins, type PluginState} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";

export interface Setting {
    plugins: Array<PluginState>;
    keyOverrides: Record<string, Array<Key>>;
    showHiddenFiles: boolean;
}

export namespace Settings {
    
    let settingsPath: string | undefined = undefined;
    
    export async function loadSettings() {
        if (!settingsPath) {
            settingsPath = (await appConfigDir()) + "settings.json";
        }
        
        if (!(await exists(settingsPath))) {
            await writeTextFile(settingsPath, JSON.stringify({} as Setting));
            return;
        }
        
        const settings: Setting = JSON.parse(await readTextFile(settingsPath));
        
        for (const plugin of settings.plugins) {
            if (!plugin.enabled) continue;
            await Plugins.downloadOrLoadPlugin(plugin.path);
        }
    }
}