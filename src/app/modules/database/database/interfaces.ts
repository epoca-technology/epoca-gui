export interface IDatabaseComponent {
    listBackupFiles(): Promise<void>,
    downloadBackup(name: string): void
}





export interface IBackupFile {
    creation: number,
    name: string
}