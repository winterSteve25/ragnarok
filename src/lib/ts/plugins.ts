import {appLocalDataDir} from "@tauri-apps/api/path";
import {createDir, exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import type {RagnarokPlugin, PluginPath} from "ragnarok-api";
import {fetch} from "@tauri-apps/api/http";

export interface PluginState {
    path: PluginPath;
    enabled: boolean;
}

export namespace Plugins {
    let pluginsDir: string | undefined = undefined;
    let pluginsLockDir: string | undefined = undefined;
    
    export async function downloadOrLoadPlugin(plugin: PluginPath): Promise<Error | undefined> {
        return undefined;
    }
    
    async function loadCompiledPlugin(name: string): Promise<Error | undefined> {
        const pluginSource = await readTextFile(/*@vite-ignore*/await getCompiledPluginDirectory(name));
        const plugin = eval(pluginSource);
        const instance = new plugin.default();
        
        if (!(instance satisfies RagnarokPlugin)) {
            return new Error("Export must be an instance of a RagnarokPlugin");
        }
        
        await instance.onLoad();
        return undefined;
    }
    
    async function getCompiledPluginDirectory(name: string) {
        if (!pluginsDir) {
            pluginsDir = await appLocalDataDir();
            pluginsLockDir = pluginsDir + "plugins.lock.json";
            
            if (!(await exists(pluginsDir))) {
                await createDir(pluginsDir);
            }
            
            if (!(await exists(pluginsLockDir))) {
                await writeTextFile(pluginsLockDir, "{}");
            }
        }

        return `${pluginsDir}plugins/${name}/main.js`;
    }
    
    export async function downloadPlugin(plugin: PluginPath): Promise<Error | undefined> {
        if (plugin.git) {
            const [user, repo] = plugin.git.split("/");
            let response;
            
            if (plugin.branch) {
                response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js?ref=${plugin.branch}`);
            } else {
                response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js`);
            }
            
            if (!response.ok) {
                return new Error(`Failed to fetch bundled version of the ${user}/${repo} at dist/main.js`);
            }
            
            // @ts-ignore
            const pluginData = response.data!["content"] as string;
            await writeTextFile(await getCompiledPluginDirectory(`${user}.${repo}`), pluginData);
        } else if (plugin.path) {
            // TODO
        }
    }
}