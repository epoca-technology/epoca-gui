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





/**
 * Prediction State
 * The state of the prediction stands for the trend being followed by the
 * last 5 hours worth of candlesticks. The states are the following:
 * 1) Flat: there isn't a clear trend being followed and is represented by a 0.
 * 2) Up: there is an increase trend and is be represented by an int from 1 to 11.
 * 3) Down: there is a decrease trend and is be represented by an int from -1 to -11.
 * The number represents the number of candlesticks backing the trend. The higher, 
 * the more intense.
 */
 export type IPredictionState = 11|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10|-11;