import { ICoin } from "../../../core";


export interface ICoinsDialogComponent {
    installCoin(coin: ICoin): void,
    uninstallCoin(coin: ICoin): void,
    activateInstalledSearch(): void,
    deactivateInstalledSearch(): void,
    activateAvailableSearch(): void,
    deactivateAvailableSearch(): void
}