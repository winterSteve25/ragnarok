import {invoke} from "@tauri-apps/api";
import type {File} from "ragnarok-api";
import type {PieceTreeBase} from "vscode-piece-tree";

export namespace FileHelper {
    export async function getFilesInPath(path: string): Promise<File[]> {
        let result: string[] = await invoke("get_files_in_path", {path: path});
        return result.map((e: any) => e as File);
    }
    
    export async function openTextFile(file: File): Promise<string> {
        return await invoke("open_text_file", {path: file.filepath});
    }

    export async function writeTextFile(file: File, content: PieceTreeBase): Promise<void> {
        return await invoke("write_file", {path: file.filepath, buffer: content.getLinesRawContent()})
    }
    
    export function getFileExtension(file: File): string {
        return file.filename.split(".").pop()!;
    }
}