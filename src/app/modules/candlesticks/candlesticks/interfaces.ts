export interface ICandlesticksComponent {
    refresh(): void,
    updateConfig(): void 
}




// Config
export interface ICandlesticksConfig {
    start: number,
    end: number,
    intervalMinutes: number
}