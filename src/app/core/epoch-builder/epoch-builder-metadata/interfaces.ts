


// Class
export interface IEpochBuilderMetadataService {
    update(mdKey: string, index: number, modelID: string, value: number): void,
    getMetadata(): any
}





// A metadata item that can indicate the highest or lowest value of anything
export interface IEpochBuilderMetadataItem {
    index: number,
    id: string,
    value: number
}



// A complete metadata object for a single key
export interface IEpochBuilderMetadata {
    highest: IEpochBuilderMetadataItem,
    lowest: IEpochBuilderMetadataItem
}




// The final metadata object that is given to the service managing the data.
export interface IEpochBuilderMetadataOutput {
    [mdKey: string]: IEpochBuilderMetadata
}