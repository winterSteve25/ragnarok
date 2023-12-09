import {appConfigDir} from "@tauri-apps/api/path";

export namespace Plugins {
    export async function load() {
        const configDir = await appConfigDir();
        const plug = (configDir + "plugin");
    }
}