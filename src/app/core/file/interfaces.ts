



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<IDownloadedFile[]>,
    getDatabaseBackupDownloadURL(backupName: string): Promise<string>,

    // Candlestick Spreadsheets
    listCandlestickSpreadsheets(): Promise<IDownloadedFile[]>,
    getCandlestickSpreadsheetDownloadURL(fileName: string): Promise<string>,

    // File Input Reader
    readJSONFiles(event: any): Promise<any[]>
}



// The path in which each element lives in Firebase Storage
export interface IPath {
    dbBackups: string,
    candlestickSpreadsheets: string
}



// A File Downloaded straight from Firebase Storage
export interface IDownloadedFile {
    name: string,
    size: number,
    creation: number
}