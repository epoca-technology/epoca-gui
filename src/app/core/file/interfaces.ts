



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<string[]>,
    downloadDatabaseBackup(backupName: string): Promise<string>,

    // Forecast Models
}



export interface IPath {
    dbBackups: string,
    forecastModels: string
}