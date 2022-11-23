export interface IDashboardComponent {
    

    // Misc Helpers
    toggleTrendChart(): Promise<void>,
    displayFeaturesDialog(): void,
    displayKeyZoneDialog(): void
    
    // Nav Actions
    createNewInstance(): void,
    signOut(): void
}