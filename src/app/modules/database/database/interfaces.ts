export interface IDatabaseComponent {
    listBackupFiles(): Promise<void>,
    downloadBackup(name: string): void
}



