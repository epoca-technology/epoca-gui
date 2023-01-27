import { IPredictionResult } from "../epoch-builder"
import { IMarketState, IStateType } from "../market-state"
import { IBinancePositionSide } from "../position"
import { IPredictionState, IPredictionStateIntesity } from "../prediction"




// Service
export interface ISignalService {
    // Properties
    
    // API Actions
    getPolicies(side: IBinancePositionSide): Promise<ISignalSidePolicies>,
    updatePolicies(side: IBinancePositionSide, newPolicies: ISignalSidePolicies, otp: string): Promise<void>
}






/************************************************************************************
 * Issuance Policies                                                                *
 * The prediction model natively generates non-neutral signals. Furthermore,        *
 * the prediction state and intensity combined with other market state components   *
 * can only generate non-neutral signals.                                           *
 ************************************************************************************/
export type ITrendSumState = -1|0|1;
export interface IIssuancePolicy {
    // The status of the policy - If disabled, the policy won't be evaluated
    enabled: boolean, 

    /**
     * The trend sum, state and intensity required for it to trigger.
     * The sum is represented as follows:
     * -1: < 0
     *  0: Any Trend Sum
     *  1: > 0
     */
    trend_sum: -1|0|1,
    trend_state: IPredictionState,
    trend_intensity: IPredictionStateIntesity
}


/**
 * Technicals Issuance
 * Triggers when the trend and all technicals align.
 */
export interface ITechnicalsIssuance extends IIssuancePolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType
}



/**
 * Open Interest Issuance
 * Triggers when the trend and the open interest align.
 */
export interface IOpenInterestIssuance extends IIssuancePolicy {
    open_interest: IStateType
}



/**
 * Long Short Ratio Issuance
 * Triggers when the trend and the long/short ratio align.
 */
export interface ILongShortRatioIssuance extends IIssuancePolicy {
    long_short_ratio: IStateType
}



/**
 * Technicals Open Interest Issuance
 * Triggers when the trend, some technicals and the open interest align.
 */
export interface ITechnicalsOpenInterestIssuance extends IIssuancePolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType,
    open_interest: IStateType
}


/**
 * Technicals Long Short Ratio Issuance
 * Triggers when the trend, some technicals and the long/short ratio align.
 */
export interface ITechnicalsLongShortRatioIssuance extends IIssuancePolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType,
    long_short_ratio: IStateType
}


/**
 * Open Interest Long/Short Ratio Issuance
 * Triggers when the trend, the open interest and the long/short ratio align.
 */
export interface IOpenInterestLongShortRatioIssuance extends IIssuancePolicy {
    open_interest: IStateType,
    long_short_ratio: IStateType
}



/**
 * Issuance Policies
 * The object that packs all the issuance policies into a single argument.
 */
export interface IIssuancePolicies {
    technicals: ITechnicalsIssuance,
    open_interest: IOpenInterestIssuance,
    long_short_ratio: ILongShortRatioIssuance,
    technicals_open_interest: ITechnicalsOpenInterestIssuance,
    technicals_long_short_ratio: ITechnicalsLongShortRatioIssuance,
    open_interest_long_short_ratio: IOpenInterestLongShortRatioIssuance,
}
export type IIssuanceBasedPolicy = ITechnicalsIssuance|IOpenInterestIssuance|ILongShortRatioIssuance|ITechnicalsOpenInterestIssuance|
ITechnicalsLongShortRatioIssuance|IOpenInterestLongShortRatioIssuance;
export type IIssuancePolicyNames = 
"technicals"|"open_interest"|"long_short_ratio"|
"technicals_open_interest"|"technicals_long_short_ratio"|
"open_interest_long_short_ratio";
export type ITechnicalsBasedIssuancePolicy = ITechnicalsIssuance|ITechnicalsOpenInterestIssuance|ITechnicalsLongShortRatioIssuance;








/***********************************************************************
 * Cancellation Policies                                               *
 * Any non-neutral signal can be cancelled if any of the cancellation  *
 * policies is met.                                                    *
 ***********************************************************************/
export interface ICancellationPolicy {
    // The status of the policy - If disabled, the policy won't be evaluated
    enabled: boolean, 

}



/**
 * Window Cancellation
 * Triggers when the market has already moved significantly in favor of
 * the signal type.
 */
export interface IWindowCancellation extends ICancellationPolicy {
    window: IStateType
}




/**
 * Technicals Cancellation
 * Triggers when the technical analysis indicators are all against the
 * signal type.
 */
export interface ITechnicalsCancellation extends ICancellationPolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType
}



/**
 * Open Interest Cancellation
 * Triggers when the open interest is against the signal type.
 */
export interface IOpenInterestCancellation extends ICancellationPolicy {
    open_interest: IStateType
}




/**
 * Long/Short Cancellation
 * Triggers when the long/short ratio is against the signal type.
 */
export interface ILongShortRatioCancellation extends ICancellationPolicy {
    long_short_ratio: IStateType
}




/**
 * Technicals Open Interest Cancellation
 * Triggers when some technical analysis indicators and the open interest
 * are against the signal type.
 */
export interface ITechnicalsOpenInterestCancellation extends ICancellationPolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType,
    open_interest: IStateType
}




/**
 * Technicals Long/Short Cancellation
 * Triggers when some technical analysis indicators and the long/short ratio
 * are against the signal type.
 */
export interface ITechnicalsLongShortRatioCancellation extends ICancellationPolicy {
    ta_30m: IStateType,
    ta_1h: IStateType,
    ta_2h: IStateType,
    ta_4h: IStateType,
    ta_1d: IStateType,
    long_short_ratio: IStateType
}




/**
 * Open Interest Long/Short Cancellation
 * Triggers when the open interest and the long/short ratio are against the 
 * signal type.
 */
export interface IOpenInterestLongShortRatioCancellation extends ICancellationPolicy {
    open_interest: IStateType,
    long_short_ratio: IStateType
}




/**
 * Cancellation Policies
 * The object that packs all the cancellation policies into a single argument.
 */
export interface ICancellationPolicies {
    window: IWindowCancellation,
    technicals: ITechnicalsCancellation,
    open_interest: IOpenInterestCancellation,
    long_short_ratio: ILongShortRatioCancellation,
    technicals_open_interest: ITechnicalsOpenInterestCancellation,
    technicals_long_short_ratio: ITechnicalsLongShortRatioCancellation,
    open_interest_long_short_ratio: IOpenInterestLongShortRatioCancellation
}
export type ICancellationPolicyNames = 
"window"|"technicals"|"open_interest"|"long_short_ratio"|
"technicals_open_interest"|"technicals_long_short_ratio"|
"open_interest_long_short_ratio";
export type ICancellationBasedPolicy = IWindowCancellation|ITechnicalsCancellation|IOpenInterestCancellation|ILongShortRatioCancellation|
ITechnicalsOpenInterestCancellation|ITechnicalsLongShortRatioCancellation|IOpenInterestLongShortRatioCancellation;
export type ITechnicalsBasedCancellationPolicy = ITechnicalsCancellation|ITechnicalsOpenInterestCancellation|ITechnicalsLongShortRatioCancellation;














/**********************************************************************
 * Signal Side Policies                                               *
 * The object that wraps all the issuance and cancellation policies.  *
 **********************************************************************/
export interface ISignalSidePolicies {
    issuance: IIssuancePolicies,
    cancellation: ICancellationPolicies
}





/*************************************************************************
 * Signal Policies                                                       *
 * Both sides' policies are stored in the database under the long/short  *
 * keys and are always updated together.                                 *
 *************************************************************************/
export interface ISignalPolicies {
    long: ISignalSidePolicies,
    short: ISignalSidePolicies
}










/******************************************************************
 * Signal Dataset                                                 *
 * In order for the system to generate non-neutral signals, a     *
 * dataset containing all required data must be built every time  *
 * a new prediction is generated.                                 *
 ******************************************************************/
export interface ISignalDataset {
    // The result of the latest prediction
    result: IPredictionResult,

    // The current trend sum, state and intensity
    trendSum: number,
    trendState: IPredictionState,
    trendStateIntensity: IPredictionStateIntesity,

    // The current market state
    marketState: IMarketState
}










/***************************
 * GUI Specific Interfaces *
 ***************************/






// Policy Category
export type ISignalPolicyCategory = "issuance"|"cancellation";




// Policy Item ID
export type ISignalPolicyItemID = "trend_sum"|"trend_state"|"ta_30m"|"ta_1h"|"ta_2h"|"ta_4h"|"ta_1d"|"open_interest"|"long_short_ratio"|"window";