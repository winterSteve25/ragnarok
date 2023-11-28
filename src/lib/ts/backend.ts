import {invoke} from "@tauri-apps/api";

export namespace Backend {
    export async function getFilesInPath(path: string): Promise<File[]> {
        let result: string[] = await invoke("get_files_in_path", {path: path});
        return result.map((e: any) => e as File);
    }
    
    export async function openTextFile(path: string): Promise<string> {
        return await invoke("open_text_file", {path: path});
    }
}

export interface File {
    hidden: boolean;
    filename: string;
    filepath: string;
    filetype: "File" | "Directory" | "Symlink" | "Unknown";
}
