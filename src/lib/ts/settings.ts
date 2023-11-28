import {get, type Readable, readable, writable, type Writable} from "svelte/store";
import {appConfigDir} from "@tauri-apps/api/path";
import {exists, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {Theming} from "./theme";

export namespace Settings {
    export let SETTINGS: Readable<Settings>;
    export const LOADED_THEME: Writable<Theming.Theme> = writable();
    
    const DEFAULT_SETTINGS: Settings = {
        theme: "Gruvbox",
        showHiddenFiles: false,
    }
    
    export interface Settings {
        theme: string,
        showHiddenFiles: boolean,
    }
    
    export async function load() {
        let path = (await appConfigDir()) + "settings.json";
        
        if (!(await exists(path))) {
            await writeTextFile(path, JSON.stringify(DEFAULT_SETTINGS));
            SETTINGS = readable(DEFAULT_SETTINGS);
            return;
        }
        
        let content = await readTextFile(path);
        let settings = JSON.parse(content) as Settings;
        SETTINGS = readable(settings);
        
        await loadTheme();
    }
    
    async function loadTheme() {
        let theme = await Theming.loadTheme(get(SETTINGS).theme);
        
        if (!theme) {
            throw new Error("Failed to load theme: " + get(SETTINGS).theme);
        }
        
        LOADED_THEME.set(theme);
        const root = document.documentElement;
        const editor = theme.editor;
        const code = theme.code;
        
        root.style.setProperty("--editor-foreground", editor.foreground);
        root.style.setProperty("--editor-foreground-secondary", editor.foregroundSecondary);
        root.style.setProperty("--editor-background", editor.background);

        root.style.setProperty("--code-background", code.background);
        root.style.setProperty("--code-comments", code.comments);
        root.style.setProperty("--code-symbols", code.symbols);
        root.style.setProperty("--code-numbers", code.numbers);
        root.style.setProperty("--code-strings", code.strings);
        root.style.setProperty("--code-identifiers", code.identifiers);
        root.style.setProperty("--code-keywords", code.keywords);
        root.style.setProperty("--code-errors", code.errors);
    }
}