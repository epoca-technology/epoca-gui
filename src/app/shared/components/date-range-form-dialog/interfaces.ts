

export interface IDateRangeFormDialogComponent {
    submitConfig(): void,
    cancel(): void
}



export interface IDateRangeConfig {
    startAt: number,
    endAt: number
}