import { IDiscoveryPayload } from "../../../../core";


// Component
export interface IDiscoveryPayloadRecordsViewComponent {
    _activateModel(indexOrID: number|string): void 
}



// Record
export interface IDiscoveryPayloadRecord {
    id: string,
    discovery: IDiscoveryPayload
}