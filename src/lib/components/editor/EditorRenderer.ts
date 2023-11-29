import {Backend, type File} from "../../ts/backend";
import * as PIXI from "pixi.js";

export class EditorRenderer {

    private fileContent: string;
    private application: PIXI.Application;
    
    public constructor(private parent: HTMLElement, private file: File | undefined) {
        const bgColor = window.getComputedStyle(parent).getPropertyValue("--code-background");
        
        this.fileContent = "";
        this.application = new PIXI.Application({
            resizeTo: parent,
            background: bgColor,
        });
        
        // @ts-ignore
        parent.appendChild(this.application.view);
    }
    
    public render() {
    }
    
    private isMediaFile(): boolean {
        const fileName = this.file?.filename;
        
        if (!fileName) {
            return false;
        }

        const mediaExtensions = ['mp3', 'mp4', 'avi', 'mov', 'wmv', 'wav', 'flac', 'mkv', 'ogg', 'webm', 'aac'];
        const fileExtension = fileName.split('.').pop()!.toLowerCase();
        return mediaExtensions.includes(fileExtension);
    }

    private moveCursor(line: number, column: number) {
    }

    public onKeyDown(event: KeyboardEvent) {
        console.log(event);
    }

    private async openTextFile(file: File) {
        this.fileContent = await Backend.openTextFile(file);
    }
}