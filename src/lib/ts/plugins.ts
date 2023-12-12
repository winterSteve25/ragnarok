import {appLocalDataDir} from "@tauri-apps/api/path";
import {createDir, exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import type {RagnarokPlugin, PluginPath, Keymap} from "ragnarok-api";
import {fetch} from "@tauri-apps/api/http";
import {loadingPlugin} from "./stores";

export interface PluginState {
    path: PluginPath;
    enabled: boolean;
}

export namespace Plugins {
    let pluginsDir: string | undefined = undefined;
    let pluginsLockDir: string | undefined = undefined;

    const LOADED_PLUGINS: Map<string, RagnarokPlugin> = new Map<string, RagnarokPlugin>();

    export async function loadPlugin(plugin: PluginPath) {
        if (plugin.path) {
            loadingPlugin.set(plugin.path);

            if (plugin.path.endsWith("main.js")) {
                await loadCompiledPlugin(plugin.path, plugin.path);
            } else if (plugin.path.endsWith("/")) {
                await loadCompiledPlugin(plugin.path, plugin.path + "dist/main.js");
            } else {
                await loadCompiledPlugin(plugin.path, plugin.path + "/dist/main.js");
            }
            
            return;
        } else if (plugin.git) {
            loadingPlugin.set(plugin.git);

            await downloadPlugin(plugin.git, plugin.branch);

            const [user, repo] = plugin.git.split("/");
            const name = `${user}.${repo}`;

            await loadCompiledPlugin(name, await getCompiledPluginDirectory(name));
            return;
        }

        throw new Error("Invalid plugin path, no git or path specified");
    }

    export async function registerKeymap(keymap: Keymap) {
        for (const [_path, plugin] of LOADED_PLUGINS.entries()) {
            await plugin.registerKeybinds(keymap);
        }
    }

    async function loadCompiledPlugin(name: string, path: string) {
        const pluginSource = await readTextFile(/*@vite-ignore*/path);
        const plugin = eval(pluginSource);
        const instance = new plugin.default();

        if (!(instance satisfies RagnarokPlugin)) {
            throw new Error("Export must be an instance of a RagnarokPlugin");
        }

        try {
            await instance.onLoad();
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`An error occured when loading ${name}: ${err.message}`, {
                    cause: err
                });
            }

            throw new Error(`An error occured when loading ${name}: ${err}`);
        }

        LOADED_PLUGINS.set(path, instance);
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

    async function downloadPlugin(gitPath: string, branch?: string) {
        const [user, repo] = gitPath.split("/");
        let response;

        if (branch) {
            response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js?ref=${branch}`);
        } else {
            response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dist/main.js`);
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch bundled version of the ${user}/${repo} at dist/main.js`);
        }

        // @ts-ignore
        const pluginData = response.data!["content"] as string;
        await writeTextFile(await getCompiledPluginDirectory(`${user}.${repo}`), pluginData);
    }
}