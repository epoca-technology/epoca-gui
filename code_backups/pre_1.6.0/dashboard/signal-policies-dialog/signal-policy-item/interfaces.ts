import { 
    ISignalPolicyItemID, 
    ISignalPolicyCategory, 
    ITrendSumState,
    IPredictionState,
    IStateType,
    IPredictionStateIntesity,
    IIssuancePolicyNames,
    ICancellationPolicyNames
} from "../../../../core";




// Component
export interface ISignalPolicyItemComponent {
    _valueChanged(newValue: ITrendSumState|IPredictionState|IStateType, newValue2?: IPredictionStateIntesity): void
}





/**
 * Whenever a policy item changes, it outputs a payload in the following format.
 */
export interface IPolicyChangePayload {
    category: ISignalPolicyCategory,
    policyID: IIssuancePolicyNames|ICancellationPolicyNames,
    id: ISignalPolicyItemID,
    payload: {
        newValue: ITrendSumState|IPredictionState|IStateType,
        newValue2?: IPredictionStateIntesity
    }
}