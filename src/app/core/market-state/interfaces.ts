import { 
    ICoinState,
    ICoinsCompressedState,
    ICoinsConfiguration,
    ICoinsState, 
    ICoinsSummary, 
    IFullLiquidityState, 
    IKeyZoneFullState, 
    IKeyZoneState, 
    IKeyZoneStateEvent, 
    IKeyZonesConfiguration, 
    ILiquidityConfiguration, 
    IMinifiedLiquidityState, 
    IMinifiedReversalState, 
    IReversalCoinsStates, 
    IReversalConfiguration, 
    IReversalState, 
    ISplitStateID, 
    IVolumeState, 
    IVolumeStateIntensity, 
    IWindowState, 
    IWindowStateConfiguration
} from "./submodules";





// Service
export interface IMarketStateService {
    // Properties
    colors: IMarketStateColors,
    marketStates: {[result: string|number]: string},
    icons: {[result: string|number]: string},
    coinStateIcons: {[result: string|number]: string},
    splits: ISplitStateID[],
    splitNames: {[splitID: string]: string},
    kzAbove: {[volIntensity: number]: string},
    kzBelow: {[volIntensity: number]: string},
    kzVolIntensityIcons: {[volIntensity: number]: string},
    peakColors: {[liqSide: string]: {[liqIntensity: number]: string}},
    peakWidth: {[layout: string]: {[liqIntensity: number]: number}},

    // Window Management
    getWindowConfiguration(): Promise<IWindowStateConfiguration>,
    updateWindowConfiguration(newConfiguration: IWindowStateConfiguration, otp: string): Promise<void>,

    // Volume Management
    getFullVolumeState(): Promise<IVolumeState>,

    // Liquidity Management
    getFullLiquidityState(): Promise<IFullLiquidityState>,
    getLiquidityConfiguration(): Promise<ILiquidityConfiguration>,
    updateLiquidityConfiguration(newConfiguration: ILiquidityConfiguration, otp: string): Promise<void>,

    // KeyZones Management
    calculateKeyZoneState(): Promise<IKeyZoneFullState>,
    listKeyZoneEvents(startAt: number, endAt: number): Promise<IKeyZoneStateEvent[]>,
    getKeyZonesConfiguration(): Promise<IKeyZonesConfiguration>,
    updateKeyZonesConfiguration(newConfiguration: IKeyZonesConfiguration, otp: string): Promise<void>,

    // Coins Management
    getCoinsSummary(): Promise<ICoinsSummary>,
    installCoin(symbol: string, otp: string): Promise<ICoinsSummary>,
    uninstallCoin(symbol: string, otp: string): Promise<ICoinsSummary>,
    getCoinFullState(symbol: string, btcPrice: boolean): Promise<ICoinState>,
    getCoinsCompressedState(): Promise<ICoinsCompressedState>,
    getCoinsBTCCompressedState(): Promise<ICoinsCompressedState>,
    getCoinsConfiguration(): Promise<ICoinsConfiguration>,
    updateCoinsConfiguration(newConfiguration: ICoinsConfiguration, otp: string): Promise<void>,
    getBaseAssetName(symbol: string): string,

    // Reversal Management
    getReversalState(id: number): Promise<IReversalState>,
    getReversalCoinsStates(id: number): Promise<IReversalCoinsStates>,
    getReversalConfiguration(): Promise<IReversalConfiguration>,
    updateReversalConfiguration(newConfiguration: IReversalConfiguration, otp: string): Promise<void>
}






/**
 * Market State Colors
 * These are the colors that should be used to display state for any of the indicators.
 */
export interface IMarketStateColors {
    // Sideways 
    sideways: string,

    // Increase
    increase_0: string,
    increase_1: string,
    increase_2: string,

    // Decrease
    decrease_0: string,
    decrease_1: string,
    decrease_2: string,
}






/**
 * Market State Object
 * The market state object built whenever the candlesticks are synced.
 */
export interface IMarketState {
    window: IWindowState,
    volume: IVolumeStateIntensity,
    liquidity: IMinifiedLiquidityState,
    keyzones: IKeyZoneState,
    coins: ICoinsState,
    coinsBTC: ICoinsState,
    reversal: IMinifiedReversalState
}