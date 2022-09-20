import { IDiscovery } from "../../../../core";


// Component
export interface IMultiDiscoveryViewComponent {
    _activateModel(indexOrID: number|string): void 
}



// Record
export interface IDiscoveryRecord {
    id: string,
    discovery: IDiscovery
}