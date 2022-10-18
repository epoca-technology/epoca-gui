


export interface IInstallEpochComponent {
    fileChanged(event: any): void,
    refreshTaskState(): Promise<void>,
    close(): void
}