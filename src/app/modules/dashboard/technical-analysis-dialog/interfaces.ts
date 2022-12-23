import { ITAIntervalID, ITAState } from "../../../core";


export interface ITechnicalAnalysisDialogComponent {
    close(): void
}




export interface ITechnicalAnalysisDialogData {
    id: ITAIntervalID,
    state: ITAState
}