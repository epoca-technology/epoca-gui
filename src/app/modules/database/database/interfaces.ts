import { IDownloadedFile } from "../../../core";



export interface IDatabaseComponent {
    listBackupFiles(): Promise<void>,
    downloadBackup(name: string): void
}




export interface IDownloadedBackupFile extends IDownloadedFile {
    creation: number
}