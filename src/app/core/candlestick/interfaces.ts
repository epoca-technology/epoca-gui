import { IBackgroundTaskInfo } from "../background-task";



export interface ICandlestickService {
    // Properties
    predictionCandlestickInterval: number,

    // Candlesticks General Endpoints
    getForPeriod(start: number, end: number, intervalMinutes?: number): Promise<ICandlestick[]>,

    // Prediction Candlesticks File Endpoints
    getPredictionFileTask(): Promise<IBackgroundTaskInfo>,
    generatePredictionCandlesticksFile(otp: string): Promise<IBackgroundTaskInfo>,

    // Candlesticks Bundle File Endpoints
    getBundleFileTask(): Promise<IBackgroundTaskInfo>,
    generateCandlesticksBundleFile(otp: string): Promise<IBackgroundTaskInfo>
}





// Candlestick Record
export interface ICandlestick {
    ot: number,                 // Open Time
    ct: number,                 // Close Time
    o: number,                  // Open Price
    h: number,                  // High Price
    l: number,                  // Low Price
    c: number,                  // Close Price
    v: number,                  // Volume (USDT)
}