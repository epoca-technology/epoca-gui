import { IBackgroundTaskInfo } from "../background-task"
import { 
    IEpochConfig, 
    IPredictionModelConfig, 
    IPositionType, 
    IPredictionModelCertificate, 
    IRegressionTrainingCertificate
} from "../epoch-builder"



// Service
export interface IEpochService {
    // Epoch Retriever Endpoints
    getEpochRecord(epochID: string): Promise<IEpochRecord|undefined>,
    //getActiveEpochSummary(): Promise<IEpochSummary|undefined>,
    getEpochSummary(epochID: string): Promise<IEpochSummary>,
    listEpochs(startAt: number, limit: number): Promise<IEpochSummary>,

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
 * Epoch Metrics
 * Summary of the prediction model's performance by Epoch.
 */
export interface IEpochMetricsRecord {
    // The identifier of the epoch
    id: string,

    // The accumulated profits in all trading sessions
    profit: number,

    // The accumulated fees in all trading sessions
    fees: number,

    // The number of longs in all trading sessions
    longs: number,
    successful_longs: number,

    // The number of shorts in all trading sessions
    shorts: number,
    successful_shorts: number,

    // The accuracy in all trading sessions
    long_accuracy: number,
    short_accuracy: number,
    accuracy: number
}





/**
 * Epoch Positions
 * The list of positions executed in the epoch. These positions serve
 * as the metrics' payload.
 */
export interface IEpochPositionRecord {
    // The identifier of the epoch
    eid: string, // Epoch ID

    // The identifier of the trading session position
    pid: string, // Trading Session Position ID

    // The date range of the position
    ot: number, // Open Time
    ct: number, // Close Time

    // The type of position. 1 = long, -1 = short
    t: IPositionType,

    // The outcome of the position. True = Successful, False = Unsuccessful
    o: boolean,

    // The mean of the prices received when opening and closing the position
    opm: number, // Open Price Mean
    cpm: number, // Close Price Mean

    // The position's total fees
    f: number,

    // The position's net profit. In case it was unsuccessful, this value will be negative.
    p: number
}






/**
 * Epoch Summary
 * An object containing the configuration and the general performance of the Epoch.
 */
export interface IEpochSummary {
    // The Epoch Record
    record: IEpochRecord,

    // The Epoch Metrics Record
    metrics: IEpochMetricsRecord,

    // The list of Epoch Positions
    positions: IEpochPositionRecord[]
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

    // The net profit (so far, if the epoch is active)
    profit: number
}