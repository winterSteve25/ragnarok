import {get, writable} from "svelte/store";
import {invoke} from "@tauri-apps/api";

export namespace LSP {

    export const LSPS_AVAILABLE = writable(new Map<string, string>());
    export const ACTIVE_LSPS = writable(new Map<string, string>());

    export async function startServer(fileExtension: string): Promise<any> {
        const map = get(LSPS_AVAILABLE);
        map.set("rs", "rust-analyzer");
        
        if (!map.has(fileExtension)) {
            return undefined;
        }

        return await invoke("start_ls", {
            language: fileExtension,
            lspBin: map.get(fileExtension),
            args: [],
            env: {},
        });
    }
}