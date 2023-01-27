import { IPolicyChangePayload } from "./signal-policy-item";


export interface ISignalPoliciesDialogComponent {
    valueChanged(change: IPolicyChangePayload): void,
    updatePolicies(): void,
    displayTooltip(): void,
    close(): void
}