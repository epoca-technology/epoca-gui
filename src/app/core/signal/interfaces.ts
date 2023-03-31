import { ICoinsState, IKeyZoneStateEventKind, IStateType } from "../market-state";


export interface ISignalService {

    // Signal Policies Management
    getPolicies(): Promise<ISignalPolicies>,
    updatePolicies(newPolicies: ISignalPolicies, otp: string): Promise<void>,

    // Signal Records 
    getSignalRecords(startAt: number, endAt: number): Promise<ISignalRecord[]>
}







/**
 * Signal Result
 * The signal module can emmit one kind of signal at a given time.
 * After the record is broadcasted, it is stored so it can be 
 * validated from the GUI.
 *  1: Long
 * -1: Short
 */
export type ISignalResult = 1|-1;








/* Signal Policies */



/**
 * Signal Policies
 * The persistant signal object that takes care of determining
 * non-neutral trading signals.
 */
export interface ISignalPolicies {
    // Policies that will be used for potentital Longs
    long: ISignalSidePolicies,

    // Policies that will be used for potentital Shorts
    short: ISignalSidePolicies
}



/**
 * Signal Side Policies
 * Both sides have their own set of issuance and cancellation
 * policies that can be adjusted/disabled.
 */
export interface ISignalSidePolicies {
    issuance: {
        keyzone_reversal: IKeyZoneReversalIssuancePolicy
    },
    cancellation: {
        window_state: IWindowStateCancellationPolicy,
        trend: ITrendCancellationPolicy
    }
}



/**
 * Signal Policy base to be extended by issuance & cancellation
 * policies.
 */
export interface ISignalPolicy {
    // The status of the policy. if false, the policy will be skipped.
    enabled: boolean, 
}


/**
 * KeyZone Reversal Issuance Policy
 * Issuance Policy based on KeyZone Reversals and Coin States. The purpose of this
 * policy is to long when the price has dropped and is reversing or short when the
 * price has increased and is reversing.
 * It is important to note that this issuance policy cannot be disabled. If the 
 * user wishes to stop trading, it has to be done through the Trading Strategy.
 */
export interface IKeyZoneReversalIssuancePolicy extends ISignalPolicy {
    // The required coin state event. This value cannot be disabled.
    coin_state_event: IStateType,
    
    // The minimum trend sum required - If 0, the trend sum will comply automatically
    trend_sum: number,

    // The trend state required - If 0, the trend state will comply automatically
    trend_state: IStateType,

    // The volume state required - If 0, the volume state will comply automatically
    volume_state: IStateType,
}



/**
 * Window State Cancellation Policy
 * Cancellation Policy based on the state of the window. The purpose of this
 * policy is to avoid position sides when the market has already moved that
 * way strongly. For instance: avoid longs when the price has increased
 * significantly and avoid shorts when the price has decreased significantly.
 */
export interface IWindowStateCancellationPolicy extends ISignalPolicy {
    window_state: IStateType
}




/**
 * Trend Cancellation Policy
 * Cancellation Policy based on the trend sum & state. The purpose of the 
 * Prediction Model is to always prepare us for what may come next. This 
 * policy will help avoid positions that strongly contradict the trend. 
 */
export interface ITrendCancellationPolicy extends ISignalPolicy {
    trend_sum: number,
    trend_state: IStateType,
}










/* Signal Records */






/**
 * Signal Record
 * A signal record is generated whenever a non-neutral signal is 
 * detected for a coin or many.
 */
export interface ISignalRecord {
    // The timestamp at which the signal record was generated
    t: number,

    // The result of the signal
    r: ISignalResult,

    // The list of symbols included included in the signal.
    s: string[]
}












/* Signal Dataset */



/**
 * Signal Dataset
 * This object is built in order to facilitate the interaction
 * with the signal policies.
 */
export interface ISignalDataset {
    /**
     * The current predicted trend sum, if this value cannot be obtained it 
     * will be set to 0
     */
    trendSum: number,

    // The current state of the trend
    trendState: IStateType,

    // The current state of the window
    windowState: IStateType,

    // The current state of the volume
    volumeState: IStateType,

    // The state of all installed coins
    coinsState: ICoinsState,

    // The state event of the KeyZones (if any)
    keyzoneStateEvent: IKeyZoneStateEventKind|undefined
}