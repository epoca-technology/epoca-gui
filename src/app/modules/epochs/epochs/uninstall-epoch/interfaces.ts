


export interface IUninstallEpochComponent {
    uninstall(): void,
    refreshTaskState(): Promise<void>,
    close(): void
}