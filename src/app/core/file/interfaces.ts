



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<IDownloadedFile[]>,
    getDatabaseBackupDownloadURL(backupName: string): Promise<string>,

    // Forecast Models
}



export interface IPath {
    dbBackups: string,
    forecastModels: string
}




export interface IDownloadedFile {
    name: string,
    size: number
}