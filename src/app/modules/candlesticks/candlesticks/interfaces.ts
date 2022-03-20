export interface ICandlesticksComponent {
    refresh(): void,
    updateConfig(): void,
    displaySpreadsheets(): void
}




// Config
export interface ICandlesticksConfig {
    start: number,
    end: number,
    intervalMinutes: number
}