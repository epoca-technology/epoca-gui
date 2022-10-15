import {BigNumber} from "bignumber.js";

export interface IUtilService {
    // Numbers
    alterNumberByPercentage(value: INumber, percent: INumber, config?: INumberConfig): INumber,
    calculatePercentageChange(oldNumber: INumber, newNumber: INumber, config?: INumberConfig): INumber,
    calculatePercentageOutOfTotal(value: INumber, total: INumber, config?: INumberConfig): INumber,
    outputNumber(value: INumber, config?: INumberConfig): INumber,
    getBigNumber(value: INumber): BigNumber,
    getMax(values: INumber[]): number,
    getMin(values: INumber[]): number,
    getSum(values: INumber[]): number,
    getMean(values: INumber[]): number,
    formatNumber(value: number, dp?: number): string,
    
    // Error Handling
    getCodeFromApiError(error: any): number,
    getErrorMessage(e: any): string,

    // Async Delay
    asyncDelay(seconds: number): Promise<void>,
}







/* Numbers */

// Number Format
export type INumber = number|string|BigNumber;



// Number Config
export interface INumberConfig {
    of?: INumberOutputFormat,    // Output Format: Defaults to 'n'
    dp?: number,                 // Decimal Places: Defaults to 2
    ru?: boolean,                // Round Up: Defaults to false
    rm?: BigNumber.RoundingMode  // Rounding Mode: It's inserted in the service
}
export type INumberOutputFormat = 'n'|'s'|'bn';