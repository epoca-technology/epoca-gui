import { IApiError } from "../../../core";

export interface IApiErrorsComponent {
    // Retriever
    loadErrors(): Promise<void>,

    // Navigation
    gotoIntro(): void,
    gotoRecord(record: IApiError): void,

    // API Actions
    deleteAll(): void,
    blacklistIP(ip: string): void,

    // Error Download
    downloadError(): void
}



export type IView = 'intro'|'record';