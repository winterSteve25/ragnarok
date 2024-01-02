import {get, writable} from "svelte/store";
import {invoke} from "@tauri-apps/api";

export namespace LSP {
    
    const LSPS_AVAILABLE = writable(new Map<string, string>());
    
    export async function startServer(lang: string) {
        const map = get(LSPS_AVAILABLE);
        map.set("js", "rust-analyzer");
        
        if (!map.has(lang)) {
            return;
        }
        
        await invoke("start_ls", { 
            language: lang,
            lspBin: map.get(lang),
            args: [],
            env: {},
        });
    }
}