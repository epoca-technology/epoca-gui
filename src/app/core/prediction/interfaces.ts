// Import component required interfaces
import { IPrediction, IPredictionResultName } from "../epoch-builder";






// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    resultImagePaths: {[result: string]: string},
    
    // Prediction Records
    listPredictions(
      epochID: string,
      startAt: number,
      endAt: number
    ): Promise<IPrediction[]>,

    // Prediction Candlesticks
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
}



