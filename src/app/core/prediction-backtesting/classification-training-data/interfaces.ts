

export interface IClassificationTrainingDataService {
    init(event: any|string): Promise<void>
}







/* Service Specific Types */


export interface IDecompressedTrainingData {
    [featureOrLabel: string]: number
}