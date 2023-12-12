import type {Key} from "ragnarok-api";
import type {PluginState} from "./plugins";
import {appConfigDir} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/api/fs";

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
        
        const settings: Setting = JSON.parse(await readTextFile(settingsPath));
    }
}