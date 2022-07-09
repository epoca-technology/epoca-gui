



export interface ICandlestickFilesDialogComponent {
    downloadFiles(): Promise<void>,
    populateTask(prediction: boolean): Promise<void>,
    populateFiles(prediction: boolean): Promise<void>,
    copyDownloadLink(fileName: string, prediction: boolean): Promise<void>,
    downloadFile(fileName: string, prediction: boolean): Promise<void>,
    generateFile(prediction: boolean): void,
    close(): void
}