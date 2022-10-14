import { IApiError } from "../../../core";

export interface IServerComponent {
    // Navigation
    activateSectionByID(id: ISectionID): void,
    activateSection(section: ISection): Promise<void>,

    // Server
    refreshServerResources(): Promise<void>,
    updateConfig(): void,

    // API Errors
    refreshAPIErrors(): Promise<void>,
    deleteAll(): void,
    displayAPIErrorDialog(error: IApiError): void,

    // Database
    listBackupFiles(): Promise<void>,
    downloadBackup(name: string): void,

    // Misc Helpers 
    toggleSoundPreference(): Promise<void>
}





export type ISectionID = 'monitoring'|'api-errors'|'database'|'file-systems'|'memory'|'cpu'|'gpu'|'os'|
'software-versions'|'system'|'baseboard'|'bios'|'network-interfaces';



export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string,
    svgIcon?: string
}



export interface IStates {
    cpuLoad: IState,
    cpuMaxTemp: IState,
    cpuMainTemp: IState,
    cpuChipsetTemp: IState,
    cpuCoresTemp: IState[],
    cpuSocketsTemp: IState[],
    memoryUsage: IState,
    gpuLoad: IState,
    gpuTemp: IState,
    gpuMemoryTemp: IState,
    fsUsage: IState[]
}

export type IState = 'optimal'|'normal'|'average'|'warning'|'error';



export interface IServerIssues {
    issues: boolean,
    environmentError: boolean,
    candlesticksSyncError: boolean,
    timeError: boolean,
    resourceUpdateError: boolean,
    hardwareError: boolean,
    resourcesCommunicationError: string|undefined,
    errorsCommunicationError: string|undefined,
}