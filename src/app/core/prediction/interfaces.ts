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
      endAt: number,
      limit: number
    ): Promise<IPrediction[]>
}











