


export interface ILiquidityDialogComponent {
    loadLiquidityData(): Promise<void>,
    displayInfoTooltip(): void,
    displayTooltip(): void,
    close(): void
}




/**
 * Intensity Level Counter
 * The counter object holding the number if price levels per
 * intensity.
 */
export interface ILiquidityIntensityLevelCounter {
    0: number,
    1: number,
    2: number,
    3: number,
    4: number,
}
