import { ILiquidityPriceLevel } from "../../../../../core";



export interface ILiquidityDialogComponent {
    displayTooltip(): void,
    close(): void
}




/**
 * Liquidity Intensity
 * The intensity of the liquidity within a price level.
 */
export type ILiquidityIntensity = 0|1|2|3|4;





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




/**
 * Liquidity Intensity Requirements
 * For a price level to have intensity, it needs to be greater than or equals than
 * the requirements. Otherwise, the intensity will be 0.
 */
export interface ILiquidityIntensityRequirements {
    meanLow: number,
    mean: number,
    meanMedium: number,
    meanHigh: number
}





/**
 * Extended Price Level
 * The extended object is formed, adding the intensity of the liquidity.
 */
export interface ILiquidityExtendedIPriceLevel extends ILiquidityPriceLevel {
    li: ILiquidityIntensity
}