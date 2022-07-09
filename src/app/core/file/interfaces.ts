



export interface IFileService {
    // Database Backups
    listDatabaseBackups(): Promise<IDownloadedFile[]>,
    getDatabaseBackupDownloadURL(backupName: string): Promise<string>,

    // Prediction Candlestick Files
    listPredictionCandlestickFiles(): Promise<IDownloadedFile[]>,
    getPredictionCandlestickDownloadURL(fileName: string): Promise<string>,

    // Candlestick Bundle Files
    listCandlestickBundleFiles(): Promise<IDownloadedFile[]>,
    getCandlestickBundleDownloadURL(fileName: string): Promise<string>,

    // File Input Reader
    readJSONFiles(event: any): Promise<any[]>
}



// The path in which each element lives in Firebase Storage
export interface IPath {
    dbBackups: string,
    predictionCandlesticks: string,
    candlestickBundles: string,
}



// A File Downloaded straight from Firebase Storage
export interface IDownloadedFile {
    name: string,
    size: number,
    creation: number
}