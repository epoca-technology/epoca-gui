


export interface IClassificationTrainingService {
    init(event: any|string, limit: number): Promise<void>
}







export interface IEvaluation {
    loss: number,
    accuracy: number
}




export interface IMetadataItem {
    index: number,
    id: string,
    value: number
}


