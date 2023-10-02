import { ICandlestick } from "../../../candlestick"
import { ISplitStates, IStateType } from "../_shared"








/**
 * Configuration
 * The Window' Module Configuration that can be managed from the GUI.
 */
export interface IWindowStateConfiguration {
    // The % change required for the window splits to have a state (1 or -1)
    requirement: number,

    // The % change required for the window splits to have a strong state (2 or -2)
    strongRequirement: number
}





/**
 * State
 * This is the object that is generated when the Window State is calculated.
 */
export interface IWindowState {
    // The state of the window
    s: IStateType,

    // The split states payload
    ss: ISplitStates,

    // The candlesticks that comprise the window
    w: ICandlestick[]
}