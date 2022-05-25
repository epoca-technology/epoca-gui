

export interface IClassificationTrainingService {
    init(event: any): Promise<void>
}







/* Service Specific Types */


export interface IDecompressedTrainingData {
    [featureOrLabel: string]: number
}