export interface IServerComponent {
    activateSectionByID(id: ISectionID): void,
    activateSection(section: ISection): Promise<void>,
    refresh(): Promise<void>,
    updateConfig(): void
}





export type ISectionID = 'monitoring'|'file-systems'|'memory'|'cpu'|'gpu'|'os'|
'software-versions'|'running-services'|'system'|'baseboard'|'bios'|'network-interfaces';



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