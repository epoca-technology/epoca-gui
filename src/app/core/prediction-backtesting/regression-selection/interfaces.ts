import { IModel } from "../../prediction";



export interface IRegressionSelectionService {
    init(event: any|string): Promise<void>,
    getModelFromCombinationIDAndIndex(combinationIndex: number, modelIndex: number): IModel
}