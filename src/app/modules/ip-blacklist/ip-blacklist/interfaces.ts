import { IIPBlacklistRecord } from "../../../core";

export interface IIpBlacklistComponent {
    // Navigation
    displayBottomSheet(record: IIPBlacklistRecord): void,
    gotoIntro(): void,
    gotoForm(record?: IIPBlacklistRecord): void,
    
    // API Actions
    submit(): void,
    unregisterIP(ip: string): void,
}



export type IView = 'intro'|'form';