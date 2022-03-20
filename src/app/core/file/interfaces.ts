



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<IDownloadedFile[]>,
    getDatabaseBackupDownloadURL(backupName: string): Promise<string>,

    // Forecast Models
    // @TODO

    // Candlestick Spreadsheets
    listCandlestickSpreadsheets(): Promise<IDownloadedFile[]>,
    getCandlestickSpreadsheetDownloadURL(fileName: string): Promise<string>,
}



export interface IPath {
    dbBackups: string,
    forecastModels: string,
    candlestickSpreadsheets: string
}




export interface IDownloadedFile {
    name: string,
    size: number,
    creation: number
}