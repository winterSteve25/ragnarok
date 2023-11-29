import gruvboxTheme from "../themes/gruvbox.json";
import {appConfigDir} from "@tauri-apps/api/path";
import {createDir, exists, readDir, readTextFile} from "@tauri-apps/api/fs";
import {get} from "svelte/store";
import type {File} from "./backend.ts";
import {Settings} from "./settings";

export namespace Theming {
    export interface Theme {
        editor: EditorSettings,
        code: CodeSettings,
        icons: Record<string, string>;
    }

    export interface EditorSettings {
        background: string,
        foreground: string,
        foregroundSecondary: string,
    }

    export interface CodeSettings {
        background: string,
        comments: string,
        symbols: string,
        numbers: string,
        strings: string,
        identifiers: string,
        keywords: string,
        errors: string,
    }

    let loadedThemes: { [name: string]: string | Theme } = {};

    export async function loadTheme(name: string): Promise<Theme | undefined> {
        if (!(name in loadedThemes)) {
            return undefined;
        }

        const themeOrPath = loadedThemes[name];

        if (themeOrPath as Theme) {
            return themeOrPath as Theme;
        }

        let content = await readTextFile(themeOrPath as string);
        return JSON.parse(content) as Theme;
    }

    export async function loadThemes() {
        loadedThemes = {};
        const configDir = await appConfigDir();

        if (!(await exists(configDir))) {
            await createDir(configDir);
        }

        const dir = configDir + "themes";

        if (!(await exists(dir))) {
            await createDir(dir);
            return;
        }

        const themes = await readDir(dir);
        themes.forEach((fe) => {
            loadedThemes[fe.name!.replace(/\.[^/.]+$/, "")] = fe.path;
        });

        loadedThemes["Gruvbox"] = gruvboxTheme;
    }

    export function getIconFromLoadedTheme(file: File): string {
        const icons = get(Settings.LOADED_THEME).icons;

        for (const regexKey in icons) {
            if (regexKey === "FILE" && file.filetype == "File") {
                return icons[regexKey];
            }

            if (regexKey === "DIR" && file.filetype == "Directory") {
                return icons[regexKey];
            }

            try {
                let regex = new RegExp(regexKey);
                if (regex.test(file.filename)) {
                    return icons[regexKey];
                }
            } catch {
                if (regexKey === "*") {
                    return icons[regexKey];
                }
            }
        }

        return "";
    }
}