



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<string[]>,
    getDatabaseBackupFileSize(name: string): Promise<number>,
    downloadDatabaseBackup(backupName: string): Promise<string>,

    // Forecast Models
}



export interface IPath {
    dbBackups: string,
    forecastModels: string
}