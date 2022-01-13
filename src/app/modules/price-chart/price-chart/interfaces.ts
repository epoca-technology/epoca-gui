export interface IPriceChartComponent {
    refresh(): void,
    updateConfig(): void 
}




// Config
export interface IPriceChartConfig {
    start: number,
    end: number,
    intervalMinutes: number
}