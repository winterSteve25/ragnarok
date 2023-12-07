import {appConfigDir} from "@tauri-apps/api/path";

export namespace Plugins {
    export async function load() {
        let config = await appConfigDir();
        let plugin = await import(/* @vite-ignore */config + "plugin");
        const p = new plugin["default"];
        console.log(p);
    }
}