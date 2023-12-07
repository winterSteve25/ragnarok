import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";
import {sveltePreprocess} from "svelte-preprocess/dist/autoProcess";
import dynamicImport from "vite-plugin-dynamic-import";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [
        svelte({
            preprocess: sveltePreprocess({
                scss: {
                    prependData: "@import 'src/lib.scss';"
                }
            })
        }),
        dynamicImport({
            
        }),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
    }
}));
