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
    let loadedPlugins: Array<RagnarokPlugin> = [];
    
    export async function loadPlugin(plugin: PluginPath): Promise<Error | undefined> {
        if (plugin.path) {
            if (plugin.path.endsWith("main.js")) {
                return await loadCompiledPlugin(plugin.path);
            } else if (plugin.path.endsWith("/")) {
                return await loadCompiledPlugin(plugin.path + "dist/main.js");
            } else {
                return await loadCompiledPlugin(plugin.path + "/dist/main.js");
            }
        } else if (plugin.git) {
            const err = await downloadPlugin(plugin.git, plugin.branch);
            if (err) {
                return err;
            }

            const [user, repo] = plugin.git.split("/");
            return await loadCompiledPlugin(await getCompiledPluginDirectory(`${user}.${repo}`));
        }
        
        return new Error("Invalid plugin path, no git or path specified");
    }
    
    async function loadCompiledPlugin(path: string): Promise<Error | undefined> {
        const pluginSource = await readTextFile(/*@vite-ignore*/path);
        const plugin = eval(pluginSource);
        const instance = new plugin.default();
        
        if (!(instance satisfies RagnarokPlugin)) {
            return new Error("Export must be an instance of a RagnarokPlugin");
        }
        
        await instance.onLoad();
        loadedPlugins.push(instance);
        
        return undefined;
    }
    
    async function getCompiledPluginDirectory(name: string) {
        if (!pluginsDir) {
            pluginsDir = await appLocalDataDir() + "plugins";
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
    
    async function downloadPlugin(gitPath: string, branch?: string): Promise<Error | undefined> {
        const [user, repo] = gitPath.split("/");
        let response;

        if (branch) {
            response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js?ref=${branch}`);
        } else {
            response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js`);
        }

        if (!response.ok) {
            return new Error(`Failed to fetch bundled version of the ${user}/${repo} at dist/main.js`);
        }

        // @ts-ignore
        const pluginData = response.data!["content"] as string;
        await writeTextFile(await getCompiledPluginDirectory(`${user}.${repo}`), pluginData);
    }
}