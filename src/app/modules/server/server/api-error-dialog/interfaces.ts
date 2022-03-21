export interface IApiErrorDialogComponent {
    blacklistIP(ip: string): void,
    downloadError(): void,
    close(): void
}