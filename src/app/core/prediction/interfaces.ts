// Import component required interfaces
import { IPrediction, IPredictionResultIcon, IPredictionResultName } from "../epoch-builder";






// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    resultIconNames: {[result: string]: IPredictionResultIcon},
    resultImagePaths: {[result: string]: string},
    
    // Retrievers
    //getActive(): Promise<IPrediction|undefined>,
    listPredictions(
      epochID: string,
      startAt: number,
      endAt: number
    ): Promise<IPrediction[]>,
    listPredictionCandlesticks(
      epochID: string,
      startAt: number,
      endAt: number
     ): Promise<IPredictionCandlestick[]>
}










// Prediction Candlestick Record
export interface IPredictionCandlestick {
  ot: number,                 // Open Time
  ct: number,                 // Close Time
  o: number,                  // Open Sum
  h: number,                  // High Sum
  l: number,                  // Low Sum
  c: number,                  // Close Sum
  sm: number                  // Sum Mean
}
