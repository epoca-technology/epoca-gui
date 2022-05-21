import { IKerasModelSummary } from "../../../../core";



export interface IKerasModelDialogComponent {
    close(): void
}




export interface IKerasModelDialogData {
    id: string,
    description: string,
    summary: IKerasModelSummary
}