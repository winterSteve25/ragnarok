import {appConfigDir} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/api/fs";

export namespace Plugins {
    export async function load() {
        const configDir = await appConfigDir();
        const pluginSource = await readTextFile(/*@vite-ignore*/configDir + "plugin/main.js");
        const plugin = eval(pluginSource);
        const instance = new plugin.default();
        console.log(instance.test(10));
    }
}