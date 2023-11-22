import {invoke} from "@tauri-apps/api";

export namespace Backend {
    export async function getFilesInPath(path: string): Promise<File[]> {
        let result: string[] = await invoke("get_files_in_path", {path: path});
        return result.map((e: any) => new File(e));
    }
}

export class File {
    public filename: string;
    public filepath: string;
    public filetype: "File" | "Directory" | "Symlink" | "Unknown";

    public constructor(json: any) {
        this.filename = json.filename;
        this.filepath = json.filepath;
        this.filetype = json.filetype;
    }
}
