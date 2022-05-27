


export interface IClassificationTrainingService {
    init(event: any|string): Promise<void>
}







export interface IEvaluation {
    loss: number,
    accuracy: number
}