import { Observable } from "rxjs";



// Service
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

    // Epoch File
    uploadEpochFile(file: File, epochID: string): Observable<number|IUploadedFile>,
    deleteEpochFile(epochID: string): Promise<void>,

    // File Input
    getFile(
        event: any, 
        acceptedFormats: IFileFormat[], 
        maxSizeBytes: number, 
        touched?: boolean
    ): IFileInput,

    // General File Helpers
    getFileNameFromPath(fullPath: string, removeExtension?: boolean): string,

    // JSON File Input Reader
    readJSONFiles(event: any): Promise<any[]>
}



// The path in which each element lives in Firebase Storage
export interface IPath {
    dbBackups: string,
    predictionCandlesticks: string,
    candlestickBundles: string,
    epoch: string
}



// A File Downloaded straight from Firebase Storage
export interface IDownloadedFile {
    name: string,
    size: number,
    creation: number
}



// File extensions supported by the platform
export type IFileExtension = "zip"|"json";







/* File Upload Related */


// Allowed file formats
export type IFileFormat = "application/zip"|"application/json";



// The file input that aids the component's flow
export interface IFileInput {
	touched: boolean,
	file: File|null,
    acceptedFormats: IFileFormat[],
    maxSizeBytes: number,
    error: string|undefined // If present, there was a problem when inputting the file
}



// The uploaded file's payload
export interface IUploadedFile {
	name: string,
	url: string
}