export interface IServerComponent {
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