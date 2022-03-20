export interface ICandlestickSpreadsheetsDialogComponent {
    downloadFiles(): Promise<void>,
    copyDownloadLink(fileName: string): Promise<void>,
    downloadFile(fileName: string): Promise<void>,
    close(): void
}