

// Service
export interface IPositionsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // Navigation
    activateSection(sectionID: ISectionID): Promise<void>,

    // View Size Management
    changeViewSize(): void,
    
    // Misc Helpers
    displayPredictionModel(): void,
}




/**
 * Navigation
 */
export type ISectionID = "summary"|"pnl"|"fees"|"amounts"|"prices"|"trades"|"history";
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
    svgIcon?: string
}






/**
 * View Size
 * Even though all the trades within the Epoch are downloaded onInit, 
 * the data can be viewed in windows.
 */
export type IViewSize = "24 hours"|"48 hours"|"72 hours"|"1 week"|"2 weeks"|"1 month"|"2 months"|"3 months"|"all";