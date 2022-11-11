import { IBackgroundTaskInfo } from "../background-task"
import { 
    IEpochConfig, 
    IPredictionModelConfig, 
    IPredictionModelCertificate, 
    IRegressionTrainingCertificate
} from "../epoch-builder"



// Service
export interface IEpochService {
    // Epoch Retriever Endpoints
    getEpochRecord(epochID: string): Promise<IEpochRecord|undefined>,
    listEpochs(startAt: number, limit: number): Promise<IEpochListItem[]>,

    // Epoch Install Endpoints
    install(epochID: string, otp: string): Promise<IBackgroundTaskInfo>,
    getInstallTask(): Promise<IBackgroundTaskInfo>,
    uninstall(otp: string): Promise<IBackgroundTaskInfo>,
    getUninstallTask(): Promise<IBackgroundTaskInfo>,

    // Certificate Retriever Endpoints
    getPredictionModelCertificate(id: string): Promise<IPredictionModelCertificate>
    getRegressionCertificate(id: string): Promise<IRegressionTrainingCertificate>
}






/**
 * Epoch Record
 * The record that wraps the epoch's configuration that comes directly
 * from the Epoch Builder.
 */
 export interface IEpochRecord {
    // The identifier of the epoch
    id: string,

    // The date in which the epoch was installed
    installed: number,

    // The full configuration of the epoch
    config: IEpochConfig,

    // The configuration of the prediction model being exposed
    model: IPredictionModelConfig,

    /**
     * The date in which the epoch was uninstalled. If this value is not set,
     * it means the epoch is still active.
     */
    uninstalled?: number
}






/**
 * Epoch List Item
 * All the epochs can be visualized simultaneously in a list containing a very
 * brief summary.
 */
export interface IEpochListItem {
    // The identifier of the Epoch
    id: string,

    // The date in which was installed
    installed: number,

    // The date in which it was uninstalled
    uninstalled: number|undefined
}